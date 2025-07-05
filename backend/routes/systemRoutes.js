const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
  getNetworkInfo, 
  getSystemHealth 
} = require('../controllers/systemController');

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Routes that need admin role
router.get('/network-info', authorize('admin', 'teacher'), getNetworkInfo);
router.get('/health', authorize('admin'), getSystemHealth);

module.exports = router;
