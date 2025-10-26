const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/getuser', userController.getUser);
router.patch('/boostusercrits', userController.boostUserCrits);

module.exports = router;