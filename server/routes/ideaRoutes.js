const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');

router.post('/createidea', ideaController.createIdea);
router.post('/deleteidea', ideaController.deleteIdea);
router.post('/gettopideaforuser', ideaController.getTopIdeaForUser);
router.post('/userboostscrit', ideaController.userBoostsCrits);

module.exports = router;