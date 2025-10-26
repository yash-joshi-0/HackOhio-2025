const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');

router.post('/simplifyidea', llmController.simplifyIdea);

module.exports = router;
