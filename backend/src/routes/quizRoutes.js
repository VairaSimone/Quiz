const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const questionController = require('../controllers/questionController');
const upload = require('../utils/uploadConfig');

// Quiz & Documenti
router.post('/sections/:sectionId/upload-docx', upload.single('docxFile'), quizController.uploadDocxQuiz);
router.get('/sections/:sectionId/play', quizController.getQuizPlayQuestions);
router.post('/sections/:sectionId/results', quizController.submitQuizResult);
router.get('/sections/:sectionId/leaderboard', quizController.getSectionLeaderboard);

// Gestione Singole Domande
router.put('/questions/:id', questionController.updateQuestion);
router.delete('/questions/:id', questionController.deleteQuestion);
router.delete('/sections/:sectionId/questions', questionController.clearSectionQuestions);

module.exports = router;