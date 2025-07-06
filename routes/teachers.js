// Teacher routes
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { auth, authorizeRoles } = require('../middlewares/auth');

// GET /api/teachers - Get all teachers
router.get('/', auth, teacherController.getAllTeachers);

// POST /api/teachers - Create a new teacher
router.post('/', auth, authorizeRoles('admin'), teacherController.addTeacher);

// Specific static routes
router.get('/myclasses', auth, teacherController.getMyClasses);       // New dedicated controller
router.get('/myassignments', auth, teacherController.getMyAssignments); // New dedicated controller
// router.post('/myassignments', auth, teacherController.createAssignment); // New dedicated controller

// Dynamic route LAST
// GET /api/teachers/:id - Get a single teacher
router.get('/:id', auth, teacherController.getTeacherById);

// PUT /api/teachers/:id - Update a teacher
router.put('/:id', auth, authorizeRoles('admin'), teacherController.updateTeacher);

// DELETE /api/teachers/:id - Delete a teacher
router.delete('/:id', auth, authorizeRoles('admin'), teacherController.deleteTeacher);

module.exports = router;