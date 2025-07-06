// Parent routes
const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { auth, authorizeRoles } = require('../middlewares/auth');

router.get('/', parentController.getAllParents);
router.post('/', auth, authorizeRoles('admin'),parentController.addParent);
router.get('/:id', parentController.getParentById);
router.put('/:id',auth, authorizeRoles('admin'), parentController.updateParent);
router.delete('/:id', auth, authorizeRoles('admin'),parentController.deleteParent);

module.exports = router;