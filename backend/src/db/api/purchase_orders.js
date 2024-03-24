const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class Purchase_ordersDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const purchase_orders = await db.purchase_orders.create(
      {
        id: data.id || undefined,

        order_date: data.order_date || null,
        status: data.status || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await purchase_orders.setSupplier(data.supplier || null, {
      transaction,
    });

    await purchase_orders.setProducts(data.products || [], {
      transaction,
    });

    return purchase_orders;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const purchase_ordersData = data.map((item, index) => ({
      id: item.id || undefined,

      order_date: item.order_date || null,
      status: item.status || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const purchase_orders = await db.purchase_orders.bulkCreate(
      purchase_ordersData,
      { transaction },
    );

    // For each item created, replace relation files

    return purchase_orders;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const purchase_orders = await db.purchase_orders.findByPk(
      id,
      {},
      { transaction },
    );

    await purchase_orders.update(
      {
        order_date: data.order_date || null,
        status: data.status || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await purchase_orders.setSupplier(data.supplier || null, {
      transaction,
    });

    await purchase_orders.setProducts(data.products || [], {
      transaction,
    });

    return purchase_orders;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const purchase_orders = await db.purchase_orders.findByPk(id, options);

    await purchase_orders.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await purchase_orders.destroy({
      transaction,
    });

    return purchase_orders;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const purchase_orders = await db.purchase_orders.findOne(
      { where },
      { transaction },
    );

    if (!purchase_orders) {
      return purchase_orders;
    }

    const output = purchase_orders.get({ plain: true });

    output.products = await purchase_orders.getProducts({
      transaction,
    });

    output.supplier = await purchase_orders.getSupplier({
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
    let include = [
      {
        model: db.suppliers,
        as: 'supplier',
      },

      {
        model: db.products,
        as: 'products',
        through: filter.products
          ? {
              where: {
                [Op.or]: filter.products.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.products ? true : null,
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.order_dateRange) {
        const [start, end] = filter.order_dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            order_date: {
              ...where.order_date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            order_date: {
              ...where.order_date,
              [Op.lte]: end,
            },
          };
        }
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

      if (filter.status) {
        where = {
          ...where,
          status: filter.status,
        };
      }

      if (filter.supplier) {
        var listItems = filter.supplier.split('|').map((item) => {
          return Utils.uuid(item);
        });

        where = {
          ...where,
          supplierId: { [Op.or]: listItems },
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
          count: await db.purchase_orders.count({
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
      : await db.purchase_orders.findAndCountAll({
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
          Utils.ilike('purchase_orders', 'order_date', query),
        ],
      };
    }

    const records = await db.purchase_orders.findAll({
      attributes: ['id', 'order_date'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['order_date', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.order_date,
    }));
  }
};
