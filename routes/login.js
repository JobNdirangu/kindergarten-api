// Assignment routes
const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/', loginController.login);
router.post('/admin_reg', loginController.registerAdmin);

module.exports = router;