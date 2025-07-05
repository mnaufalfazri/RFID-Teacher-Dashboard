/**
 * This script starts both frontend and backend services configured
 * to work across a local network, allowing different devices to connect.
 */

const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get local IP address
const getLocalIpAddress = () => {
  const nets = os.networkInterfaces();
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

const localIp = getLocalIpAddress();
const backendPort = process.env.PORT || 5000;
const frontendPort = process.env.NEXT_PORT || 3000;

// Create or update the frontend .env file
const updateFrontendEnv = () => {
  const envPath = path.resolve(__dirname, '../frontend/.env');
  const envContent = `NEXT_PUBLIC_API_URL=http://${localIp}:${backendPort}/api\n`;
  
  fs.writeFileSync(envPath, envContent);
  console.log(`Updated frontend environment configuration at: ${envPath}`);
  console.log(`API URL set to: http://${localIp}:${backendPort}/api`);
};

// Create or update the backend .env file if it doesn't exist
const updateBackendEnv = () => {
  const envPath = path.resolve(__dirname, '../backend/.env');
  
  if (!fs.existsSync(envPath)) {
    const envContent = `NODE_ENV=development
PORT=${backendPort}
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
`;
    fs.writeFileSync(envPath, envContent);
    console.log(`Created backend environment configuration at: ${envPath}`);
    console.log('Please update the MongoDB URI and JWT secret as needed.');
  }
};

// Start the backend server
const startBackend = () => {
  console.log('\n📡 Starting backend server...');
  
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.resolve(__dirname, '../backend'),
    env: { ...process.env, PORT: backendPort, HOST: '0.0.0.0' },
    stdio: 'inherit'
  });
  
  backend.on('error', (err) => {
    console.error('Failed to start backend:', err);
  });
  
  return backend;
};

// Start the frontend server
const startFrontend = () => {
  console.log('\n📱 Starting frontend server...');
  
  const frontend = spawn('npm', ['run', 'dev', '--', '-p', frontendPort, '-H', '0.0.0.0'], {
    cwd: path.resolve(__dirname, '../frontend'),
    stdio: 'inherit'
  });
  
  frontend.on('error', (err) => {
    console.error('Failed to start frontend:', err);
  });
  
  return frontend;
};

// Main function
const main = async () => {
  console.log('🌐 Setting up local network development environment');
  console.log(`📍 Local IP address: ${localIp}`);
  
  // Update environment files
  updateFrontendEnv();
  updateBackendEnv();
  
  console.log('\n🚀 Starting services...');
  console.log('Press Ctrl+C to stop all services\n');
  
  // Start services
  const backend = startBackend();
  const frontend = startFrontend();
  
  // Handle script termination
  const cleanup = () => {
    console.log('\n🛑 Stopping all services...');
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
};

// Run the script
main().catch(err => {
  console.error('Error running the script:', err);
  process.exit(1);
});
