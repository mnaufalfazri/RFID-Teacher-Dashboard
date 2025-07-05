const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const asyncHandler = require('express-async-handler');
const { getCurrentTime, toJakartaTime, getStartOfDay, getEndOfDay, getNextDay } = require('../utils/timezone');

// @desc    Record attendance via RFID scan
// @route   POST /api/attendance/scan
// @access  Public (will be accessed from ESP32)
exports.recordAttendance = asyncHandler(async (req, res) => {
  const { rfidTag, deviceId, timestamp, status } = req.body;

  if (!rfidTag || !deviceId) {
    res.status(400);
    throw new Error('Please provide both RFID tag and device ID');
  }

  // Use timestamp from ESP32 if provided, otherwise use current time
  // Add 7 hours to ESP32 timestamp to adjust for timezone
  let scanTime;
  if (timestamp) {
    const espTime = new Date(timestamp);
    espTime.setHours(espTime.getHours() + 7); // Add 7 hours for Jakarta timezone
    scanTime = espTime;
  } else {
    scanTime = getCurrentTime();
  }

  // Log the received data for debugging
  console.log('Received attendance data:', {
    rfidTag,
    deviceId,
    timestamp,
    status,
    scanTime: scanTime.toISOString()
  });
  
  // Check device security status
  if (status === 'TAMPERED') {
    console.warn(`Security alert: Device ${deviceId} reported tampered status`);
  }

  // Find student by RFID tag
  const student = await Student.findOne({ rfidTag });

  if (!student) {
    res.status(404);
    throw new Error('Student not found with this RFID tag');
  }

  // Check if student is active
  if (!student.active) {
    res.status(400);
    throw new Error('Student account is inactive');
  }

  // Get today's date (midnight)
  const today = getStartOfDay(scanTime);

  // Check if entry attendance already exists for today
  const existingAttendance = await Attendance.findOne({
    student: student._id,
    date: { $gte: today }
  });

  let attendance;

  if (existingAttendance) {
    // If student already has entry time, record exit time
    if (existingAttendance.entryTime && !existingAttendance.exitTime) {
      attendance = await Attendance.findByIdAndUpdate(
        existingAttendance._id,
        { 
          exitTime: scanTime,
          device: deviceId,
          securityStatus: status || 'SECURE'
        },
        { new: true }
      );
    } else if (existingAttendance.exitTime) {
      // Already has both entry and exit times
      res.status(400);
      throw new Error('Student already has complete attendance record for today');
    }
  } else {
    // Create new attendance record with entry time
    attendance = await Attendance.create({
      student: student._id,
      entryTime: scanTime,
      device: deviceId,
      securityStatus: status || 'SECURE',
      date: today
    });
  }

  res.status(200).json({
    success: true,
    data: {
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
        grade: student.grade
      },
      attendance
    },
    message: existingAttendance && existingAttendance.entryTime ? 'Exit time recorded' : 'Entry time recorded'
  });
});

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendanceRecords = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filter options
  let query = {};
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    const startDate = getStartOfDay(req.query.startDate);
  const endDate = getEndOfDay(req.query.endDate);
    
    query.date = {
      $gte: startDate,
      $lte: endDate
    };
  } else if (req.query.date) {
    // Filter by specific date
    const specificDate = getStartOfDay(req.query.date);
  const nextDay = getNextDay(specificDate);
    
    query.date = {
      $gte: specificDate,
      $lt: nextDay
    };
  }
  
  // Filter by student
  if (req.query.student) {
    query.student = req.query.student;
  }
  
  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Fetch attendance records with student details
  const records = await Attendance.find(query)
    .populate('student', 'name studentId class grade')
    .sort({ date: -1, entryTime: -1 })
    .skip(startIndex)
    .limit(limit);

  // Get total count
  const total = await Attendance.countDocuments(query);

  res.status(200).json({
    success: true,
    count: records.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: records
  });
});

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private
exports.getAttendanceReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, class: className, grade } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide start and end dates');
  }
  
  // Parse dates
  const start = getStartOfDay(startDate);
  const end = getEndOfDay(endDate);
  
  // Build student filter
  let studentFilter = {};
  if (className) studentFilter.class = className;
  if (grade) studentFilter.grade = grade;
  
  // Get all relevant students
  const students = await Student.find(studentFilter).select('_id name studentId class grade');
  
  // Get attendance records for the date range
  const attendanceRecords = await Attendance.find({
    date: { $gte: start, $lte: end },
    student: { $in: students.map(s => s._id) }
  }).populate('student', 'name studentId class grade');
  
  // Group attendance by student
  const studentAttendance = {};
  
  // Initialize student attendance records
  students.forEach(student => {
    studentAttendance[student._id] = {
      student: {
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        class: student.class,
        grade: student.grade
      },
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      attendancePercentage: 0,
      records: []
    };
  });
  
  // Count days between start and end dates (inclusive)
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Process attendance records
  attendanceRecords.forEach(record => {
    const studentId = record.student._id.toString();
    
    if (studentAttendance[studentId]) {
      // Add record
      studentAttendance[studentId].records.push(record);
      
      // Update counts
      if (record.status === 'present') {
        studentAttendance[studentId].present += 1;
      } else if (record.status === 'absent') {
        studentAttendance[studentId].absent += 1;
      } else if (record.status === 'late') {
        studentAttendance[studentId].late += 1;
      } else if (record.status === 'half-day') {
        studentAttendance[studentId].halfDay += 1;
      }
    }
  });
  
  // Calculate attendance percentage for each student
  Object.keys(studentAttendance).forEach(studentId => {
    const student = studentAttendance[studentId];
    const presentDays = student.present + (student.late * 0.75) + (student.halfDay * 0.5);
    student.attendancePercentage = ((presentDays / totalDays) * 100).toFixed(2);
  });
  
  // Convert to array for response
  const reportData = Object.values(studentAttendance);
  
  res.status(200).json({
    success: true,
    totalDays,
    data: reportData
  });
});

