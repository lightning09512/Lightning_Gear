const http = require('http');
const app = require('./app');
const sequelize = require('./config/database');
const { initSocket } = require('./config/socket');
require('dotenv').config();

// Import models to sync
require('./models');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
async function startServer() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (use { alter: true } in dev for auto-migration)
    await sequelize.sync({ alter: false });
    console.log('✅ Database models synced.');

    // Auto-seed if database is empty
    const { Category, User } = require('./models');
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      console.log('🔄 No categories found. Auto-seeding database...');
      const seedData = require('./seeders/dataSeeder');
      await seedData();
    }
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      console.log('🔄 No admin user found. Auto-seeding admin account...');
      const seedAdmin = require('./seeders/adminSeeder');
      await seedAdmin();
    }

    // Start listening
    server.listen(PORT, () => {
      console.log(`⚡ NK Gear API running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
