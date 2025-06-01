// Classroom routes
const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { auth, authorizeRoles } = require('../middlewares/auth');

// GET all classrooms
router.get('/', classroomController.getAllClassrooms);

// POST add a new classroom
router.post('/', auth, authorizeRoles('admin'), classroomController.addClassroom);

// GET classroom by ID
router.get('/:id', classroomController.getClassroomById);

// PUT update classroom by ID
router.put('/:id', auth, authorizeRoles('admin'), classroomController.updateClassroom);

// DELETE classroom by ID
router.delete('/:id', classroomController.deleteClassroom);

module.exports = router;
