const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Category, Product, ProductImage } = require('../models');

async function checkMonitors() {
  try {
    await sequelize.authenticate();
    const cat = await Category.findOne({ where: { slug: 'man-hinh' } });
    if (cat) {
      const count = await Product.count({ where: { categoryId: cat.id } });
      console.log(`Màn hình products: ${count}`);
      const samples = await Product.findAll({
        where: { categoryId: cat.id },
        limit: 12,
        include: [{ model: ProductImage, as: 'images', limit: 1 }]
      });
      for (const s of samples) {
        console.log(`  - [ID: ${s.id}] ${s.name} (Price: ${s.price}, Image: ${s.images?.[0]?.imageUrl})`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkMonitors();
