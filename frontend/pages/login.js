import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  Paper,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

// Ganti dengan path ilustrasi dan background yang sesuai
const characterIllustration = '/images/auth/character-illustration.png';
const authBackground = '/images/auth/auth-background.png';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email: data.email,
        password: data.password
      });

      if (response.data.success) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.data._id,
          name: response.data.data.name,
          email: response.data.data.email,
          role: response.data.data.role
        }));

        toast.success('Logged in successfully!');
        router.push('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to login. Please check your credentials.'
      );
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | School Attendance System</title>
      </Head>

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Left Side - Illustration */}
        <Box
          sx={{
            flex: 2,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            p: 6,
            backgroundColor: '#f5f5f9'
          }}
        >
          <Box sx={{ maxWidth: 400 }}>
            <img
              src={characterIllustration}
              alt='character-illustration'
              style={{ width: '100%', height: 'auto' }}
            />
          </Box>
          <img
            src={authBackground}
            alt='auth background'
            style={{
              position: 'absolute',
              bottom: '4%',
              width: '100%',
              zIndex: -1
            }}
          />
        </Box>

        {/* Right Side - Login Form */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
           
          }}
        >
           <Box
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '75vh',
                }}
            > 
            {/* Header untuk form */}
            <Box sx={{ alignItems: 'center'}}>
              <Typography variant='h4' gutterBottom align='center'>
                Sistem Kehadiran Sekolah
              </Typography>
              <Typography variant='body1' align='center' sx={{ mb: 3 }}>
                Silakan Login Untuk Melanjutkan
              </Typography>
           
            

            {/* Formulir Login */}
              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit(handleLogin)} noValidate>
                <TextField
                  fullWidth
                  label='Email'
                  margin='normal'
                  autoComplete='email'
                  autoFocus
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                />

                <TextField
                  fullWidth
                  label='Password'
                  type={showPassword ? 'text' : 'password'}
                  margin='normal'
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge='end'
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button
                  type='submit'
                  fullWidth
                  variant='contained'
                  sx={{ mt: 3, 
                    width: '100%',
                    height: '40px',
                    fontSize: '18px',
                   }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </Box>
            
            {/* Footer untuk form */}
            <Box sx={{ mt: 'auto', textAlign: 'center' }}>
              <Typography variant='body1' sx={{ color: 'text.secondary' }}>
                Sistem Kehadiran Sekolah Berbasis RFID
              </Typography>
            </Box>
          </Box>
          
        </Box>
      </Box>
    </>
  );
}
