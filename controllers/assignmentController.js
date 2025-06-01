const { Assignment } = require('../models/SchoolDb');

// Get all assignments, with classroom and teacher populated
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('classroom', 'name gradeLevel classYear')
      .populate('postedBy', 'name email'); // teacher info
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignments', error: err.message });
  }
};

// Add a new assignment
exports.addAssignment = async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body); // req.body must include classroom and postedBy IDs
    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (err) {
    res.status(400).json({ message: 'Error adding assignment', error: err.message });
  }
};

// Get a single assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('classroom', 'name gradeLevel classYear')
      .populate('postedBy', 'name email');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignment', error: err.message });
  }
};

// Update an assignment
exports.updateAssignment = async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Assignment not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating assignment', error: err.message });
  }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const deleted = await Assignment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting assignment', error: err.message });
  }
};
