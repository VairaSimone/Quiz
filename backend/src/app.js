const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // Importato per evitare il ReferenceError nel middleware di errore

const sectionRoutes = require('./routes/sectionRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();

// Middleware generali
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rende accessibile la cartella degli upload (Immagini e Copertine)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware Rotte
app.use('/api/sections', sectionRoutes);
app.use('/api/quiz', quizRoutes);

// Middleware Gestione Errori Multer / Server (deve stare dopo la definizione delle rotte)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Errore caricamento file: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

// Avvio Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Node.js in esecuzione sulla porta ${PORT}`);
});





 