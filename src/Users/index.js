const express = require('express');
const router = express.Router();
const User = require('../Controller/User')
router.post('/user-list',User.getAllUser)
router.post('/login',User.login);
router.post('/new-user',User.register);
router.post('/new-user-studant',User.registerIndividualStudant)
router.post('/update-info',User.upDateSchool)
router.post('/change-password',User.changePassword)
router.post('/forgot-password',User.forgotPassword)


module.exports = router;