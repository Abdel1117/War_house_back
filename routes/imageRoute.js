const express = require('express');
const router = express.Router();
const imageController = require('../Controller/imageController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { createOrUpdateValidators } = require('../Utils/RegexValidator/ImageValidator/ImageValidator');

// CRUD routes
router.get('/', imageController.getImages);
router.get('/:id',  imageController.getImageById);

router.post('/', authenticateToken, requireRole(['user','admin','moderator']), createOrUpdateValidators, imageController.createImage);
router.put('/:id', authenticateToken, requireRole(['admin','moderator']), createOrUpdateValidators, imageController.updateImage);
router.delete('/:id', authenticateToken, requireRole(['admin','moderator']), imageController.deleteImage);

// Extra: increment views
router.post('/:id/view', imageController.incrementView);

module.exports = router;
