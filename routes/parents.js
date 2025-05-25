// Parent routes
const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');

router.get('/', parentController.getAllParents);
router.post('/', parentController.addParent);
router.get('/:id', parentController.getParentById);
router.put('/:id', parentController.updateParent);
router.delete('/:id', parentController.deleteParent);

module.exports = router;