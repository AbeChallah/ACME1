const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const purchase_orders = sequelize.define(
    'purchase_orders',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      order_date: {
        type: DataTypes.DATE,
      },

      status: {
        type: DataTypes.ENUM,

        values: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  purchase_orders.associate = (db) => {
    db.purchase_orders.belongsToMany(db.products, {
      as: 'products',
      foreignKey: {
        name: 'purchase_orders_productsId',
      },
      constraints: false,
      through: 'purchase_ordersProductsProducts',
    });

    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    //end loop

    db.purchase_orders.belongsTo(db.suppliers, {
      as: 'supplier',
      foreignKey: {
        name: 'supplierId',
      },
      constraints: false,
    });

    db.purchase_orders.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.purchase_orders.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return purchase_orders;
};
