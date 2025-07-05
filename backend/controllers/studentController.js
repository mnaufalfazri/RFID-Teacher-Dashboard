const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');
const { getCurrentTime } = require('../utils/timezone');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
exports.getStudents = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filter
  let query = {};
  
  if (req.query.class) {
    query.class = req.query.class;
  }
  
  if (req.query.grade) {
    query.grade = req.query.grade;
  }
  
  if (req.query.active) {
    query.active = req.query.active === 'true';
  }
  
  // Search
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { studentId: { $regex: req.query.search, $options: 'i' } },
      { rfidTag: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Fetch students
  const students = await Student.find(query)
    .sort({ name: 1 })
    .skip(startIndex)
    .limit(limit);

  // Get total count
  const total = await Student.countDocuments(query);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: students
  });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
exports.getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private/Admin
exports.createStudent = asyncHandler(async (req, res) => {
  // Check if student with same RFID tag exists
  const existingStudent = await Student.findOne({ rfidTag: req.body.rfidTag });
  
  if (existingStudent) {
    res.status(400);
    throw new Error('Student with this RFID tag already exists');
  }
  
  // Create student
  const student = await Student.create(req.body);

  res.status(201).json({
    success: true,
    data: student
  });
});

// @desc    Get last detected RFID tag
// @route   GET /api/students/last-rfid
// @access  Private
exports.getLastRfidTag = asyncHandler(async (req, res) => {
  // Get the last RFID tag from global variable or cache
  if (!global.lastDetectedRfid) {
    res.status(404);
    throw new Error('No RFID tag has been detected recently');
  }

  res.status(200).json({
    success: true,
    data: {
      rfidTag: global.lastDetectedRfid,
      detectedAt: global.lastDetectedRfidTime
    }
  });
});

// @desc    Store last detected RFID tag
// @route   POST /api/students/store-rfid
// @access  Public (from ESP32 device)
exports.storeRfidTag = asyncHandler(async (req, res) => {
  const { rfidTag, deviceId } = req.body;

  if (!rfidTag || !deviceId) {
    res.status(400);
    throw new Error('Please provide both RFID tag and device ID');
  }

  // Store in global variable for simplicity
  // In production, consider using Redis or another caching solution
  global.lastDetectedRfid = rfidTag;
  global.lastDetectedRfidTime = getCurrentTime();

  res.status(200).json({
    success: true,
    message: 'RFID tag stored successfully'
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
exports.updateStudent = asyncHandler(async (req, res) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check if updating RFID tag and if it's already in use
  if (req.body.rfidTag && req.body.rfidTag !== student.rfidTag) {
    const existingTagStudent = await Student.findOne({ rfidTag: req.body.rfidTag });
    
    if (existingTagStudent) {
      res.status(400);
      throw new Error('This RFID tag is already assigned to another student');
    }
  }

  // Update student
  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await Student.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get student by RFID tag
// @route   GET /api/students/rfid/:tag
// @access  Private
exports.getStudentByRfid = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ rfidTag: req.params.tag });

  if (!student) {
    res.status(404);
    throw new Error('Student not found with this RFID tag');
  }

  res.status(200).json({
    success: true,
    data: student
  });
});
