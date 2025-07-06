const { Teacher, User,Classroom, Assignment } = require('../models/SchoolDb');
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
    const {email}=req.body
    const existEmail=await Teacher.findOne({email})
    if (existEmail) return res.status(404).json({message:"Teacher already exist"})

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
      teacher: savedTeacher._id // link to the teacher document by ID
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
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('teacher');
    if (!user || !user.teacher) return res.status(404).json({ message: 'Teacher not foundf' });

    const teacher = user.teacher;
    const teacherId = teacher._id;

    const classrooms = await Classroom.find({ teacher: teacherId })
      .populate('students', 'name admissionNumber');

    const assignments = await Assignment.find({ postedBy: teacherId })
      .populate('classroom', 'name');

    res.json({ teacher, classrooms, assignments });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teacher dashboard data', error: err.message });
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
    const teacherId = req.params.id;
    // Delete teacher by ID from request params
    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

    // If no teacher found, return 404
    if (!deletedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    // Unassign this teacher from any classroom
    await Classroom.updateMany({ teacher: teacherId }, { $set: { teacher: null } });

    // Delete the linked user
    await User.findOneAndDelete({ teacher: teacherId });

    // Respond with success message after deletion
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher:', err); 
    // Handle errors during deletion
    res.status(500).json({ message: 'Error deleting teacher', error: err.message });
  }
};


// ========================
// CLASS-RELATED OPERATIONS 
// ========================
// Get only classes the teacher teaches
exports.getMyClasses = async (req, res) => {
  try {
    // Get teacher ID from the logged-in user
    const userId = req.user.userId;
    
    // Find the user and populate the 'teacher' reference
    const user = await User.findById(userId).populate('teacher');

    // Check if the user exists and is linked to a teacher
    if (!user || !user.teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    // Get all classrooms taught by this teacher, including the students
    const classes = await Classroom.find({ teacher: user.teacher._id })
      .populate('students'); // <-- This populates the students array

    // Send the result
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getMyAssignments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('teacher');
    
    const assignments = await Assignment.find({ postedBy: user.teacher._id })
      .populate('classroom') // Include classroom details
      .sort({ dueDate: 1 });
    console.log(assignments)
    res.status(200).json({ assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};