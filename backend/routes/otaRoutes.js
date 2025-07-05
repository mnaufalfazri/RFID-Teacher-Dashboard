const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configure multer for firmware file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'firmware');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `firmware-${timestamp}.bin`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow .bin files
    if (path.extname(file.originalname).toLowerCase() === '.bin') {
      cb(null, true);
    } else {
      cb(new Error('Only .bin files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Firmware metadata storage (in production, use database)
let firmwareMetadata = {
  version: '1.0.0',
  filename: null,
  uploadDate: null,
  checksum: null,
  size: 0
};

// Load existing firmware metadata if exists
const metadataPath = path.join(__dirname, '..', 'uploads', 'firmware', 'metadata.json');
if (fs.existsSync(metadataPath)) {
  try {
    firmwareMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (error) {
    console.error('Error loading firmware metadata:', error);
  }
}

// Helper function to calculate file checksum
function calculateChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Helper function to save metadata
function saveMetadata() {
  const metadataDir = path.dirname(metadataPath);
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  fs.writeFileSync(metadataPath, JSON.stringify(firmwareMetadata, null, 2));
}

// @desc    Check for firmware updates
// @route   GET /api/ota/check
// @access  Public (ESP32)
router.get('/check', (req, res) => {
  const { version: currentVersion, deviceId } = req.query;
  
  console.log(`OTA check request from device ${deviceId}, current version: ${currentVersion}`);
  
  // Compare versions (simple string comparison for now)
  const updateAvailable = currentVersion !== firmwareMetadata.version && firmwareMetadata.filename;
  
  res.json({
    updateAvailable,
    latestVersion: firmwareMetadata.version,
    currentVersion: currentVersion,
    downloadUrl: updateAvailable ? `/api/ota/download` : null,
    fileSize: updateAvailable ? firmwareMetadata.size : 0,
    checksum: updateAvailable ? firmwareMetadata.checksum : null,
    deviceId: deviceId
  });
});

// @desc    Download firmware
// @route   GET /api/ota/download
// @access  Public (ESP32)
router.get('/download', (req, res) => {
  if (!firmwareMetadata.filename) {
    return res.status(404).json({ error: 'No firmware available' });
  }
  
  const firmwarePath = path.join(__dirname, '..', 'uploads', 'firmware', firmwareMetadata.filename);
  
  if (!fs.existsSync(firmwarePath)) {
    return res.status(404).json({ error: 'Firmware file not found' });
  }
  
  console.log(`Firmware download requested: ${firmwareMetadata.filename}`);
  
  // Set appropriate headers for firmware download
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${firmwareMetadata.filename}"`);
  res.setHeader('Content-Length', firmwareMetadata.size);
  
  // Stream the file
  const fileStream = fs.createReadStream(firmwarePath);
  fileStream.pipe(res);
});

// @desc    Upload new firmware
// @route   POST /api/ota/upload
// @access  Private (Admin only)
router.post('/upload', upload.single('firmware'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No firmware file uploaded' });
    }
    
    const { version } = req.body;
    if (!version) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Version is required' });
    }
    
    // Calculate checksum
    const checksum = calculateChecksum(req.file.path);
    
    // Update metadata
    firmwareMetadata = {
      version: version,
      filename: req.file.filename,
      uploadDate: new Date().toISOString(),
      checksum: checksum,
      size: req.file.size
    };
    
    // Save metadata to file
    saveMetadata();
    
    console.log(`New firmware uploaded: ${req.file.filename}, version: ${version}`);
    
    res.json({
      success: true,
      message: 'Firmware uploaded successfully',
      firmware: firmwareMetadata
    });
    
  } catch (error) {
    console.error('Error uploading firmware:', error);
    res.status(500).json({ error: 'Failed to upload firmware' });
  }
});

// @desc    Get current firmware info
// @route   GET /api/ota/info
// @access  Private
router.get('/info', (req, res) => {
  res.json({
    success: true,
    firmware: firmwareMetadata
  });
});

// @desc    Delete firmware
// @route   DELETE /api/ota/firmware
// @access  Private (Admin only)
router.delete('/firmware', (req, res) => {
  try {
    if (firmwareMetadata.filename) {
      const firmwarePath = path.join(__dirname, '..', 'uploads', 'firmware', firmwareMetadata.filename);
      if (fs.existsSync(firmwarePath)) {
        fs.unlinkSync(firmwarePath);
      }
    }
    
    // Reset metadata
    firmwareMetadata = {
      version: '1.0.0',
      filename: null,
      uploadDate: null,
      checksum: null,
      size: 0
    };
    
    saveMetadata();
    
    res.json({
      success: true,
      message: 'Firmware deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting firmware:', error);
    res.status(500).json({ error: 'Failed to delete firmware' });
  }
});

module.exports = router;