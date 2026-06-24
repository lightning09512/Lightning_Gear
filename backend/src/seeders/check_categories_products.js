const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Category, Product, ProductImage } = require('../models');

async function checkCategoriesProducts() {
  try {
    await sequelize.authenticate();
    const categories = await Category.findAll();
    for (const cat of categories) {
      const count = await Product.count({ where: { categoryId: cat.id } });
      console.log(`Category: ${cat.name} (${cat.slug}, ID: ${cat.id}) -> ${count} products`);
      if (count > 0) {
        const samples = await Product.findAll({
          where: { categoryId: cat.id },
          limit: 3,
          include: [{ model: ProductImage, as: 'images', limit: 1 }]
        });
        for (const s of samples) {
          console.log(`  - [ID: ${s.id}] ${s.name} (Price: ${s.price}, Image: ${s.images?.[0]?.imageUrl})`);
        }
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkCategoriesProducts();
