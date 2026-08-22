const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const upload = require('../utils/uploadConfig');

router.get('/', sectionController.getAllSections);
router.get('/:id', sectionController.getSectionById);
router.post('/', upload.single('coverImage'), sectionController.createSection);
router.delete('/:id', sectionController.deleteSection);

module.exports = router;