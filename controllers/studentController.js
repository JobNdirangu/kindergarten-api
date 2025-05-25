// Student logic
const Student = require('../models/Student');

// Controller function to get all students
exports.getAllStudents = async (req, res) => {
  try {
    // Fetch all students, populating classroom and parent references
    const students = await Student.find().populate('classroom').populate('parent');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};

// Controller function to add a new student
exports.addStudent = async (req, res) => {
  try {
    // Create a new Student document from request body data
    const newStudent = new Student(req.body);
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent); // 201 = Created
  } catch (err) {
    res.status(400).json({ message: 'Error adding student', error: err.message });
  }
};

// Controller function to get a student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('classroom').populate('parent');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err.message });
  }
};

// Controller function to update a student by ID
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: 'Error updating student', error: err.message });
  }
};

// Controller function to delete a student by ID
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
};
