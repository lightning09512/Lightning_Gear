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
