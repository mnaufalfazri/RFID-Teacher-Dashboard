import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Chip, 
  Divider, 
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  SignalWifi4Bar, 
  SignalWifi3Bar, 
  SignalWifi2Bar, 
  SignalWifi1Bar, 
  SignalWifiOff,
  ArrowForward,
  RouteOutlined,
  MemoryOutlined
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { toJakartaTime } from '../utils/timezone';

// Helper function to get appropriate WiFi signal icon
const getWifiIcon = (signal) => {
  if (signal === 0 || signal === undefined) return <SignalWifiOff />;
  if (signal > -50) return <SignalWifi4Bar color="success" />;
  if (signal > -60) return <SignalWifi3Bar color="success" />;
  if (signal > -70) return <SignalWifi2Bar color="warning" />;
  return <SignalWifi1Bar color="error" />;
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'NORMAL':
      return 'success';
    case 'TAMPERED':
      return 'error';
    case 'OFFLINE':
      return 'default';
    default:
      return 'default';
  }
};

const DeviceSummary = ({ devices, loading, onViewDetails }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show helpful message for connection errors
  if (!devices && !loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="error" gutterBottom>
          Could not connect to device management service
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Make sure your backend server is running and accessible
        </Typography>
        <Button 
          variant="outlined" 
          onClick={onViewDetails}
          sx={{ mt: 2 }}
        >
          Go to Device Management
        </Button>
      </Paper>
    );
  }
  
  if (!devices || devices.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" gutterBottom>
          No devices connected yet
        </Typography>
        <Button 
          variant="outlined" 
          onClick={onViewDetails}
          sx={{ mt: 2 }}
        >
          Go to Device Management
        </Button>
      </Paper>
    );
  }

  // Count devices by status
  const deviceStatusCounts = devices.reduce((acc, device) => {
    acc[device.status] = (acc[device.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {devices.length}
              </Typography>
              <Typography variant="body1">Total Devices</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center', 
              bgcolor: 'success.light'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                {deviceStatusCounts['NORMAL'] || 0}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>Online</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ 
              p: 2, 
              textAlign: 'center', 
              bgcolor: 'error.light'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                {(deviceStatusCounts['OFFLINE'] || 0) + (deviceStatusCounts['TAMPERED'] || 0)}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white' }}>Issues</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        {devices.slice(0, 3).map((device) => (
          <Grid item xs={12} md={4} key={device.deviceId}>
            <Card sx={{ 
              borderLeft: 3,
              borderColor: device.status === 'NORMAL' 
                ? 'success.main' 
                : device.status === 'TAMPERED' 
                  ? 'error.main' 
                  : 'grey.400'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                    {device.deviceId}
                  </Typography>
                  <Chip 
                    label={device.status} 
                    color={getStatusColor(device.status)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RouteOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" noWrap>
                    {device.location || 'Unknown location'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="WiFi Signal">
                    <Box sx={{ mr: 1 }}>
                      {getWifiIcon(device.wifiSignal)}
                    </Box>
                  </Tooltip>
                  <Typography variant="body2">
                    {device.ipAddress || 'No IP'} 
                    {device.wifiSignal ? ` (${device.wifiSignal} dBm)` : ''}
                  </Typography>
                </Box>
                
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Last seen: {device.lastHeartbeat 
                    ? formatDistanceToNow(toJakartaTime(device.lastHeartbeat), { addSuffix: true }) 
                    : 'Never'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {devices.length > 3 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {devices.length - 3} more {devices.length - 3 === 1 ? 'device' : 'devices'} not shown
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button 
          variant="outlined" 
          endIcon={<ArrowForward />}
          onClick={onViewDetails}
        >
          View All Devices
        </Button>
      </Box>
    </>
  );
};

export default DeviceSummary;
