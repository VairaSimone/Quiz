const prisma = require('../config/db');
const cloudinary = require('../config/cloudinary');

exports.getAllStories = async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nel recupero dei racconti', error: error.message });
  }
};

exports.getStoryById = async (req, res) => {
  const { id } = req.params;

  // Verifica che l'ID sia un numero valido
  const storyId = parseInt(id, 10);
  if (isNaN(storyId)) {
    return res.status(400).json({
      success: false,
      message: "L'ID fornito non è un numero valido",
    });
  }

  try {
    const story = await prisma.story.findUnique({
      where: {
        id: storyId, // Passa l'ID convertito in Int
      },
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Storia non trovata",
      });
    }

    return res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error("Errore recupero storia:", error);
    return res.status(500).json({
      success: false,
      message: "Errore nel recupero del racconto",
      error: error.message,
    });
  }
};

exports.createStory = async (req, res) => {
  try {
    let coverImageUrl = req.body.coverImage || null;
    let jsonUrl = req.body.jsonUrl || null;
    let storyContent = null;

    // A. Gestione file caricati via Multer/Cloudinary
    if (req.files) {
      if (req.files.coverImage) {
        coverImageUrl = req.files.coverImage[0].path;
      }
      if (req.files.jsonFile) {
        jsonUrl = req.files.jsonFile[0].path;
      }
    } else if (req.file) {
      // Fallback se usi upload.single('coverImage')
      coverImageUrl = req.file.path;
    }

    // B. Recupero del contenuto JSON
    if (jsonUrl) {
      // Se il JSON è stato caricato su Cloudinary, scaricane il contenuto
      const response = await fetch(jsonUrl);
      storyContent = await response.json();
    } else if (req.body.content) {
      // Se il JSON è stato inviato nel body
      storyContent = typeof req.body.content === "string" 
        ? JSON.parse(req.body.content) 
        : req.body.content;
    }

    // C. Salvataggio su Postgres con Prisma
    const newStory = await prisma.story.create({
      data: {
        title: req.body.title || "Nuova Storia",
        description: req.body.description || null,
        coverImage: coverImageUrl,
        jsonUrl: jsonUrl,
        content: storyContent,
      },
    });

    return res.status(201).json({
      success: true,
      data: newStory,
    });
  } catch (error) {
    console.error("Errore creazione storia:", error);
    return res.status(500).json({
      success: false,
      message: "Errore durante la creazione della storia",
      error: error.message,
    });
  }
};


const deleteFromCloudinary = async (fileUrl, isRaw = false) => {
  if (!fileUrl) return;
  try {
    const parts = fileUrl.split('/');
    const folderAndFile = parts.slice(-2).join('/');

    if (isRaw) {
      await cloudinary.uploader.destroy(folderAndFile, { resource_type: 'raw' });
    } else {
      const publicId = folderAndFile.substring(0, folderAndFile.lastIndexOf('.'));
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }
  } catch (error) {
    console.error('Errore eliminazione Cloudinary:', error);
  }
};

exports.deleteStory = async (req, res) => {
  const { id } = req.params;
  
  // 1. Converti l'ID da String a Int
  const storyId = parseInt(id, 10);
  if (isNaN(storyId)) {
    return res.status(400).json({
      success: false,
      message: "L'ID fornito non è un numero valido",
    });
  }

  try {
    // 2. Cerca la storia nel database usando l'ID convertito
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });

    if (!story) {
      return res.status(404).json({ success: false, message: 'Storia non trovata' });
    }

    // 3. Pulisci i file su Cloudinary (Copertina e JSON)
    if (story.coverImage) {
      await deleteFromCloudinary(story.coverImage, false);
    }
    if (story.jsonUrl) {
      await deleteFromCloudinary(story.jsonUrl, true);
    }

    // 4. Elimina la storia dal database
    await prisma.story.delete({
      where: { id: storyId }
    });

    return res.status(200).json({ success: true, message: 'Storia eliminata con successo' });
  } catch (error) {
    console.error("Errore eliminazione storia:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Errore durante l'eliminazione della storia",
      error: error.message 
    });
  }
};