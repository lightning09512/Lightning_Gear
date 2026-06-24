const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { Brand } = require('../models');

async function checkBrands() {
  try {
    await sequelize.authenticate();
    const brands = await Brand.findAll({ raw: true });
    console.log('Brands in database:');
    console.dir(brands);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkBrands();
