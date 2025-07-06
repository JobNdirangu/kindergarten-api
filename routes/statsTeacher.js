// Assignment routes
const express = require('express');
const router = express.Router();
const statsTeacherController = require('../controllers/statsTeachersController')
const {auth,authorizeRoles}= require('../middlewares/auth');

router.get('/:id', statsTeacherController.getTeacherStats);

module.exports = router;