// @desc    Manually add attendance record
// @route   POST /api/attendance
// @access  Private/Admin or Teacher
exports.addAttendanceRecord = asyncHandler(async (req, res) => {
  const { studentId, date, status, notes } = req.body;
  
  // Validate required fields
  if (!studentId || !date || !status) {
    res.status(400);
    throw new Error('Please provide student ID, date, and status');
  }
  
  // Find student
  const student = await Student.findById(studentId);
  
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  
  // Check if record already exists for this date
  const recordDate = getStartOfDay(date);
  const nextDay = getNextDay(recordDate);
  
  const existingRecord = await Attendance.findOne({
    student: studentId,
    date: { $gte: recordDate, $lt: nextDay }
  });
  
  if (existingRecord) {
    res.status(400);
    throw new Error('Attendance record already exists for this student on this date');
  }
  
  // Create attendance record
  const attendance = await Attendance.create({
    student: studentId,
    date: recordDate,
    status,
    notes,
    createdBy: req.user ? req.user._id : undefined,
    device: 'manual-entry'
  });
  
  // If status is present, set entry time
  if (status === 'present') {
    attendance.entryTime = toJakartaTime(date);
    await attendance.save();
  }
  
  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin or Teacher
exports.updateAttendanceRecord = asyncHandler(async (req, res) => {
  const { status, notes, entryTime, exitTime } = req.body;
  
  let attendance = await Attendance.findById(req.params.id);
  
  if (!attendance) {
    res.status(404);
    throw new Error('Attendance record not found');
  }
  
  // Update fields
  if (status) attendance.status = status;
  if (notes) attendance.notes = notes;
  if (entryTime) attendance.entryTime = toJakartaTime(entryTime);
  if (exitTime) attendance.exitTime = toJakartaTime(exitTime);
  
  // Save updates
  attendance = await attendance.save();
  
  res.status(200).json({
    success: true,
    data: attendance
  });
});
