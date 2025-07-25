const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middlewares/auth');
const  getParentDashboard  = require('../controllers/parentDashboardController');

router.get('/', auth, authorizeRoles('parent'), getParentDashboard.getParentDashboard);
router.get('/:id', auth, authorizeRoles('parent'), getParentDashboard.getClassAssignments);

module.exports = router;
