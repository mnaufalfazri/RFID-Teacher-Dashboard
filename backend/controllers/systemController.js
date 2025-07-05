const asyncHandler = require('express-async-handler');
const os = require('os');

// @desc    Get network information
// @route   GET /api/system/network-info
// @access  Private/Admin
exports.getNetworkInfo = asyncHandler(async (req, res) => {
  // Get network interfaces
  const networkInterfaces = os.networkInterfaces();
  let localIp = null;

  // Find the first non-internal IPv4 address
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp) break;
  }

  // Get server port from environment
  const serverPort = process.env.PORT || 5000;

  res.json({
    success: true,
    data: {
      localIp,
      serverPort,
      hostname: os.hostname(),
      // If there was a public URL set up, it could be added here
      publicUrl: process.env.PUBLIC_URL || null
    }
  });
});

// @desc    Get system health
// @route   GET /api/system/health
// @access  Private/Admin
exports.getSystemHealth = asyncHandler(async (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime,
      memory: {
        rss: Math.round(memory.rss / 1024 / 1024), // Convert to MB
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024)
      },
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});
