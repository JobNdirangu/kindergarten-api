// All db  schema
const mongoose = require('mongoose');

// Define User Schema
const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['admin', 'teacher', 'parent'], required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', default: null }
}, { timestamps: true });
  
  // Teacher schema
  const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String},
  phone:{type:String},
  subject: { type: String }
}, { timestamps: true });

// Classroom schema: name, assigned teacher, and students (array of references)
const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  gradeLevel:{type:String},
  classYear:{type:Number},
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, 
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

// Parent Schema
const parentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email:{ type: String },
  phone: { type: String, required: true },
  address:{type:String},
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
  
}, { timestamps: true });


// Student schema 
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Student's full name
  dateOfBirth: { type: Date, required: true },      // Student's dob
  gender:{type:String},
  photo: {type:String},
  admissionNumber: { type: String, unique: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom',  default: null}, // Reference to assigned class
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },       // Reference to parent
}, { timestamps: true }); 

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: {type:String},
  dueDate: {type:Date},
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
}, { timestamps: true });



const User = mongoose.model('User', userSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Classroom = mongoose.model('Classroom', classroomSchema);
const Parent = mongoose.model('Parent', parentSchema);
const Student = mongoose.model('Student', studentSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = {User,Teacher,Classroom, Student,Parent,Assignment};
