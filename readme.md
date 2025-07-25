# CBC School System API

This project is a **RESTful API for managing a school system** based on the **Kenyan CBC (Competency-Based Curriculum)**. It simplifies management of students, teachers, classrooms, parents, and assignments. The goal is to modernize how assignments are distributed (moving away from WhatsApp groups) and improve record-keeping across all actors in a school.

---

## 📦 Features

* 🔐 Admin, Teacher, and Parent user roles
* 🧑‍🎓 Student and classroom management
* 🧑‍🏫 Teacher and assignment posting
* 📁 File upload for student photos
* 👨‍👩‍👧‍👦 Parent profile linked to students
* 📝 Parents can view assignments posted by teachers

---

## 🛠️ Tech Stack

* **Backend:** Node.js + Express
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT (JSON Web Tokens)
* **Other tools:** bcrypt, multer, dotenv, cors

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd kindergarten-api
```

### 2. Install dependencies

```bash
npm install express jsonwebtoken bcrypt mongoose cors dotenv multer
```

### 3. Setup `.env` file

Create a `.env` file in the root directory and add:

```env
PORT=3000
JWT_SECRET=qicnsicieurgiueit5656=fg
ADMIN_SECRET_KEY=Admin123Pass
MONGO_URI=mongodb+srv://CbcUser:Ua8FjldbzsvbwL9n@cluster0.zhracze.mongodb.net/schooldb?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🌐 Project Structure

```
├── controllers/      # Route logic for each resource
├── models/           # Mongoose schemas
├── routes/           # API routes
├── uploads/          # Uploaded student photos
├── app.js            # Entry point
├── .env              # Environment variables
```

---

## 🧠 Sample: MongoDB Schema (models/SchoolDb.js)

* **User**: linked to either a teacher or parent
* **Teacher**: name, subject, email, etc.
* **Student**: admission number, photo, parent, classroom
* **Classroom**: grade level, teacher, students
* **Assignment**: title, description, due date, classroom, postedBy (teacher)

---

## 🔐 Admin Login & Register

**File:** `controllers/loginController.js`

### Register an admin
![alt text](image.png)

```http
POST /api/login/admin_reg
```

**Request Body:**

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securePassword",
  "secretKey": "Admin123Pass"
}
```

**Response:**

```json
{
  "user": {
    "_id": "user_id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true
  },
  "message": "Admin account created successfully"
}
```

### Login

```http
POST /api/login
```
![alt text](image-1.png)
**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "securePassword"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "user_id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Controller Code:**

```js
const { User } = require('../models/SchoolDb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid Credentials...' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account has been deactivated' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid Credentials...' });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.registerAdmin = async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Unauthorized Account Creation' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
    teacher: null,
    parent: null
  });

  const user = await newUser.save();

  res.status(201).json({ user, message: 'Admin account created successfully' });
};
```

---

## 🧾 Express Setup (app.js)

```js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

