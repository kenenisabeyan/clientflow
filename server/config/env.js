const dotenv = require('dotenv');
const path = require('path');

// Load .env from the current directory (server folder)
dotenv.config();

// Debugging (remove later)
console.log('Current directory:', process.cwd());
console.log('MONGO_URI loaded:', process.env.MONGO_URI ? 'Yes' : 'No');

const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
};