const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const questionController = require('../controllers/questionController');
const upload = require('../utils/uploadConfig');
const adminAuth = require('../middleware/adminAuth');

router.post('/admin/verify', adminAuth, (req, res) => {
  res.status(200).json({ success: true, message: 'Autenticato' });
});
// Quiz & Documenti
router.get('/audio', quizController.getAudioFiles);
router.get('/characters', quizController.getCharacters);
router.post('/sections/:sectionId/upload-docx', adminAuth, upload.single('docxFile'), quizController.uploadDocxQuiz);
router.get('/sections/:sectionId/play', quizController.getQuizPlayQuestions);
router.post('/sections/:sectionId/results', quizController.submitQuizResult);
router.get('/sections/:sectionId/leaderboard', quizController.getSectionLeaderboard);

// Gestione Singole Domande
router.put('/questions/:id', adminAuth,questionController.updateQuestion);
router.delete('/questions/:id', adminAuth, questionController.deleteQuestion);
router.delete('/sections/:sectionId/questions',adminAuth, questionController.clearSectionQuestions);

module.exports = router;