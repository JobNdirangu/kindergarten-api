const { Classroom, Teacher, Student } = require('../models/SchoolDb');

// Get all classrooms (populate teacher and students)
exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate('teacher', 'name email phone') // populate teacher name and email
      .populate('students', 'name admissionNumber'); // populate student names
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classrooms', error: err.message });
  }
};

// Add a new classroom
exports.addClassroom = async (req, res) => {
  try {
    const newClassroom = new Classroom(req.body);
    const savedClassroom = await newClassroom.save();
    res.status(201).json(savedClassroom);
  } catch (err) {
    res.status(400).json({ message: 'Error adding classroom', error: err.message });
  }
};

// Get a classroom by ID
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name admissionNumber');
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json(classroom);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classroom', error: err.message });
  }
};

// Update classroom (e.g., change teacher or name)
exports.updateClassroom = async (req, res) => {
  try {
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedClassroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json(updatedClassroom);
  } catch (err) {
    res.status(400).json({ message: 'Error updating classroom', error: err.message });
  }
};

// Delete classroom
exports.deleteClassroom = async (req, res) => {
  try {
    const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!deletedClassroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json({ message: 'Classroom deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting classroom', error: err.message });
  }
};
