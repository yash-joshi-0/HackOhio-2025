const express = require('express');
const router = express.Router();
const ideaController = require('../controllers/ideaController');

router.post('/createidea', ideaController.createIdea);
router.delete('/deleteidea', ideaController.deleteIdea);
router.get('/gettopideaforuser', ideaController.getTopIdeaForUser);
router.patch('/userboostscrit', ideaController.userBoostsCrits);
router.get('/getIdeasWithVotesFromUser', ideaController.getIdeasWithVotesFromUser);

module.exports = router;