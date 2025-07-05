const express = require('express');
const {
  recordAttendance,
  getAttendanceRecords,
  getAttendanceReport,
  addAttendanceRecord,
  updateAttendanceRecord
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { deviceHeartbeat } = require('../controllers/deviceController');

const router = express.Router();

// Special public route for device heartbeat (no auth required)
router.post('/device/heartbeat', deviceHeartbeat);

// Public route for ESP32 RFID scanner
router.post('/scan', recordAttendance);

// Protected routes
router.use(protect);

// Routes for all authenticated users
router.get('/', getAttendanceRecords);
router.get('/report', getAttendanceReport);

// Routes for admin and teachers
router.post('/', authorize('admin', 'teacher'), addAttendanceRecord);
router.put('/:id', authorize('admin', 'teacher'), updateAttendanceRecord);

module.exports = router;
