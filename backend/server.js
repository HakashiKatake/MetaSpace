require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const app = require('./src/config/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Connected to MySQL successfully.');

    // In development only — syncs schema (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DB] Schema synchronized.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] MetaSpace API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err.message);
    process.exit(1);
  }
}

startServer();
