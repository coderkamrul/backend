const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
require('dotenv').config();
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const DB = process.env.MONGO_URI;

mongoose.connect(DB).then(() => {
    console.log(`Connection successful`);
}).catch((err) => console.log(err));

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create uploads directory if not exists
const fs = require('fs');
const path = require('path');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Student schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    father: {
        type: String,
        required: true,
    },
    mother: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    class: {
        type: String,
        required: true,
    },
    roll: {
        type: Number,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: false,
    }
}, { timestamps: true });

const Students = mongoose.model("Students", studentSchema);




app.post("/createstudent", upload.single('image'), async (req, res) => {
    try {
        let bodyData = req.body; // Initialize bodyData with the request body
        if (req.file) {
            bodyData.image = req.file.path; // Set the image field if file exists
        } else {
            // If no file is uploaded, set default image URL
            bodyData.image = "https://img.freepik.com/premium-vector/student-avatar-illustration-user-profile-icon-youth-avatar_118339-4401.jpg"; // Replace default_image_url.jpg with your default image URL
        }
        const students = new Students(bodyData);
        const studentsData = await students.save();
        res.send(studentsData);
    } catch (error) {
        res.send(error);
    }
});

// Get all students
app.get("/students", async (req, res) => {
    try {
        const students = await Students.find();
        res.send(students);
    } catch (error) {
        res.send(error);
    }
});

// Get single student by ID
app.get("/single-student/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const singleStudent = await Students.findById(id);
        res.send(singleStudent);
    } catch (error) {
        res.send(error);
    }
});

// Update student by ID with image upload
app.put("/update-student/:id", upload.single('image'), async (req, res) => {
    const { id } = req.params;
    try {
        const bodyData = req.body;
        if (req.file) {
            bodyData.image = req.file.path;
        }
        const updateStudent = await Students.findByIdAndUpdate(id, bodyData, { new: true });
        res.send(updateStudent);
    } catch (error) {
        res.send(error);
    }
});

// Delete student by ID
app.delete("/delete-student/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deleteStudent = await Students.findByIdAndDelete(id);
        res.send(deleteStudent);
    } catch (error) {
        res.send(error);
    }
});

// Serve images statically
app.use('/uploads', express.static('uploads'));

// Start server
app.listen(process.env.PORT, () => console.log("Server running on port", PORT));
