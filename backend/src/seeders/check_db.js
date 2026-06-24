const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Category, Product, ProductImage } = require('../models');

async function checkDb() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    
    const categoryCount = await Category.count();
    const productCount = await Product.count();
    const imageCount = await ProductImage.count();
    
    console.log(`Categories: ${categoryCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Images: ${imageCount}`);
    
    const categories = await Category.findAll({ raw: true });
    console.log('\n--- Categories ---');
    console.dir(categories);
    
    const sampleProducts = await Product.findAll({
      limit: 15,
      include: [{ model: ProductImage, as: 'images', limit: 1 }],
      order: [['id', 'DESC']]
    });
    
    console.log('\n--- Sample Products (Latest 15) ---');
    for (const p of sampleProducts) {
      console.log(`ID: ${p.id}, Name: ${p.name}, CategoryId: ${p.categoryId}, Price: ${p.price}, Image: ${p.images?.[0]?.imageUrl}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkDb();
