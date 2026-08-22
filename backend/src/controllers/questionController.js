const prisma = require('../config/db');

// 1. Modifica una singola domanda
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { questionText, correctAnswer, level, type, options } = req.body;

  try {
    // Se vengono inviate nuove opzioni, eliminiamo le vecchie e inseriamo le nuove
    if (options && Array.isArray(options)) {
      await prisma.option.deleteMany({ where: { questionId: id } });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        questionText,
        correctAnswer,
        level,
        type,
        options: options ? { create: options.map(opt => ({ text: opt })) } : undefined
      },
      include: { options: true }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento', error: error.message });
  }
};

// 2. Elimina una singola domanda
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.question.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Domanda eliminata con successo' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore nell\'eliminazione', error: error.message });
  }
};

// 3. Svuota tutte le domande di una sezione
exports.clearSectionQuestions = async (req, res) => {
  const { sectionId } = req.params;
  try {
    await prisma.question.deleteMany({ where: { sectionId } });
    res.status(200).json({ success: true, message: 'Tutte le domande della sezione sono state rimosse' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Errore durante lo svuotamento', error: error.message });
  }
};