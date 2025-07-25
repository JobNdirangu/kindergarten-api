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
      .populate('classroom');

    res.json({
      parent,
      children,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parent dashboard', error: err.message });
  }
};

exports.getClassAssignments = async (req, res) => {
  try {
    const classId = req.params.classId;

    // Fetch assignments posted to that class, with teacher details
    const assignments = await Assignment.find({ classroom: classId })
      .populate('postedBy')
      .sort({ dueDate: 1 }); // Optional: sort by nearest due date

    res.json(assignments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

