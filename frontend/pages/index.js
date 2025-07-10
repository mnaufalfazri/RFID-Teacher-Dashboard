import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Container, Typography, Box, Grid, Paper, Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress
} from '@mui/material';
import {
  QrCodeScanner,
  Person,
  Assessment,
  DevicesOther,
  PersonAdd
} from '@mui/icons-material';
import axios from 'axios';
import { isAuthenticated } from '../utils/auth';
import Layout from '../components/Layout';
import AutoFixHigh from '@mui/icons-material/AutoFixHigh';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  useEffect(() => {
    const auth = isAuthenticated();
    if (!auth) {
      router.push('/login');
    } else {
      setUser(auth.user);
      setLoading(false);
      fetchDevices(auth.token);
    }
  }, [router]);

  const fetchDevices = async (token) => {
    try {
      setDevicesLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/devices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setDevices(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Cards Data
  const cards = [
    {
      title: 'Kehadiran',
      description: "Melihat Absensi Siswa Saat Ini.",
      icon: <QrCodeScanner sx={{ fontSize: 60 }} />,
      link: '/attendance',
      bgcolor: 'primary.light'
    },
    {
      title: 'Siswa',
      description: "Mengelola Data Siswa.",
      icon: <Person sx={{ fontSize: 60}} />,
      link: '/students',
      bgcolor: 'success.light'
    },
    {
      title: 'Laporan',
      description: "Melihat dan Mencetak Laporan Kehadiran.",
      icon: <Assessment sx={{ fontSize: 60 }} />,
      link: '/reports',
      bgcolor: 'warning.light'
    },
    {
      title: 'Buat Soal',
      description: "Membuat Soal Secara Otomatis.",
      icon: <AutoFixHigh sx={{ fontSize: 60 }} />,
      link: '/generate',
      bgcolor: 'error.light'
    }
  ];
  // Summary Counts
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === 'NORMAL').length;
  const issuesDevices = devices.filter((d) => d.status !== 'NORMAL').length;

  return (
    <Layout>
      <Head>
        <title>School Attendance System</title>
        <meta name="description" content="RFID-based attendance system for schools" />
      </Head>

      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Selamat Datang, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Sistem Kehadiran Sekolah dengan Integrasi RFID
          </Typography>

          {/* Menu Cards */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={12} md={6} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    mx: 'auto', // center horizontally
                    maxWidth: '100%',
                    width: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'scale(1.02)'
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                  onClick={() => router.push(card.link)}
                >
                  <Grid container>
                    <Grid
                      item xs={4}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: card.bgcolor,
                        color: 'white',
                        borderTopLeftRadius: '16px',
                        borderBottomLeftRadius: '16px'
                      }}
                    >
                      {card.icon}
                    </Grid>
                    <Grid
                      item xs={8}
                      sx={{
                        p: { xs: 2, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {card.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
}
