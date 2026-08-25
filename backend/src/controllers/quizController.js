const prisma = require('../config/db');
const parseWordDocx = require('../utils/docxParser');
const fs = require('fs');
const path = require('path');
// 1. Upload e Parsing del file Word con inserimento a database
exports.uploadDocxQuiz = async (req, res) => {
  const { sectionId } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'File .docx mancante' });
  }

  try {
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      fs.unlinkSync(req.file.path); // Elimina file temporaneo
      return res.status(404).json({ success: false, message: 'Sezione non trovata' });
    }

    // Parsing delle domande tramite mammoth e regex
    const questionsParsed = await parseWordDocx(req.file.path);

    if (questionsParsed.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Nessuna domanda valida rilevata nel documento' });
    }

    // Salvataggio transazionale su database
    const createdQuestions = await prisma.$transaction(
      questionsParsed.map(q => {
        return prisma.question.create({
          data: {
            sectionId,
            type: q.type,
            level: q.level,
            questionText: q.questionText,
            correctAnswer: q.correctAnswer,
            options: {
              create: q.options.map(opt => ({ text: opt }))
            }
          }
        });
      })
    );

    // Pulizia file docx elaborato
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `Importate con successo ${createdQuestions.length} domande!`,
      count: createdQuestions.length
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Errore nell\'elaborazione del file Word', error: error.message });
  }
};

// 2. Ottieni domande casuali per la modalità di gioco
exports.getQuizPlayQuestions = async (req, res) => {
  const { sectionId } = req.params;
  const { limit } = req.query;

  try {
    const questions = await prisma.question.findMany({
      where: { sectionId },
      include: {
        options: {
          select: { id: true, text: true }
        }
      }
    });

    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: 'Nessuna domanda presente in questa sezione' });
    }

    // Mescolamento casuale Fisher-Yates
    const shuffled = questions.sort(() => 0.5 - Math.random());

    // Se limit è 'all' o non specificato, prende tutte le domande senza tagliarle
    const finalQuestions = (limit && limit !== 'all') 
      ? shuffled.slice(0, parseInt(limit)) 
      : shuffled;

    res.status(200).json({
      success: true,
      totalAvailable: questions.length,
      data: finalQuestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nel recupero del quiz', error: error.message });
  }
};

// 3. Salva il punteggio finale del giocatore
exports.submitQuizResult = async (req, res) => {
  const { sectionId } = req.params;
  const { score, totalQuestions, playerName } = req.body;

  if (score === undefined || totalQuestions === undefined) {
    return res.status(400).json({ success: false, message: 'Punteggio e totale domande sono richiesti' });
  }

  try {
    const result = await prisma.gameResult.create({
      data: {
        sectionId,
        playerName: playerName?.trim() || 'Anonimo',
        score: parseInt(score),
        totalQuestions: parseInt(totalQuestions)
      }
    });

    res.status(201).json({ success: true, message: 'Risultato salvato con successo', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore durante il salvataggio del risultato', error: error.message });
  }
};


// Ottieni la classifica dei migliori punteggi per una sezione
exports.getSectionLeaderboard = async (req, res) => {
  const { sectionId } = req.params;

  try {
    const topScores = await prisma.gameResult.findMany({
      where: { sectionId },
      orderBy: [
        { score: 'desc' },
        { playedAt: 'asc' }
      ],
      take: 10
    });

    res.status(200).json({ success: true, data: topScores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nel recupero classifica', error: error.message });
  }
};


exports.getCharacters = async (req, res) => {
  try {
const charactersDir = path.join(__dirname, '../../static/characters');

    // Se la cartella non esiste ancora, restituiamo un array vuoto
    if (!fs.existsSync(charactersDir)) {
      return res.status(200).json({ success: true, data: [] });
    }

    const files = fs.readdirSync(charactersDir);
    
    // Filtriamo solo i file immagine (evitando file nascosti come .DS_Store)
    const images = files.filter(file => /\.(png|jpe?g|webp|gif|avif)$/i.test(file));

    res.status(200).json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore lettura personaggi', error: error.message });
  }
};


exports.getAudioFiles = async (req, res) => {
  try {
    const audioDir = path.join(__dirname, '../../static/audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
      return res.status(200).json({ success: true, data: [] });
    }
    const files = fs.readdirSync(audioDir);
    const audio = files.filter(file => /\.(mp3|wav|ogg|m4a|aac)$/i.test(file));
    res.status(200).json({ success: true, data: audio });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore lettura audio', error: error.message });
  }
};