const { Parent, User } = require('../models/SchoolDb');
const bcrypt = require('bcrypt'); 

// Get all parents from the database
exports.getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find();
    res.json(parents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parents', error: err.message });
  }
};

// Add a new parent and create a corresponding user account
exports.addParent = async (req, res) => {
  try {

    // destructuring request body
    const { name, email, nationalId } = req.body;

    // Check if a user with the same email already exists
    const existingParentEmail = await User.findOne({ email });
    if (existingParentEmail) {
      return res.status(400).json({ message: 'A parent with this email already exists.' });
    }

    // Check if a parent with the same national ID already exists
    const existingParentId = await Parent.findOne({ nationalId });
    if (existingParentId) {
      return res.status(400).json({ message: 'A parent with this national id already exists.' });
    }

    // Create and save the Parent document
    const newParent = new Parent(req.body);
    const savedParent = await newParent.save();

    // Set a default password and hash it
    const defaultPassword = 'parent1234'; 
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create a corresponding User document with role 'parent'
    const newUser = new User({name,email,password: hashedPassword,role: 'parent',parent: savedParent._id});

    await newUser.save();

    // Return the saved parent, default password, and success message
    res.status(201).json({ parent: savedParent, password: defaultPassword, message: 'Parent and user account created successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error adding parent', error: err.message });
  }
};

// Get a parent by national ID
exports.getParentById = async (req, res) => {
  try {
    const parent = await Parent.findOne({ nationalId: req.params.id });
    if (!parent) return res.status(404).json({ message: 'Parent not found sure' });
    res.json(parent);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching parent', error: err.message });
  }
};

// Update a parent's information by ID
exports.updateParent = async (req, res) => {
  try {
    const updatedParent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedParent) return res.status(404).json({ message: 'Parent not found' });
    res.json(updatedParent);
  } catch (err) {
    res.status(400).json({ message: 'Error updating parent', error: err.message });
  }
};

// Delete a parent and the associated user account
exports.deleteParent = async (req, res) => {
  try {
    const deletedParent = await Parent.findByIdAndDelete(req.params.id);
    if (!deletedParent) return res.status(404).json({ message: 'Parent not found' });

    // Delete the associated user account linked to the parent
    await User.findOneAndDelete({ parent: req.params.id });

    res.json({ message: 'Parent and associated user account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting parent', error: err.message });
  }
};
