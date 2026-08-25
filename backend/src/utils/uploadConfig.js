const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const tempDir = 'uploads/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Storage Cloudinary per Copertine e File JSON
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Se è il file JSON della storia
if (file.fieldname === 'jsonFile' || file.mimetype === 'application/json') {
  return {
    folder: 'quiz_stories_json',
    resource_type: 'raw' // Rimosso format: 'json'
  };
}
    // Altrimenti imposta come Immagine di Copertina
    return {
      folder: 'quiz_covers',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',
    };
  },
});

// Storage temporaneo su disco SOLO per i file Word (.docx)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const customStorage = {
  _handleFile(req, file, cb) {
    if (file.fieldname === 'coverImage' || file.fieldname === 'jsonFile') {
      cloudinaryStorage._handleFile(req, file, cb);
    } else {
      diskStorage._handleFile(req, file, cb);
    }
  },
  _removeFile(req, file, cb) {
    if (file.fieldname === 'coverImage' || file.fieldname === 'jsonFile') {
      cloudinaryStorage._removeFile(req, file, cb);
    } else {
      diskStorage._removeFile(req, file, cb);
    }
  }
};

const upload = multer({ 
  storage: customStorage,
  limits: { fileSize: 100 * 1024 * 1024 }
});

module.exports = upload;