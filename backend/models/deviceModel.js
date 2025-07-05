const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['NORMAL', 'TAMPERED', 'OFFLINE'],
      default: 'NORMAL'
    },
    ipAddress: {
      type: String,
      default: null
    },
    wifiSignal: {
      type: Number,
      default: null
    },
    uptime: {
      type: Number,
      default: 0
    },
    cacheSize: {
      type: Number,
      default: 0
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now
    },
    firmware: {
      type: String,
      default: null
    },
    macAddress: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: 'Unknown'
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Set device as offline if no heartbeat for 2 minutes
deviceSchema.statics.checkOfflineDevices = async function() {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  
  await this.updateMany(
    { 
      lastHeartbeat: { $lt: twoMinutesAgo },
      status: { $ne: 'OFFLINE' }
    },
    { 
      status: 'OFFLINE'
    }
  );
};

const Device = mongoose.model('Device', deviceSchema);

module.exports = Device;
