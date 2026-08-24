const prisma = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getAllStories = async (req, res) => {
  try {
    const stories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true
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
  try {
    const story = await prisma.story.findUnique({ where: { id } });

    if (!story) {
      return res.status(404).json({ success: false, message: 'Racconto non trovato' });
    }

    let parsedMessages = [];
    try {
      parsedMessages = JSON.parse(story.contentJson);
    } catch (e) {
      parsedMessages = [];
    }

    res.status(200).json({
      success: true,
      data: {
        ...story,
        messages: parsedMessages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nel recupero del racconto', error: error.message });
  }
};

exports.createStory = async (req, res) => {
  const { title, description } = req.body;
  const jsonFile = req.files?.jsonFile ? req.files.jsonFile[0] : null;
  const coverImageFile = req.files?.coverImage ? req.files.coverImage[0] : null;

  if (!title || !title.trim()) {
    if (jsonFile && fs.existsSync(jsonFile.path)) fs.unlinkSync(jsonFile.path);
    if (coverImageFile && fs.existsSync(coverImageFile.path)) fs.unlinkSync(coverImageFile.path);
    return res.status(400).json({ success: false, message: 'Il titolo è obbligatorio' });
  }

  if (!jsonFile) {
    if (coverImageFile && fs.existsSync(coverImageFile.path)) fs.unlinkSync(coverImageFile.path);
    return res.status(400).json({ success: false, message: 'Il file JSON del racconto è obbligatorio' });
  }

  try {
    const fileContent = fs.readFileSync(jsonFile.path, 'utf8');
    let rawData;

    try {
      rawData = JSON.parse(fileContent);
    } catch (jsonErr) {
      fs.unlinkSync(jsonFile.path);
      if (coverImageFile && fs.existsSync(coverImageFile.path)) fs.unlinkSync(coverImageFile.path);
      return res.status(400).json({ success: false, message: 'Il file inviato contiene un JSON non valido' });
    }

    let messagesList = Array.isArray(rawData) ? rawData : (rawData.messages || null);

    if (!messagesList || !Array.isArray(messagesList) || messagesList.length === 0) {
      fs.unlinkSync(jsonFile.path);
      if (coverImageFile && fs.existsSync(coverImageFile.path)) fs.unlinkSync(coverImageFile.path);
      return res.status(400).json({ success: false, message: 'Struttura JSON non valida o messaggi mancanti' });
    }

    const validatedMessages = messagesList.map((msg, idx) => ({
      id: msg.id || idx,
      from: msg.from || msg.actor || 'Sconosciuto',
      text: msg.text !== undefined ? msg.text : '',
      date: msg.date || msg.date_unixtime || null,
      media_type: msg.media_type || null,
      photo: msg.photo || null
    }));

    const coverImage = coverImageFile ? `/uploads/covers/${coverImageFile.filename}` : null;

    const newStory = await prisma.story.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        coverImage,
        contentJson: JSON.stringify(validatedMessages)
      }
    });

    fs.unlinkSync(jsonFile.path);

    res.status(201).json({ success: true, data: newStory });
  } catch (error) {
    if (jsonFile && fs.existsSync(jsonFile.path)) fs.unlinkSync(jsonFile.path);
    if (coverImageFile && fs.existsSync(coverImageFile.path)) fs.unlinkSync(coverImageFile.path);
    res.status(500).json({ success: false, message: 'Errore durante la creazione del racconto', error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  const { id } = req.params;
  try {
    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      return res.status(404).json({ success: false, message: 'Racconto non trovato' });
    }

    if (story.coverImage) {
      const imgPath = path.join(__dirname, '../../', story.coverImage);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.story.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Racconto eliminato con successo' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore durante l\'eliminazione del racconto', error: error.message });
  }
};