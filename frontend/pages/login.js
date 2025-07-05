import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  InputAdornment, 
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        // Store user data and token in localStorage
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
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              width: '100%', 
              borderRadius: 2,
              mt: 4
            }}
          >
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
              School Attendance System
            </Typography>
            <Typography component="h2" variant="h6" align="center" sx={{ mb: 3 }}>
              Login
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit(handleLogin)} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
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
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
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
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            RFID-based School Attendance System
          </Typography>
        </Box>
      </Container>
    </>
  );
}
