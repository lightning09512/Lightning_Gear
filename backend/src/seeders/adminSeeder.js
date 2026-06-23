const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const sequelize = require('../config/database');
const { User } = require('../models');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const existingAdmin = await User.findOne({ where: { email: 'admin@lightninggear.com' } });
    if (existingAdmin) {
      console.log('⚡ Admin account already exists');
      process.exit(0);
    }

    await User.create({
      username: 'Admin',
      email: 'admin@lightninggear.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    console.log('✅ Admin account created successfully');
    console.log('   Email: admin@lightninggear.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
}

seedAdmin();
