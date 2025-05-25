// Student schema
const mongoose = require('mongoose');

// Define the Student schema (structure of student documents)
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Student's full name
  dateOfBirth: { type: Date, required: true },      // Student's dob
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }, // Reference to assigned class
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },       // Reference to parent
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create Student model from schema
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
