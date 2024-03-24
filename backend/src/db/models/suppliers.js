const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const suppliers = sequelize.define(
    'suppliers',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      company_name: {
        type: DataTypes.TEXT,
      },

      contact_name: {
        type: DataTypes.TEXT,
      },

      contact_email: {
        type: DataTypes.TEXT,
      },

      phone: {
        type: DataTypes.TEXT,
      },

      address: {
        type: DataTypes.TEXT,
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

  suppliers.associate = (db) => {
    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    db.suppliers.hasMany(db.purchase_orders, {
      as: 'purchase_orders_supplier',
      foreignKey: {
        name: 'supplierId',
      },
      constraints: false,
    });

    //end loop

    db.suppliers.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.suppliers.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return suppliers;
};
