const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middlewares/auth');
const { getParentDashboard } = require('../controllers/parentDashboardController');

router.get('/', auth, authorizeRoles('parent'), getParentDashboard);

module.exports = router;
