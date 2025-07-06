const { Teacher, User,Classroom, Assignment } = require('../models/SchoolDb');

exports.getTeacherStats = async (req, res) => {
  try {
    const userId = req.params.id;
    // console.log(userId)

    // Step 1: Get the teacher's ObjectId from User
    const user = await User.findById(userId);
    if (!user || !user.teacher) {
      return res.status(404).json({ message: 'Teacher not found or not linked to user' });
    }

    const teacherId = user.teacher;

    // Step 2: Aggregate classrooms to get class count and student total
    const classStats = await Classroom.aggregate([
      { $match: { teacher: teacherId } },
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          totalStudents: { $sum: { $size: "$students" } }
        }
      }
    ]);

    // Step 3: Count assignments
    const totalAssignments = await Assignment.countDocuments({ postedBy: teacherId });

    // Prepare final response
    const result = {
      totalClasses: classStats[0]?.totalClasses || 0,
      totalStudents: classStats[0]?.totalStudents || 0,
      totalAssignments
    };

    res.json(result);
  } catch (err) {
    console.error('Error fetching teacher stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
