const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class SuppliersDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const suppliers = await db.suppliers.create(
      {
        id: data.id || undefined,

        company_name: data.company_name || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        phone: data.phone || null,
        address: data.address || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    return suppliers;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const suppliersData = data.map((item, index) => ({
      id: item.id || undefined,

      company_name: item.company_name || null,
      contact_name: item.contact_name || null,
      contact_email: item.contact_email || null,
      phone: item.phone || null,
      address: item.address || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const suppliers = await db.suppliers.bulkCreate(suppliersData, {
      transaction,
    });

    // For each item created, replace relation files

    return suppliers;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const suppliers = await db.suppliers.findByPk(id, {}, { transaction });

    await suppliers.update(
      {
        company_name: data.company_name || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        phone: data.phone || null,
        address: data.address || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    return suppliers;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const suppliers = await db.suppliers.findByPk(id, options);

    await suppliers.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await suppliers.destroy({
      transaction,
    });

    return suppliers;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const suppliers = await db.suppliers.findOne({ where }, { transaction });

    if (!suppliers) {
      return suppliers;
    }

    const output = suppliers.get({ plain: true });

    output.purchase_orders_supplier =
      await suppliers.getPurchase_orders_supplier({
        transaction,
      });

    return output;
  }

  static async findAll(filter, options) {
    var limit = filter.limit || 0;
    var offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    var orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.company_name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'suppliers',
            'company_name',
            filter.company_name,
          ),
        };
      }

      if (filter.contact_name) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'suppliers',
            'contact_name',
            filter.contact_name,
          ),
        };
      }

      if (filter.contact_email) {
        where = {
          ...where,
          [Op.and]: Utils.ilike(
            'suppliers',
            'contact_email',
            filter.contact_email,
          ),
        };
      }

      if (filter.phone) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('suppliers', 'phone', filter.phone),
        };
      }

      if (filter.address) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('suppliers', 'address', filter.address),
        };
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = options?.countOnly
      ? {
          rows: [],
          count: await db.suppliers.count({
            where,
            include,
            distinct: true,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order:
              filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction,
          }),
        }
      : await db.suppliers.findAndCountAll({
          where,
          include,
          distinct: true,
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
          order:
            filter.field && filter.sort
              ? [[filter.field, filter.sort]]
              : [['createdAt', 'desc']],
          transaction,
        });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('suppliers', 'company_name', query),
        ],
      };
    }

    const records = await db.suppliers.findAll({
      attributes: ['id', 'company_name'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['company_name', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.company_name,
    }));
  }
};
