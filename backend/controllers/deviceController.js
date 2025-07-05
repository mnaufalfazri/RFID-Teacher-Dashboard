const Device = require('../models/deviceModel');
const asyncHandler = require('express-async-handler');
const { getCurrentTime, toISOString } = require('../utils/timezone');

// @desc    Register a new device or update if exists
// @route   POST /api/devices/register
// @access  Private/Admin
exports.registerDevice = asyncHandler(async (req, res) => {
  const { deviceId, location, description, ipAddress, wifiSignal, uptime, cacheSize, firmware, macAddress } = req.body;

  const device = await Device.findOneAndUpdate(
    { deviceId },
    { 
      deviceId,
      location: location || 'Unknown',
      description: description || '',
      $setOnInsert: { status: 'OFFLINE' }
    },
    { new: true, upsert: true }
  );

  res.status(201).json({
    success: true,
    data: device
  });
});

// @desc    Get all devices
// @route   GET /api/devices
// @access  Private
exports.getDevices = asyncHandler(async (req, res) => {
  // Update status for devices that haven't sent heartbeats recently
  await Device.checkOfflineDevices();
  
  const devices = await Device.find().sort({ lastHeartbeat: -1 });

  res.status(200).json({
    success: true,
    count: devices.length,
    data: devices
  });
});

// @desc    Get a single device
// @route   GET /api/devices/:deviceId
// @access  Private
exports.getDevice = asyncHandler(async (req, res) => {
  const device = await Device.findOne({ deviceId: req.params.deviceId });

  if (!device) {
    return res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }

  res.status(200).json({
    success: true,
    data: device
  });
});

// @desc    Update device
// @route   PUT /api/devices/:deviceId
// @access  Private/Admin
exports.updateDevice = asyncHandler(async (req, res) => {
  const { location, description } = req.body;

  const device = await Device.findOneAndUpdate(
    { deviceId: req.params.deviceId },
    { location, description },
    { new: true, runValidators: true }
  );

  if (!device) {
    return res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }

  res.status(200).json({
    success: true,
    data: device
  });
});

// @desc    Delete device
// @route   DELETE /api/devices/:deviceId
// @access  Private/Admin
exports.deleteDevice = asyncHandler(async (req, res) => {
  const device = await Device.findOneAndDelete({ deviceId: req.params.deviceId });

  if (!device) {
    return res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});
    
    // @desc    Device heartbeat to update status and network info
    // @route   POST /api/devices/heartbeat
    // @access  Public
    exports.deviceHeartbeat = asyncHandler(async (req, res) => {
      const { deviceId, ipAddress, wifiSignal, uptime, cacheSize, firmware, macAddress } = req.body;
    
      if (!deviceId) {
        res.status(400);
        throw new Error('Device ID is required');
      }
    
      const device = await Device.findOneAndUpdate(
        { deviceId },
        { 
          status: 'NORMAL',
          lastHeartbeat: getCurrentTime(),
          ipAddress,
          wifiSignal,
          uptime,
          cacheSize,
          firmware,
          macAddress
        },
        { new: true, upsert: true }
      );
    
      res.json({
        success: true,
        data: device,
        serverTime: toISOString(getCurrentTime())
      });
    });
    
    // Remove duplicate processHeartbeat function since deviceHeartbeat handles this now
