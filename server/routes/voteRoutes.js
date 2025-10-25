const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.post('/createvote', voteController.createVote);
router.post('/deletevote', voteController.deleteVote);
router.post('/getvote', voteController.getVote);

module.exports = router;