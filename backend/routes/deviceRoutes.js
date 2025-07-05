const express = require('express');
const {
  registerDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice,
  deviceHeartbeat
} = require('../controllers/deviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (no auth required)
router.post('/heartbeat', deviceHeartbeat);

// Apply auth middleware to remaining routes
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getDevices);
router.get('/:deviceId', getDevice);

// Routes that need admin authorization
router.post('/register', authorize('admin'), registerDevice);
router.put('/:deviceId', authorize('admin'), updateDevice);
router.delete('/:deviceId', authorize('admin'), deleteDevice);

module.exports = router;
