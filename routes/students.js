// Student routes

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// GET all students
router.get('/', studentController.getAllStudents);

// POST a new student
router.post('/', studentController.uploadStudentPhoto, studentController.addStudent);

// GET a student by ID
router.get('/:id', studentController.getStudentById);

// PUT (update) a student by ID
router.put('/:id', studentController.updateStudent);

// DELETE a student by ID
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
