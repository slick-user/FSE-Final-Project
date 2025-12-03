const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const config = require('../config/env');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'bus-app-profiles',
    allowed_formats: config.upload.allowedFormats,
    transformation: [{ 
      width: 600, 
      height: 600, 
      crop: 'fill',
      quality: 'auto'
    }]
  }
});

// Configure multer
const upload = multer({ 
  storage,
  limits: { 
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG allowed.'));
    }
  }
});

module.exports = upload;
