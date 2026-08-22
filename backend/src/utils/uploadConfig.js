const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Assicuriamoci che le cartelle esistano
const uploadDirs = ['uploads/covers', 'uploads/docs'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      cb(null, 'uploads/covers');
    } else if (file.fieldname === 'docxFile') {
      cb(null, 'uploads/docs');
    } else {
      cb(new Error('Campo upload non valido'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Formato file non supportato! Carica un\'immagine.'), false);
  } else if (file.fieldname === 'docxFile') {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.originalname.endsWith('.docx')) {
      cb(null, true);
    } else cb(new Error('Carica un file valido con estensione .docx'), false);
  } else {
    cb(new Error('Campo non riconosciuto'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite 10MB
});

module.exports = upload;