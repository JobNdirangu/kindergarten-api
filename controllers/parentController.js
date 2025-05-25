// Parent logic

const Parent = require('../models/Parent');

exports.getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find();
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parents', error: err.message });
  }
};

exports.addParent = async (req, res) => {
  try {
    const newParent = new Parent(req.body);
    const savedParent = await newParent.save();
    res.status(201).json(savedParent);
  } catch (err) {
    res.status(400).json({ message: 'Error adding parent', error: err.message });
  }
};

exports.getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) return res.status(404).json({ message: 'Parent not found' });
    res.json(parent);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parent', error: err.message });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedParent) return res.status(404).json({ message: 'Parent not found' });
    res.json(updatedParent);
  } catch (err) {
    res.status(400).json({ message: 'Error updating parent', error: err.message });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const deletedParent = await Parent.findByIdAndDelete(req.params.id);
    if (!deletedParent) return res.status(404).json({ message: 'Parent not found' });
    res.json({ message: 'Parent deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting parent', error: err.message });
  }
};