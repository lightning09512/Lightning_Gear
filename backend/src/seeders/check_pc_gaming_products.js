const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Category, Product, ProductImage } = require('../models');

async function checkPC() {
  try {
    await sequelize.authenticate();
    const cat = await Category.findOne({ where: { slug: 'pc-gaming' } });
    if (cat) {
      const count = await Product.count({ where: { categoryId: cat.id } });
      console.log(`PC Gaming products: ${count}`);
      const products = await Product.findAll({ where: { categoryId: cat.id } });
      for (const p of products) {
        console.log(`  - [ID: ${p.id}] ${p.name} (Price: ${p.price})`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkPC();
