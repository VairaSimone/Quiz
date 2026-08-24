const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const upload = require('../utils/uploadConfig');
const adminAuth = require('../middleware/adminAuth');

router.get('/', storyController.getAllStories);
router.get('/:id', storyController.getStoryById);

// Multer (upload.fields) precede adminAuth per ricevere l'intero stream del file 
// ed evitare l'interruzione brusca della socket HTTP sui file di grandi dimensioni
router.post('/', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'jsonFile', maxCount: 1 }
]), adminAuth, storyController.createStory);

router.delete('/:id', adminAuth, storyController.deleteStory);

module.exports = router;