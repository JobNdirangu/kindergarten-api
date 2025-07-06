const { Assignment, User, Classroom } = require('../models/SchoolDb'); // Import necessary models

// ==============================
// Get all assignments (Admin view)
// Includes classroom and teacher information
// ==============================
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('classroom', 'name gradeLevel classYear') // Populate classroom details
      .populate('postedBy', 'name email');                // Populate teacher (postedBy) info

    res.json(assignments); // Return all assignments
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignments', error: err.message });
  }
};

// ==============================
// Add a new assignment (Only teachers allowed)
// Validates user and classroom existence
// ==============================
exports.addAssignment = async (req, res) => {
  try {
    // Get the logged-in user's ID from authentication middleware
    const userId = req.user.id;

    // Fetch the user and populate the 'teacher' field if it exists
    const user = await User.findById(userId).populate('teacher');

    // Block non-teachers from posting assignments
    if (!user || !user.teacher) {
      return res.status(403).json({ message: 'Only teachers can post assignments' });
    }

    // Extract classroom ID from the incoming request
    const { classroom: classroomId } = req.body;

    // Check if the classroom exists before proceeding
    const classroomExists = await Classroom.findById(classroomId);
    if (!classroomExists) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Prepare assignment data with postedBy set to the current teacher
    const assignmentData = {
      ...req.body,
      postedBy: user.teacher._id
    };

    // Save the assignment to the database
    const newAssignment = new Assignment(assignmentData);
    const savedAssignment = await newAssignment.save();

    // Return the saved assignment
    res.status(201).json(savedAssignment);
  } catch (err) {
    res.status(400).json({ message: 'Error adding assignment', error: err.message });
  }
};

// ==============================
// Get a single assignment by ID
// Includes classroom and teacher information
// ==============================
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('classroom', 'name gradeLevel classYear') // Populate classroom info
      .populate('postedBy', 'name email');                // Populate teacher info

    // If assignment doesn't exist, return 404
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    res.json(assignment); // Return the assignment
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignment', error: err.message });
  }
};

// ==============================
// Update an existing assignment
// ==============================
exports.updateAssignment = async (req, res) => {
  try {
    // Find assignment by ID and update with new data
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // If assignment not found, return 404
    if (!updated) return res.status(404).json({ message: 'Assignment not found' });

    res.json(updated); // Return updated assignment
  } catch (err) {
    res.status(400).json({ message: 'Error updating assignment', error: err.message });
  }
};

// ==============================
// Delete an assignment by ID
// ==============================
exports.deleteAssignment = async (req, res) => {
  try {
    // Delete the assignment
    const deleted = await Assignment.findByIdAndDelete(req.params.id);

    // If not found, return 404
    if (!deleted) return res.status(404).json({ message: 'Assignment not found' });

    res.json({ message: 'Assignment deleted successfully' }); // Success message
  } catch (err) {
    res.status(500).json({ message: 'Error deleting assignment', error: err.message });
  }
};
