const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  entryTime: {
    type: Date
  },
  exitTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  device: {
    type: String,
    required: [true, 'Please specify the device ID'],
  },
  securityStatus: {
    type: String,
    enum: ['SECURE', 'TAMPERED'],
    default: 'SECURE'
  },
  location: {
    type: String,
    default: 'main-gate'
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for student and date to ensure unique attendance records per day
AttendanceSchema.index({ student: 1, date: 1 }, { 
  unique: false 
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
