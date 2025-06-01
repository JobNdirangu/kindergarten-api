const { Teacher, User } = require('../models/SchoolDb');
const bcrypt = require('bcrypt');

exports.getAllTeachers = async (req, res) => {
  try {
    // Fetch all teachers from the database
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    // Handle any errors during fetch
    res.status(500).json({ message: 'Error fetching teachers', error: err.message });
  }
};

exports.addTeacher = async (req, res) => {
  try {
    // Step 1: Create a new Teacher document with data from request body
    const newTeacher = new Teacher(req.body);
    const savedTeacher = await newTeacher.save(); // Save teacher to DB

    // Step 2: Create a corresponding User document for login purposes

    // Set a default password for the new user (in real apps, generate or require reset)
    const defaultPassword = 'teacher1234';

    // Hash the default password for security before saving
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create a User with teacher's name, email, hashed password, and role 'teacher'
    const newUser = new User({
      name: savedTeacher.name,
      email: savedTeacher.email,
      password: hashedPassword,
      role: 'teacher',
      teacher: savedTeacher._id // Optional: link to the teacher document by ID
    });

    // Save the new User document
    await newUser.save();

    // Respond with the saved teacher and success message
    res.status(201).json({ teacher: savedTeacher, message: 'Teacher and user account created successfully' });
  } catch (err) {
    // Handle errors such as validation or database errors
    res.status(400).json({ message: 'Error adding teacher', error: err.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    // Find a teacher by ID provided in the request params
    const teacher = await Teacher.findById(req.params.id);

    // If teacher not found, send 404 response
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // Otherwise, return the teacher document as JSON
    res.json(teacher);
  } catch (err) {
    // Handle errors during database access
    res.status(500).json({ message: 'Error fetching teacher', error: err.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    // Update teacher with data from request body, return updated document
    // update requires the  id, body
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // If no teacher found, send 404
    if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    // Send back updated teacher data
    res.json(updatedTeacher);
  } catch (err) {
    // Handle validation or database errors
    res.status(400).json({ message: 'Error updating teacher', error: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    // Delete teacher by ID from request params
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    // If no teacher found, return 404
    if (!deletedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    // Unassign this teacher from any classroom
    await Classroom.updateMany({ teacher: teacherId }, { $set: { teacher: null } });

    // Respond with success message after deletion
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    // Handle errors during deletion
    res.status(500).json({ message: 'Error deleting teacher', error: err.message });
  }
};
