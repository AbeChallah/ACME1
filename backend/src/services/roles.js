const db = require('../db/models');
const RolesDBApi = require('../db/api/roles');
const processFile = require('../middlewares/upload');
const csv = require('csv-parser');
const axios = require('axios');
const config = require('../config');
const stream = require('stream');

module.exports = class RolesService {
  static async create(data, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      await RolesDBApi.create(data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async bulkImport(req, res, sendInvitationEmails = true, host) {
    const transaction = await db.sequelize.transaction();

    try {
      await processFile(req, res);
      const bufferStream = new stream.PassThrough();
      const results = [];

      await bufferStream.end(Buffer.from(req.file.buffer, 'utf-8')); // convert Buffer to Stream

      await new Promise((resolve, reject) => {
        bufferStream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            console.log('CSV results', results);
            resolve();
          })
          .on('error', (error) => reject(error));
      });

      await RolesDBApi.bulkImport(results, {
        transaction,
        ignoreDuplicates: true,
        validate: true,
        currentUser: req.currentUser,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(data, id, currentUser) {
    const transaction = await db.sequelize.transaction();
    try {
      let roles = await RolesDBApi.findBy({ id }, { transaction });

      if (!roles) {
        throw new ValidationError('rolesNotFound');
      }

      await RolesDBApi.update(id, data, {
        currentUser,
        transaction,
      });

      await transaction.commit();
      return roles;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async remove(id, currentUser) {
    const transaction = await db.sequelize.transaction();

    try {
      if (currentUser.app_role?.name !== config.roles.admin) {
        throw new ValidationError('errors.forbidden.message');
      }

      await RolesDBApi.remove(id, {
        currentUser,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async addRoleInfo(roleId, userId, key, widgetId, currentUser) {
    const regexExpForUuid =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
    const widgetIdIsUUID = regexExpForUuid.test(widgetId);

    const transaction = await db.sequelize.transaction();
    let role;
    if (roleId) {
      role = await RolesDBApi.findBy({ id: roleId }, { transaction });
    } else {
      role = await RolesDBApi.findBy({ name: 'User' }, { transaction });
    }

    if (!role) {
      throw new ValidationError('rolesNotFound');
    }

    try {
      let customization = {};
      try {
        customization = JSON.parse(role.role_customization || '{}');
      } catch (e) {
        console.log(e);
      }

      if (widgetIdIsUUID && Array.isArray(customization[key])) {
        const el = customization[key].find((e) => e === widgetId);
        !el ? customization[key].unshift(widgetId) : null;
      }

      if (widgetIdIsUUID && !customization[key]) {
        customization[key] = [widgetId];
      }

      const newRole = await RolesDBApi.update(
        role.id,
        {
          role_customization: JSON.stringify(customization),
          name: role.name,
          permissions: role.permissions,
        },
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();

      return newRole;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async removeRoleInfoById(infoId, roleId, key, currentUser) {
    const transaction = await db.sequelize.transaction();

    let role;
    if (roleId) {
      role = await RolesDBApi.findBy({ id: roleId }, { transaction });
    } else {
      role = await RolesDBApi.findBy({ name: 'User' }, { transaction });
    }
    if (!role) {
      await transaction.rollback();
      throw new ValidationError('rolesNotFound');
    }

    let customization = {};
    try {
      customization = JSON.parse(role.role_customization || '{}');
    } catch (e) {
      console.log(e);
    }

    customization[key] = customization[key].filter((item) => item !== infoId);

    const response = await axios.delete(
      `${config.flHost}/${config.project_uuid}/project_customization_widgets/${infoId}.json`,
    );
    const { status } = await response;
    try {
      const result = await RolesDBApi.update(
        role.id,
        {
          role_customization: JSON.stringify(customization),
          name: role.name,
          permissions: role.permissions,
        },
        {
          currentUser,
          transaction,
        },
      );

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getRoleInfoByKey(key, roleId) {
    const transaction = await db.sequelize.transaction();

    let role;
    try {
      if (roleId) {
        role = await RolesDBApi.findBy({ id: roleId }, { transaction });
      } else {
        role = await RolesDBApi.findBy({ name: 'User' }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    let customization = '{}';

    try {
      customization = JSON.parse(role.role_customization || '{}');
    } catch (e) {
      console.log(e);
    }

    if (key === 'widgets') {
      const widgets = customization[key] || [];
      const widgetArray = widgets.map((widget) => {
        return axios.get(
          `${config.flHost}/${config.project_uuid}/project_customization_widgets/${widget}.json`,
        );
      });
      const widgetResults = await Promise.allSettled(widgetArray);

      const fulfilledWidgets = widgetResults.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value.data;
        }
      });

      const widgetsResults = [];

      if (Array.isArray(fulfilledWidgets)) {
        for (const widget of fulfilledWidgets) {
          let result = [];
          try {
            result = await db.sequelize.query(widget.query);
          } catch (e) {
            console.log(e);
          }

          if (result[0] && result[0].length) {
            const key = Object.keys(result[0][0])[0];
            const value =
              widget.widget_type === 'scalar' ? result[0][0][key] : result[0];
            const widgetData = JSON.parse(widget.data);
            widgetsResults.push({ ...widget, ...widgetData, value });
          } else {
            widgetsResults.push({ ...widget, value: null });
          }
        }
      }
      return widgetsResults;
    }
    return customization[key];
  }
};
