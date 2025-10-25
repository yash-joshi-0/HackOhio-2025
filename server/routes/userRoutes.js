const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/getuser', userController.getUser);
router.post('/boostusercrits', userController.boostUserCrits);

module.exports = router;