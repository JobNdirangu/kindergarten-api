// Entry point
const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors')
require('dotenv').config();

const app = express();
app.use(express.json()); // For parsing JSON request bodies
app.use(cors());  //allow frontend to connect

// This makes images accessible via URLs like: http://yourserver.com/uploads/1234567.jpg
app.use('/uploads', express.static('uploads'));


// Import login route and mount on /api/login
const loginRoutes = require('./routes/login');
app.use('/api/login', loginRoutes);

// Import student routes and mount on /api/students
const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);

// Import classroom routes and mount on /api/classrooms
const classroomRoutes = require('./routes/classrooms');
app.use('/api/classrooms', classroomRoutes);

// Import teachers routes and mount on /api/teachers
const teacherRoutes = require('./routes/teachers');
app.use('/api/teachers', teacherRoutes);

// Import teachers routes and mount on /api/parents
const parentsRoutes = require('./routes/parents');
app.use('/api/parents', parentsRoutes);

// Import assignments routes and mount on /api/assignments
const assignmentsRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentsRoutes);

// Connect to MongoDB using connection string in .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
