const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDirs = ['uploads/covers', 'uploads/docs', 'uploads/json'];
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
    } else if (file.fieldname === 'jsonFile') {
      cb(null, 'uploads/json');
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
  } else if (file.fieldname === 'jsonFile') {
    if (
      file.mimetype === 'application/json' ||
      file.mimetype === 'text/json' ||
      file.mimetype === 'text/plain' ||
      file.originalname.endsWith('.json')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Carica un file valido con estensione .json'), false);
    }
  } else {
    cb(new Error('Campo non riconosciuto'), false);
  }
};

// Rimosso qualsiasi limite stringente di dimensione file
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // Limite esteso a 100MB
});

module.exports = upload;