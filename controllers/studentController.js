const { Student, Parent, Classroom } = require('../models/SchoolDb');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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


// Basic multer setup (auto stores to 'uploads/' with random names)
const upload = multer({ dest: 'uploads/' });
exports.uploadStudentPhoto = upload.single('photo');
// Add student and also the profile picture
exports.addStudent = async (req, res) => {
  try {
    const { name, dateOfBirth, gender, admissionNumber, parentNationalId, classroomId } = req.body;

    // 1. Find parent by national ID
    const parent = await Parent.findOne({ nationalId: parentNationalId });
    if (!parent) {
      return res.status(400).json({ message: 'Parent with provided national ID not found' });
    }

    // 2. Check if admission number already exists
    const student = await Student.findOne({ admissionNumber });
    if (student) {
      return res.status(400).json({ message: 'Admission No. has already been assigned to someone else' });
    }

    // 3. Check if classroom exists
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(400).json({ message: 'Classroom not found' });
    }

    // 4. Handle uploaded photo (rename with timestamp + extension)
    let photo = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = Date.now() + ext;
      const newPath = path.join('uploads', newFilename);
      fs.renameSync(req.file.path, newPath);
      photo = newPath.replace(/\\/g, '/');
    }

    // 5. Create and save the new student
    const newStudent = new Student({
      name,
      dateOfBirth,
      gender,
      admissionNumber,
      photo,
      parent: parent._id,
      classroom: classroom._id
    });

    const savedStudent = await newStudent.save();

    // 6. Add student to classroom using $addToSet to avoid duplicates
    await Classroom.findByIdAndUpdate(
      classroom._id,
      { $addToSet: { students: savedStudent._id } }
    );

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

    // Remove student from any classrooms
    await Classroom.updateMany(
      { students: deletedStudent._id },
      { $pull: { students: deletedStudent._id } }
    );
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
};
