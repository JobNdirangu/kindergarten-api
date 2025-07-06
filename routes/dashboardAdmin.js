// Assignment routes
const express = require('express');
const router = express.Router();
const dashboardAdminnController = require('../controllers/dashboardAdminController');
const {auth, authorizeRoles}= require('../middlewares/auth');

router.get('/',auth,  authorizeRoles('admin'), dashboardAdminnController.getDashboardStats);

module.exports = router;