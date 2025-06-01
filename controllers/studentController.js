const { Student, Parent, Classroom } = require('../models/SchoolDb');

// Get all students (with populated parent and classroom)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('classroom')
      .populate('parent');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};

// Add a new student (assign parent by nationalId and class by classroomId)
// npm install multer
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // save files in uploads folder
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp + original extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.uploadStudentPhoto = upload.single('photo');


exports.addStudent = async (req, res) => {
  try {
    const { name, dateOfBirth, gender, admissionNumber, parentNationalId, classroomId } = req.body;

    // 1. Find parent by national ID
    const parent = await Parent.findOne({ nationalId: parentNationalId });
    if (!parent) {
      return res.status(400).json({ message: 'Parent with provided national ID not found' });
    }

    // 2. Check that classroom exists
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(400).json({ message: 'Classroom not found' });
    }

    // 3. Use the filename from multer if photo was uploaded
    const photoFilename = req.file ? req.file.filename : null;

    // 4. Create student with references
    const newStudent = new Student({
      name,
      dateOfBirth,
      gender,
      admissionNumber,
      photo: photoFilename,
      parent: parent._id,
      classroom: classroom._id
    });

    // 5. Save student
    const savedStudent = await newStudent.save();

    // 6. Add student to classroom
    if (!classroom.students.includes(savedStudent._id)) {
      classroom.students.push(savedStudent._id);
      await classroom.save();
    }

    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ message: 'Error adding student', error: err.message });
  }
};


// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classroom')
      .populate('parent');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: 'Error updating student', error: err.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
};
