const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes');
const otaRoutes = require('./routes/otaRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5050'],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Route logging middleware for debugging
app.use((req, res, next) => {
  console.log(`Route accessed: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ota', otaRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to School Attendance System API' });
});

// Error handling middleware
// Import routes
const systemRoutes = require('./routes/systemRoutes');
const deviceRoutes = require('./routes/deviceRoutes');

// Use routes
app.use('/api/system', systemRoutes);
app.use('/api/devices', deviceRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Get local IP address to display in the console
const getLocalIpAddress = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  // Find the first IPv4 non-internal address
  for (const name of Object.keys(results)) {
    if (results[name].length > 0) {
      return results[name][0];
    }
  }
  
  return 'localhost'; // Fallback to localhost
};

// Start server - listen on all network interfaces
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const localIp = getLocalIpAddress();

app.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Local:            http://localhost:${PORT}`);
  console.log(`On Your Network:  http://${localIp}:${PORT}`);
});

module.exports = app;
