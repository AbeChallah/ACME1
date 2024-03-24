const db = require('../models');
const Users = db.users;

const Products = db.products;

const PurchaseOrders = db.purchase_orders;

const Suppliers = db.suppliers;

const ProductsData = [
  {
    name: 'Gustav Kirchhoff',

    description:
      'Always two there are, no more, no less. A master and an apprentice.',

    // type code here for "images" field

    price: 33.31,

    stock_level: 4,
  },

  {
    name: 'Carl Linnaeus',

    description: 'Feel the force!',

    // type code here for "images" field

    price: 43.06,

    stock_level: 2,
  },

  {
    name: 'Frederick Sanger',

    description:
      'Soon will I rest, yes, forever sleep. Earned it I have. Twilight is upon me, soon night must fall.',

    // type code here for "images" field

    price: 93.84,

    stock_level: 3,
  },

  {
    name: 'Edward Teller',

    description: 'Good relations with the Wookiees, I have.',

    // type code here for "images" field

    price: 95.59,

    stock_level: 7,
  },

  {
    name: 'Albrecht von Haller',

    description: 'Hmm. In the end, cowards are those who follow the dark side.',

    // type code here for "images" field

    price: 32.89,

    stock_level: 3,
  },
];

const PurchaseOrdersData = [
  {
    order_date: new Date('2023-05-07'),

    status: 'Cancelled',

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },

  {
    order_date: new Date('2023-08-26'),

    status: 'Shipped',

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },

  {
    order_date: new Date('2023-11-07'),

    status: 'Cancelled',

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },

  {
    order_date: new Date('2024-01-15'),

    status: 'Pending',

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },

  {
    order_date: new Date('2023-12-31'),

    status: 'Cancelled',

    // type code here for "relation_many" field

    // type code here for "relation_one" field
  },
];

const SuppliersData = [
  {
    company_name: 'Let me tell ya',

    contact_name: 'Turd gone wrong',

    contact_email: 'So I was walking Oscar',

    phone: '1-954-702-4651 x61905',

    address: '3874 Millard Rest, Corrieberg, IL 73340',
  },

  {
    company_name: "Goin' hog huntin'",

    contact_name: 'Turd gone wrong',

    contact_email: 'I want my damn cart back',

    phone: '313-409-2906 x1205',

    address: 'Apt. 247 432 Garth Island, Ellanview, RI 01220-7094',
  },

  {
    company_name: 'Texas!',

    contact_name: 'Might be DQ time',

    contact_email: "Goin' hog huntin'",

    phone: '(329) 677-4466 x07696',

    address:
      'Suite 126 185 Wintheiser Roads, North Destinymouth, MD 79404-4799',
  },

  {
    company_name: "C'mon Naomi",

    contact_name: 'I got that scurvy',

    contact_email: 'Might be DQ time',

    phone: '1-481-665-4663 x166',

    address: '627 Dorsey Shoals, Port Barretttown, NY 24153-0657',
  },

  {
    company_name: 'Standby',

    contact_name: 'That damn diabetes',

    contact_email: 'That damn Bill Stull',

    phone: '1-273-875-3832 x7420',

    address: '8763 Kub Turnpike, New Catalinaton, RI 19301',
  },
];

// Similar logic for "relation_many"

// Similar logic for "relation_many"

async function associatePurchaseOrderWithSupplier() {
  const relatedSupplier0 = await Suppliers.findOne({
    offset: Math.floor(Math.random() * (await Suppliers.count())),
  });
  const PurchaseOrder0 = await PurchaseOrders.findOne({
    order: [['id', 'ASC']],
    offset: 0,
  });
  if (PurchaseOrder0?.setSupplier) {
    await PurchaseOrder0.setSupplier(relatedSupplier0);
  }

  const relatedSupplier1 = await Suppliers.findOne({
    offset: Math.floor(Math.random() * (await Suppliers.count())),
  });
  const PurchaseOrder1 = await PurchaseOrders.findOne({
    order: [['id', 'ASC']],
    offset: 1,
  });
  if (PurchaseOrder1?.setSupplier) {
    await PurchaseOrder1.setSupplier(relatedSupplier1);
  }

  const relatedSupplier2 = await Suppliers.findOne({
    offset: Math.floor(Math.random() * (await Suppliers.count())),
  });
  const PurchaseOrder2 = await PurchaseOrders.findOne({
    order: [['id', 'ASC']],
    offset: 2,
  });
  if (PurchaseOrder2?.setSupplier) {
    await PurchaseOrder2.setSupplier(relatedSupplier2);
  }

  const relatedSupplier3 = await Suppliers.findOne({
    offset: Math.floor(Math.random() * (await Suppliers.count())),
  });
  const PurchaseOrder3 = await PurchaseOrders.findOne({
    order: [['id', 'ASC']],
    offset: 3,
  });
  if (PurchaseOrder3?.setSupplier) {
    await PurchaseOrder3.setSupplier(relatedSupplier3);
  }

  const relatedSupplier4 = await Suppliers.findOne({
    offset: Math.floor(Math.random() * (await Suppliers.count())),
  });
  const PurchaseOrder4 = await PurchaseOrders.findOne({
    order: [['id', 'ASC']],
    offset: 4,
  });
  if (PurchaseOrder4?.setSupplier) {
    await PurchaseOrder4.setSupplier(relatedSupplier4);
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Products.bulkCreate(ProductsData);

    await PurchaseOrders.bulkCreate(PurchaseOrdersData);

    await Suppliers.bulkCreate(SuppliersData);

    await Promise.all([
      // Similar logic for "relation_many"

      // Similar logic for "relation_many"

      await associatePurchaseOrderWithSupplier(),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});

    await queryInterface.bulkDelete('purchase_orders', null, {});

    await queryInterface.bulkDelete('suppliers', null, {});
  },
};
