const path = require('path');
const dotenv = require('dotenv');
const serverEnvPath = path.join(__dirname, '..', '.env');
const rootEnvPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ override: true, path: serverEnvPath });
dotenv.config({ override: true, path: rootEnvPath });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    uri: process.env.MONGO_URI
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '24h'
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  
  ors: {
    apiKey: process.env.ORS_API_KEY
  },
  
  upload: {
    allowedFormats: ['jpg', 'jpeg', 'png'],
    maxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE) || 2 * 1024 * 1024
  }
};

// Validate required env vars
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.warn(`⚠️  Warning: ${varName} is not set`);
  }
});

module.exports = config;