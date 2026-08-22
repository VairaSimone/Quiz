const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

// 1. Ottieni tutte le sezioni con il conteggio delle domande
exports.getAllSections = async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nel recupero delle sezioni', error: error.message });
  }
};

// 2. Ottieni singola sezione con dettagli e dati correlati
exports.getSectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: true }
        },
        gameResults: {
          orderBy: { playedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!section) {
      return res.status(404).json({ success: false, message: 'Sezione non trovata' });
    }

    res.status(200).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nel recupero della sezione', error: error.message });
  }
};

// 3. Crea una nuova sezione (titolo, descrizione e immagine copertina)
exports.createSection = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Il titolo della sezione è obbligatorio' });
  }

  try {
    const existing = await prisma.section.findUnique({ where: { title } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Una sezione con questo nome esiste già' });
    }

    const coverImage = req.file ? `/uploads/covers/${req.file.filename}` : null;

    const newSection = await prisma.section.create({
      data: {
        title,
        description,
        coverImage
      }
    });

    res.status(201).json({ success: true, data: newSection });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore durante la creazione della sezione', error: error.message });
  }
};

// 4. Elimina una sezione ed i file locali associati
exports.deleteSection = async (req, res) => {
  const { id } = req.params;
  try {
    const section = await prisma.section.findUnique({ where: { id } });

    if (!section) {
      return res.status(404).json({ success: false, message: 'Sezione non trovata' });
    }

    // Rimozione immagine dal filesystem
    if (section.coverImage) {
      const imagePath = path.join(__dirname, '../../', section.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.section.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Sezione eliminata con successo' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione della sezione', error: error.message });
  }
};