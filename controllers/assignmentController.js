// Assignment logic
const Assignment = require('../models/Assignment');

exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('classroom');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignments', error: err.message });
  }
};

exports.addAssignment = async (req, res) => {
  try {
    const newAssignment = new Assignment(req.body);
    const savedAssignment = await newAssignment.save();
    res.status(201).json(savedAssignment);
  } catch (err) {
    res.status(400).json({ message: 'Error adding assignment', error: err.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('classroom');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assignment', error: err.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAssignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(updatedAssignment);
  } catch (err) {
    res.status(400).json({ message: 'Error updating assignment', error: err.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!deletedAssignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting assignment', error: err.message });
  }
};