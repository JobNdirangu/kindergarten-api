const { User, Parent, Student, Assignment, Classroom } = require('../models/SchoolDb');

// ================================
// Get parent dashboard info (self)
// ================================
exports.getParentDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find user and populate parent reference
    const user = await User.findById(userId).populate('parent');
    if (!user || !user.parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    const parent = user.parent;

    // Get children (students) linked to this parent
    const children = await Student.find({ parent: parent._id })
      .populate('classroom', 'name gradeLevel classYear');

    // Collect class IDs from children to fetch related assignments
    const classroomIds = children
      .map(child => child.classroom?._id)
      .filter(id => id); // Exclude null/undefined classrooms

    const assignments = await Assignment.find({ classroom: { $in: classroomIds } })
      .populate('classroom', 'name gradeLevel')
      .populate('postedBy', 'name');

    res.json({
      parent,
      children,
      assignments
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parent dashboard', error: err.message });
  }
};
