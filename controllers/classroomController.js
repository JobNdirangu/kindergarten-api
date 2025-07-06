const { Classroom } = require('../models/SchoolDb'); // Import relevant models

// ==============================
// Get all classrooms
// Includes teacher and student details for admin view
// ==============================
exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate('teacher', 'name email phone')              // Populate assigned teacher's info
      .populate('students', 'name admissionNumber');        // Populate basic student info
    res.json(classrooms); // Return all classrooms with populated data
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classrooms', error: err.message });
  }
};

// ==============================
// Add a new classroom
// Body must include teacher ID and other required fields
// ==============================
exports.addClassroom = async (req, res) => {
  try {
    // Create a new Classroom using request data
    const newClassroom = new Classroom(req.body);

    // Save the new classroom to the database
    const savedClassroom = await newClassroom.save();

    // Return the saved classroom
    res.status(201).json(savedClassroom);
  } catch (err) {
    res.status(400).json({ message: 'Error adding classroom', error: err.message });
  }
};

// ==============================
// Get a single classroom by ID
// Includes full teacher and student info
// ==============================
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'name email')                   // Populate teacher details
      .populate('students', 'name admissionNumber');       // Populate student details
    console.log(classroom)
    // If classroom not found, return 404
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    res.json(classroom); // Return the classroom
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classroom', error: err.message });
  }
};

// ==============================
// Update classroom
// Allows updating of teacher, name, or other properties
// ==============================
exports.updateClassroom = async (req, res) => {
  try {
    // Find the classroom by ID and update it
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );

    // If classroom not found, return 404
    if (!updatedClassroom) return res.status(404).json({ message: 'Classroom not found' });

    res.json(updatedClassroom); // Return the updated classroom
  } catch (err) {
    res.status(400).json({ message: 'Error updating classroom', error: err.message });
  }
};

// ==============================
// Delete classroom by ID
// Removes classroom from the system
// ==============================
exports.deleteClassroom = async (req, res) => {
  try {
    // Find and delete the classroom
    const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);

    // If not found, return 404
    if (!deletedClassroom) return res.status(404).json({ message: 'Classroom not found' });

    res.json({ message: 'Classroom deleted successfully' }); // Return success message
  } catch (err) {
    res.status(500).json({ message: 'Error deleting classroom', error: err.message });
  }
};