const loginRoutes = require('./routes/login');
app.use('/api/login', loginRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## 🔒 Authentication Middleware

### File: middleware/auth.js

#### This middleware verifies JWT tokens and restricts access based on roles.

```js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

module.exports = { auth, authorizeRoles }
```

## Classroom Controller
The classroom controller provides full CRUD operations for managing classrooms in the school system. It includes functionality to retrieve all classrooms with detailed teacher and student information, fetch a single classroom by ID, and populate associated teacher and student data. It also allows administrators to add new classrooms, update existing ones (such as changing the assigned teacher or class details), and delete classrooms from the system. The operations are built using Mongoose, and proper error handling ensures appropriate responses when classrooms are not found or when database operations fail.
add class
![alt text](image-2.png)
get classes
![alt text](image-3.png)

get class
![alt text](image-4.png)
```js
const { Classroom } = require('../models/SchoolDb'); // Import relevant models

// ==============================
// Get all classrooms
// Includes teacher and student details for admin view
// ==============================
exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate('teacher', 'name email phone')              // Populate assigned teacher's info
      .populate('students', 'name admissionNumber');        // Populate basic student info
    res.json(classrooms); // Return all classrooms with populated data
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classrooms', error: err.message });
  }
};

// ==============================
// Add a new classroom
// Body must include teacher ID and other required fields
// ==============================
exports.addClassroom = async (req, res) => {
  try {
    // Create a new Classroom using request data
    const newClassroom = new Classroom(req.body);

    // Save the new classroom to the database
    const savedClassroom = await newClassroom.save();

    // Return the saved classroom
    res.status(201).json(savedClassroom);
  } catch (err) {
    res.status(400).json({ message: 'Error adding classroom', error: err.message });
  }
};

// ==============================
// Get a single classroom by ID
// Includes full teacher and student info
// ==============================
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('teacher', 'name email')                   // Populate teacher details
      .populate('students', 'name admissionNumber');       // Populate student details

    // If classroom not found, return 404
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    res.json(classroom); // Return the classroom
  } catch (err) {
    res.status(500).json({ message: 'Error fetching classroom', error: err.message });
  }
};

// ==============================
// Update classroom
// Allows updating of teacher, name, or other properties
// ==============================
exports.updateClassroom = async (req, res) => {
  try {
    // Find the classroom by ID and update it
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );

    // If classroom not found, return 404
    if (!updatedClassroom) return res.status(404).json({ message: 'Classroom not found' });

    res.json(updatedClassroom); // Return the updated classroom
  } catch (err) {
    res.status(400).json({ message: 'Error updating classroom', error: err.message });
  }
};

// ==============================
// Delete classroom by ID
// Removes classroom from the system
// ==============================
exports.deleteClassroom = async (req, res) => {
  try {
    // Find and delete the classroom
    const deletedClassroom = await Classroom.findByIdAndDelete(req.params.id);

    // If not found, return 404
    if (!deletedClassroom) return res.status(404).json({ message: 'Classroom not found' });

    res.json({ message: 'Classroom deleted successfully' }); // Return success message
  } catch (err) {
    res.status(500).json({ message: 'Error deleting classroom', error: err.message });
  }
};
```
### Classroom router
```js
// Classroom routes
const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { auth, authorizeRoles } = require('../middlewares/auth');

// GET all classrooms
router.get('/', classroomController.getAllClassrooms);

// POST add a new classroom
router.post('/', auth, authorizeRoles('admin'), classroomController.addClassroom);

// GET classroom by ID
router.get('/:id', classroomController.getClassroomById);

// PUT update classroom by ID
router.put('/:id', auth, authorizeRoles('admin'), classroomController.updateClassroom);

// DELETE classroom by ID
router.delete('/:id', classroomController.deleteClassroom);

module.exports = router;
```

```js
// Import classroom routes and mount on /api/classrooms
const classroomRoutes = require('./routes/classrooms');
app.use('/api/classrooms', classroomRoutes);
```
## Teacher Controller
This teacher controller manages all operations related to teachers, including their creation, retrieval, update, deletion, and dashboard access. It supports registering a new teacher and automatically creates a corresponding user account with a default password and role set to "teacher". It also allows admins to fetch all teachers or a specific teacher by ID, along with their associated classrooms and assignments. Teachers can view their own classrooms and assignments based on their authenticated session. Additionally, when a teacher is deleted, the controller ensures cleanup by unassigning them from any classrooms and removing the linked user account. These operations are secured using middleware that extracts the teacher from the authenticated user context, ensuring role-based access.
### add teacher
![alt text](image-5.png)
### get teachers
![alt text](image-6.png)
### put teacher
![alt text](image-7.png)
```js
const { Teacher, User,Classroom, Assignment } = require('../models/SchoolDb');
const bcrypt = require('bcrypt');

exports.getAllTeachers = async (req, res) => {
  try {
    // Fetch all teachers from the database
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    // Handle any errors during fetch
    res.status(500).json({ message: 'Error fetching teachers', error: err.message });
  }
};


exports.addTeacher = async (req, res) => {
  try {
    // Step 1: Create a new Teacher document with data from request body
    const {email}=req.body
    const existEmail=await Teacher.findOne({email})
    if (existEmail) return res.status(404).json({message:"Teacher already exist"})

    const newTeacher = new Teacher(req.body);
    const savedTeacher = await newTeacher.save(); // Save teacher to DB

    // Step 2: Create a corresponding User document for login purposes

    // Set a default password for the new user (in real apps, generate or require reset)
    const defaultPassword = 'teacher1234';

    // Hash the default password for security before saving
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create a User with teacher's name, email, hashed password, and role 'teacher'
    const newUser = new User({
      name: savedTeacher.name,
      email: savedTeacher.email,
      password: hashedPassword,
      role: 'teacher',
      teacher: savedTeacher._id // link to the teacher document by ID
    });

    // Save the new User document
    await newUser.save();

    // Respond with the saved teacher and success message
    res.status(201).json({ teacher: savedTeacher, message: 'Teacher and user account created successfully' });
  } catch (err) {
    // Handle errors such as validation or database errors
    res.status(400).json({ message: 'Error adding teacher', error: err.message });
  }
};


exports.getTeacherById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('teacher');
    if (!user || !user.teacher) return res.status(404).json({ message: 'Teacher not foundf' });

    const teacher = user.teacher;
    const teacherId = teacher._id;

    const classrooms = await Classroom.find({ teacher: teacherId })
      .populate('students', 'name admissionNumber');

    const assignments = await Assignment.find({ postedBy: teacherId })
      .populate('classroom', 'name');

    res.json({ teacher, classrooms, assignments });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teacher dashboard data', error: err.message });
  }
};



exports.updateTeacher = async (req, res) => {
  try {
    // Update teacher with data from request body, return updated document
    // update requires the  id, body
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // If no teacher found, send 404
    if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    // Send back updated teacher data
    res.json(updatedTeacher);
  } catch (err) {
    // Handle validation or database errors
    res.status(400).json({ message: 'Error updating teacher', error: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    // Delete teacher by ID from request params
    const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

    // If no teacher found, return 404
    if (!deletedTeacher) return res.status(404).json({ message: 'Teacher not found' });

    // Unassign this teacher from any classroom
    await Classroom.updateMany({ teacher: teacherId }, { $set: { teacher: null } });

    // Delete the linked user
    await User.findOneAndDelete({ teacher: teacherId });

    // Respond with success message after deletion
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error('Error deleting teacher:', err); 
    // Handle errors during deletion
    res.status(500).json({ message: 'Error deleting teacher', error: err.message });
  }
};


// ========================
// CLASS-RELATED OPERATIONS 
// ========================
// Get only classes the teacher teaches
exports.getMyClasses = async (req, res) => {
  try {
    // Get teacher ID from the logged-in user
    const userId = req.user.userId;
    
    // Find the user and populate the 'teacher' reference
    const user = await User.findById(userId).populate('teacher');

    // Check if the user exists and is linked to a teacher
    if (!user || !user.teacher) {
      return res.status(404).json({ message: 'Teacher not found.' });
    }

    // Get all classrooms taught by this teacher, including the students
    const classes = await Classroom.find({ teacher: user.teacher._id })
      .populate('students'); // <-- This populates the students array

    // Send the result
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getMyAssignments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('teacher');
    
    const assignments = await Assignment.find({ postedBy: user.teacher._id })
      .populate('classroom') // Include classroom details
      .sort({ dueDate: 1 });
    console.log(assignments)
    res.status(200).json({ assignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```
## Teachers routes
```js
// Teacher routes
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { auth, authorizeRoles } = require('../middlewares/auth');

// GET /api/teachers - Get all teachers
router.get('/', auth, teacherController.getAllTeachers);

// POST /api/teachers - Create a new teacher
router.post('/', auth, authorizeRoles('admin'), teacherController.addTeacher);

// Specific static routes
router.get('/myclasses', auth, teacherController.getMyClasses);       // New dedicated controller
router.get('/myassignments', auth, teacherController.getMyAssignments); // New dedicated controller
// router.post('/myassignments', auth, teacherController.createAssignment); // New dedicated controller

// Dynamic route LAST
// GET /api/teachers/:id - Get a single teacher
router.get('/:id', auth, teacherController.getTeacherById);

// PUT /api/teachers/:id - Update a teacher
router.put('/:id', auth, authorizeRoles('admin'), teacherController.updateTeacher);

// DELETE /api/teachers/:id - Delete a teacher
router.delete('/:id', auth, authorizeRoles('admin'), teacherController.deleteTeacher);

module.exports = router;
```

## Assignments Controller
This assignment controller handles all backend logic for managing assignments in the school system. It enables administrators to retrieve all assignments with full classroom and teacher details, and allows only authenticated teachers to create new assignments. When adding an assignment, it verifies both the teacher’s identity and the existence of the referenced classroom to ensure data consistency. Additionally, it provides functionality to fetch a single assignment by ID, update assignment details, and delete assignments when needed. All returned data is enriched with related teacher and classroom info using Mongoose’s population feature, improving the API's usefulness for frontend consumers.

```js
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
```

## Assignments Routes
```js
// Assignment routes
const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const {auth}= require('../middlewares/auth');

router.get('/',auth, assignmentController.getAllAssignments);
router.post('/',auth, assignmentController.addAssignment);
router.get('/:id',auth, assignmentController.getAssignmentById);
router.put('/:id',auth, assignmentController.updateAssignment);
router.delete('/:id',auth, assignmentController.deleteAssignment);

module.exports = router;
```
## Parents Controller
This parent controller manages all backend operations related to parent users in the school system. It provides endpoints to fetch all parents, add new parents, retrieve a parent by national ID, update parent information, and delete a parent along with their corresponding user account. When adding a new parent, the system ensures uniqueness by checking both email and national ID to prevent duplication. Upon successful parent creation, a linked user account is also created with a default password and a role set as 'parent', enabling login functionality. The controller ensures tight integration between the `Parent` and `User` models and supports full CRUD operations with proper error handling throughout.

```js
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
```
## Parents Routes
```js
// Parent routes
const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const { auth, authorizeRoles } = require('../middlewares/auth');

router.get('/', parentController.getAllParents);
router.post('/', auth, authorizeRoles('admin'),parentController.addParent);
router.get('/:id', parentController.getParentById);
router.put('/:id',auth, authorizeRoles('admin'), parentController.updateParent);
router.delete('/:id', auth, authorizeRoles('admin'),parentController.deleteParent);

module.exports = router;
```

## Students Controller
This student controller handles all key operations related to student management within the school system. It allows administrators to retrieve all students (along with their parent and classroom info), add new students (with profile photo upload support via Multer), view individual student details, update student records, and delete students. When adding a student, the system verifies that the parent exists (using their national ID), checks for unique admission numbers, ensures the specified classroom exists, and processes the uploaded photo by renaming and storing it in the `uploads/` directory. Once saved, the student is also linked to their classroom. The controller ensures data consistency and integrates well with related models (`Parent`, `Classroom`) while maintaining robust error handling.

```jsx

const { Student, Parent, Classroom } = require('../models/SchoolDb');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Get all students (with populated parent and classroom)
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('classroom')
      .populate('parent');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};


// Basic multer setup (auto stores to 'uploads/' with random names)
const upload = multer({ dest: 'uploads/' });
exports.uploadStudentPhoto = upload.single('photo');
// Add student and also the profile picture
exports.addStudent = async (req, res) => {
  try {
    const { name, dateOfBirth, gender, admissionNumber, parentNationalId, classroomId } = req.body;

    // 1. Find parent by national ID
    const parent = await Parent.findOne({ nationalId: parentNationalId });
    if (!parent) {
      return res.status(400).json({ message: 'Parent with provided national ID not found' });
    }

    // 2. Check if admission number already exists
    const student = await Student.findOne({ admissionNumber });
    if (student) {
      return res.status(400).json({ message: 'Admission No. has already been assigned to someone else' });
    }

    // 3. Check if classroom exists
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(400).json({ message: 'Classroom not found' });
    }

    // 4. Handle uploaded photo (rename with timestamp + extension)
    let photo = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFilename = Date.now() + ext;
      const newPath = path.join('uploads', newFilename);
      fs.renameSync(req.file.path, newPath);
      photo = newPath.replace(/\\/g, '/');
    }

    // 5. Create and save the new student
    const newStudent = new Student({
      name,
      dateOfBirth,
      gender,
      admissionNumber,
      photo,
      parent: parent._id,
      classroom: classroom._id
    });

    const savedStudent = await newStudent.save();

    // 6. Add student to classroom if not already added
    if (!classroom.students.includes(savedStudent._id)) {
      classroom.students.push(savedStudent._id);
      await classroom.save();
    }

    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ message: 'Error adding student', error: err.message });
  }
};


// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('classroom')
      .populate('parent');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: 'Error updating student', error: err.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err.message });
  }
};
```
### Students Controller
```js
// Student routes

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// GET all students
router.get('/', studentController.getAllStudents);

// POST a new student
router.post('/', studentController.uploadStudentPhoto, studentController.addStudent);

// GET a student by ID
router.get('/:id', studentController.getStudentById);

// PUT (update) a student by ID
router.put('/:id', studentController.updateStudent);

// DELETE a student by ID
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
```

## Admin Dashboard
This `getDashboardStats` function is an API controller for the admin dashboard. It fetches important statistics from the school system database to give the admin a quick overview. First, it counts the total number of students, teachers, parents, classrooms, and active users — all done in parallel using `Promise.all()` to improve performance. Then, it retrieves the five most recently added students and teachers, sorting them by their creation date in descending order. Finally, it returns all of this information as a single JSON response. If any part of the process fails, it sends a 500 error with a descriptive message. This function is useful for giving administrators a real-time summary of the system’s usage and recent activity.

![alt text](image-8.png)

```js
const { Student, Teacher, Parent, Classroom, User } = require('../models/SchoolDb'); // Import all relevant models

// ==============================
// Get Dashboard Statistics
// Returns total counts and recent records for admin dashboard
// ==============================
exports.getDashboardStats = async (req, res) => {
  try {
    // Run all count operations in parallel for better performance
    const [
      totalStudents,
      totalTeachers,
      totalParents,
      totalClassrooms,
      activeUsers
    ] = await Promise.all([
      Student.countDocuments(),                // Count all students
      Teacher.countDocuments(),                // Count all teachers
      Parent.countDocuments(),                 // Count all parents
      Classroom.countDocuments(),              // Count all classrooms
      User.countDocuments({ isActive: true })  // Count all active user accounts
    ]);

    // Get the 5 most recent students (sorted by newest)
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get the 5 most recent teachers (sorted by newest)
    const recentTeachers = await Teacher.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Return all stats in a single response
    res.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClassrooms,
      activeUsers,
      recentStudents,
      recentTeachers
    });
  } catch (err) {
    // Return error message if anything fails
    res.status(500).json({ message: 'Failed to load dashboard stats', error: err.message });
  }
};
```
## Teachers Dashboard
```js
const { User,Classroom, Assignment } = require('../models/SchoolDb');

exports.getTeacherStats = async (req, res) => {
  try {
    const userId = req.params.id;
    // console.log(userId)

    // Step 1: Get the teacher's ObjectId from User
    const user = await User.findById(userId);
    if (!user || !user.teacher) {
      return res.status(404).json({ message: 'Teacher not found or not linked to user' });
    }

    const teacherId = user.teacher;

    // Step 2: Aggregate classrooms to get class count and student total
    const classStats = await Classroom.aggregate([
      { $match: { teacher: teacherId } },
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          totalStudents: { $sum: { $size: "$students" } }
        }
      }
    ]);

    // Step 3: Count assignments
    const totalAssignments = await Assignment.countDocuments({ postedBy: teacherId });

    // Prepare final response
    const result = {
      totalClasses: classStats[0]?.totalClasses || 0,
      totalStudents: classStats[0]?.totalStudents || 0,
      totalAssignments
    };

    res.json(result);
  } catch (err) {
    console.error('Error fetching teacher stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
```


## Parents Dashboard
```js

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
```

## Parents -assignment
```js
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


```