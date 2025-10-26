const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.post('/createvote', voteController.createVote);
router.delete('/deletevote', voteController.deleteVote);
router.get('/getvote', voteController.getVote);

module.exports = router;