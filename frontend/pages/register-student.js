import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { 
  Container, Box, Typography, Paper, 
  TextField, Button, Grid, MenuItem,
  Alert, CircularProgress, Divider,
  IconButton, Tooltip, Snackbar
} from '@mui/material';
import { Save, ArrowBack, Refresh, CreditCard } from '@mui/icons-material';
import Layout from '../components/Layout';
import { isAuthenticated } from '../utils/auth';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function RegisterStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [rfidLoading, setRfidLoading] = useState(false);
  const [rfidSnackbar, setRfidSnackbar] = useState(false);
  const [rfidSnackbarMessage, setRfidSnackbarMessage] = useState('');
  const [rfidPolling, setRfidPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    // Check if user is authenticated and has admin rights
    const auth = isAuthenticated();
    if (!auth) {
      router.push('/login');
      return;
    }
    
    if (auth.user.role !== 'admin' && auth.user.role !== 'teacher') {
      router.push('/');
      toast.error('You do not have permission to access this page');
      return;
    }
    
    setUser(auth.user);
    
    // Cleanup polling interval when component unmounts
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [router, pollingInterval]);
  
  // Fungsi untuk mengambil RFID tag terakhir dari server
  const fetchLastRfidTag = async () => {
    try {
      setRfidLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/students/last-rfid`);
      
      if (response.data && response.data.data && response.data.data.rfidTag) {
        setValue('rfidTag', response.data.data.rfidTag);
        setRfidSnackbarMessage('RFID tag berhasil diambil dari perangkat!');
        setRfidSnackbar(true);
        
        // Jika polling aktif, hentikan polling
        if (rfidPolling) {
          stopRfidPolling();
        }
      } else {
        setRfidSnackbarMessage('Tidak ada RFID tag terdeteksi. Silakan scan kartu pada perangkat.');
        setRfidSnackbar(true);
      }
    } catch (error) {
      console.error('Error fetching RFID tag:', error);
      setRfidSnackbarMessage('Gagal mengambil RFID tag dari server: ' + (error.response?.data?.message || error.message));
      setRfidSnackbar(true);
    } finally {
      setRfidLoading(false);
    }
  };
  
  // Fungsi untuk memulai polling RFID tag
  const startRfidPolling = () => {
    setRfidPolling(true);
    setRfidSnackbarMessage('Menunggu kartu RFID di-scan pada perangkat...');
    setRfidSnackbar(true);
    
    // Polling setiap 2 detik
    const interval = setInterval(fetchLastRfidTag, 2000);
    setPollingInterval(interval);
  };
  
  // Fungsi untuk menghentikan polling RFID tag
  const stopRfidPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setRfidPolling(false);
    setRfidSnackbarMessage('Polling RFID dihentikan.');
    setRfidSnackbar(true);
  };
  
  // Fungsi untuk menutup snackbar
  const handleCloseSnackbar = () => {
    setRfidSnackbar(false);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      
      const auth = isAuthenticated();
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/students`,
        data,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Student registered successfully!');
        router.push('/students');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to register student. Please try again.'
      );
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Register Student | School Attendance System</title>
      </Head>

      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Register New Student
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBack />}
              onClick={() => router.push('/students')}
            >
              Back to Students
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper sx={{ p: 3 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    {...register('name', { 
                      required: 'Name is required',
                      maxLength: {
                        value: 50,
                        message: 'Name cannot exceed 50 characters'
                      }
                    })}
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Student ID"
                    {...register('studentId', { 
                      required: 'Student ID is required'
                    })}
                    error={Boolean(errors.studentId)}
                    helperText={errors.studentId?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={9}>
                      <TextField
                        fullWidth
                        label="RFID Tag Number"
                        {...register('rfidTag', { required: 'RFID Tag is required' })}
                        error={!!errors.rfidTag}
                        helperText={errors.rfidTag ? errors.rfidTag.message : 'Scan RFID card on device to auto-fill'}
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          endAdornment: (
                            <Tooltip title="Ambil RFID dari perangkat">
                              <IconButton 
                                onClick={fetchLastRfidTag} 
                                disabled={rfidLoading}
                                size="small"
                              >
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        variant="outlined"
                        color={rfidPolling ? "error" : "primary"}
                        startIcon={rfidPolling ? null : <CreditCard />}
                        onClick={rfidPolling ? stopRfidPolling : startRfidPolling}
                        disabled={rfidLoading}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        {rfidPolling ? "Berhenti Polling" : "Mulai Polling RFID"}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    required
                    fullWidth
                    label="Gender"
                    defaultValue=""
                    {...register('gender', { 
                      required: 'Gender is required'
                    })}
                    error={Boolean(errors.gender)}
                    helperText={errors.gender?.message}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register('dateOfBirth')}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Academic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Class"
                    {...register('class', { 
                      required: 'Class is required'
                    })}
                    error={Boolean(errors.class)}
                    helperText={errors.class?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    fullWidth
                    label="Grade"
                    {...register('grade', { 
                      required: 'Grade is required'
                    })}
                    error={Boolean(errors.grade)}
                    helperText={errors.grade?.message}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Parent/Guardian Phone Number"
                    {...register('parentContact', {
                      pattern: {
                        value: /^(\+\d{1,3}[- ]?)?\d{10}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                    error={Boolean(errors.parentContact)}
                    helperText={errors.parentContact?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    {...register('address')}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  type="submit"
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register Student'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
        
        {/* Snackbar untuk notifikasi RFID */}
        <Snackbar
          open={rfidSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={rfidSnackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </Layout>
  );
}
