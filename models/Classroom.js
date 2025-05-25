// Classroom schema
const mongoose = require('mongoose');

// Classroom schema: name, assigned teacher, and students (array of references)
const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },  // e.g., "Class A", "Kindergarten 1"
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }, // Reference to assigned teacher
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] // List of students in this class
}, { timestamps: true });

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
