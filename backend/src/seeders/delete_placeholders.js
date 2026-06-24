const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Product, ProductImage, ProductSpec, Review } = require('../models');

async function deletePlaceholders() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    // Find all product images with placehold.co in their URL
    const placeholderImages = await ProductImage.findAll({
      where: {
        imageUrl: { [Op.like]: '%placehold.co%' }
      }
    });

    const productIdsToDelete = [...new Set(placeholderImages.map(img => img.productId))];
    console.log(`Found ${productIdsToDelete.length} products with placeholder images.`);

    if (productIdsToDelete.length > 0) {
      // Delete reviews, specs, images, and the products
      await Review.destroy({ where: { productId: productIdsToDelete } });
      await ProductSpec.destroy({ where: { productId: productIdsToDelete } });
      await ProductImage.destroy({ where: { productId: productIdsToDelete } });
      const deletedCount = await Product.destroy({ where: { id: productIdsToDelete } });
      console.log(`Deleted ${deletedCount} products and their associated details.`);
    }

    console.log('Cleanup completed successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

deletePlaceholders();
