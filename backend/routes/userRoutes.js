const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin')); // Only admin can access user routes

// TODO: Implement user controller methods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User routes to be implemented'
  });
});

module.exports = router;
