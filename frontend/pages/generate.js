import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Container, Box, Typography, Paper, 
  TextField, Button, Grid, IconButton, 
  Card, CardContent, Chip, Divider,
  Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Search, FilterList, Refresh, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import { getCurrentTime, formatDateForInput, formatTimeForDisplay } from '../utils/timezone';
import Layout from '../components/Layout';
import { isAuthenticated } from '../utils/auth';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Attendance() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [error, setError] = useState('');
  const [date, setDate] = useState(formatDateForInput(getCurrentTime()));
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Check if user is authenticated
    const auth = isAuthenticated();
    if (!auth) {
      router.push('/login');
      return;
    }

    fetchAttendanceRecords();
  }, [router, date, statusFilter]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const auth = isAuthenticated();
      
      let url = `${process.env.NEXT_PUBLIC_API_URL}/attendance?date=${date}`;
      
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (response.data.success) {
        setAttendanceRecords(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch attendance records');
      toast.error('Error loading attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter records based on search term
    // This is client-side filtering, but you could also send the search term to the server
  };

  const handleRefresh = () => {
    fetchAttendanceRecords();
    toast.success('Attendance data refreshed');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'half-day': return 'info';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Head>
        <title>Buat Soal | School Attendance System</title>
      </Head>

      
    </Layout>
  );
}