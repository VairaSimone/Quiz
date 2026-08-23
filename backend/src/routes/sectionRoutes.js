const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const upload = require('../utils/uploadConfig');
const adminAuth = require('../middleware/adminAuth');

router.get('/', sectionController.getAllSections);
router.get('/:id', sectionController.getSectionById);

router.post('/', adminAuth, upload.single('coverImage'), sectionController.createSection);
router.delete('/:id', adminAuth, sectionController.deleteSection);


module.exports = router;