const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Category, Product, ProductImage } = require('../models');

async function checkPCImages() {
  try {
    await sequelize.authenticate();
    const cat = await Category.findOne({ where: { slug: 'pc-gaming' } });
    if (cat) {
      const sample = await Product.findOne({
        where: { categoryId: cat.id },
        include: [{ model: ProductImage, as: 'images' }]
      });
      console.log('Sample PC Gaming Product:');
      console.log(`Name: ${sample?.name}`);
      console.log(`Images:`, sample?.images?.map(img => img.imageUrl));
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkPCImages();
