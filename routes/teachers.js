// Teacher routes
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { auth, authorizeRoles } = require('../middlewares/auth');

// GET /api/teachers - Get all teachers
router.get('/', teacherController.getAllTeachers);

// POST /api/teachers - Create a new teacher
router.post('/',auth, authorizeRoles('admin'), teacherController.addTeacher);

// GET /api/teachers/:id - Get a single teacher
router.get('/:id', teacherController.getTeacherById);

// PUT /api/teachers/:id - Update a teacher
router.put('/:id', teacherController.updateTeacher);

// DELETE /api/teachers/:id - Delete a teacher
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
