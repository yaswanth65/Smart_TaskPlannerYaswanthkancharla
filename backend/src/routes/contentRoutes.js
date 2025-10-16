const express = require('express');
const router = express.Router();
const content = require('../controllers/contentController');

// Ideas
router.get('/ideas', content.listIdeas);
router.post('/ideas', content.createIdea);
router.delete('/ideas/:id', content.deleteIdea);

// Templates
router.get('/templates', content.listTemplates);
router.post('/templates', content.createTemplate);
router.delete('/templates/:id', content.deleteTemplate);

module.exports = router;
