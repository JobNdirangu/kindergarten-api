// Assignment routes
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const {auth}= require('../middlewares/auth');

router.get('/',auth, assignmentController.getAllAssignments);
router.post('/',auth, assignmentController.addAssignment);
router.get('/:id',auth, assignmentController.getAssignmentById);
router.put('/:id',auth, assignmentController.updateAssignment);
router.delete('/:id',auth, assignmentController.deleteAssignment);

module.exports = router;