const { Student, Teacher, Parent, Classroom, User } = require('../models/SchoolDb'); // Import all relevant models

// ==============================
// Get Dashboard Statistics
// Returns total counts and recent records for admin dashboard
// ==============================
exports.getDashboardStats = async (req, res) => {
  try {
    // Run all count operations in parallel for better performance
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClassrooms,
      activeUsers
    ] = await Promise.all([
      Student.countDocuments(),                // Count all students
      Teacher.countDocuments(),                // Count all teachers
      Parent.countDocuments(),                 // Count all parents
      Classroom.countDocuments(),              // Count all classrooms
      User.countDocuments({ isActive: true })  // Count all active user accounts
    ]);

    // Get the 5 most recent students (sorted by newest)
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get the 5 most recent teachers (sorted by newest)
    const recentTeachers = await Teacher.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Return all stats in a single response
    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClassrooms,
      activeUsers,
      recentStudents,
      recentTeachers
    });
  } catch (err) {
    // Return error message if anything fails
    res.status(500).json({ message: 'Failed to load dashboard stats', error: err.message });
  }
};
