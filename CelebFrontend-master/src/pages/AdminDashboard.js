import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Alert,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { ArrowBack, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getBookings, cancelBooking, confirmBooking } from '../api';
import BookingCard from './BookingCard';
import { createButtonStyles, showToast } from '../utils/toastUtility';
import { useTheme } from '@mui/material/styles';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState('');
  const [showBookings, setShowBookings] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [fetching, setFetching] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (showBookings) fetchBookings();
  }, [showBookings]);

  const fetchBookings = async () => {
    setFetching(true);
    try {
      const data = await getBookings();
      setBookings(Array.isArray(data) ? data : (data?.bookings || []));
    } catch {
      setError('An error occurred while fetching bookings.');
    } finally {
      setFetching(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setLoading((prev) => ({ ...prev, [bookingId]: { cancel: true } }));
    try {
      await cancelBooking(bookingId);
      fetchBookings();
      showToast('Booking cancelled successfully!', 'success');
    } catch {
      setError('Error canceling booking.');
      showToast('Failed to cancel booking.', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, [bookingId]: { cancel: false } }));
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    setLoading((prev) => ({ ...prev, [bookingId]: { confirm: true } }));
    try {
      await confirmBooking(bookingId);
      fetchBookings();
      showToast('Booking confirmed successfully!', 'success');
    } catch {
      setError('Error confirming booking.');
      showToast('Failed to confirm booking.', 'error');
    } finally {
      setLoading((prev) => ({ ...prev, [bookingId]: { confirm: false } }));
    }
  };

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const canceledBookings = bookings.filter((b) => b.status === 'cancelled');
  const pendingBookings = bookings.filter((b) => b.status !== 'cancelled');

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      {/* 🡐 Top Left Back Button */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: '1rem', sm: '2rem' },
          left: { xs: '1rem', sm: '2rem' },
          zIndex: 10,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          sx={{
            ...createButtonStyles('small'),
            boxShadow: 3,
            borderRadius: 2,
          }}
          startIcon={<ArrowBack />}
        >
          
        </Button>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Fade in timeout={600}>
          <Box textAlign="center" mb={4}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                letterSpacing: 0.5,
                mb: 1,
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage all bookings and celebrities in one place
            </Typography>
          </Box>
        </Fade>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 🎛️ Action Buttons */}
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent="center"
          alignItems="center"
          gap={2}
          mb={4}
        >
          <Button
            variant="contained"
            color="primary"
            sx={createButtonStyles('small')}
            onClick={() => setShowBookings(!showBookings)}
          >
            {showBookings ? 'Hide Bookings List' : 'View Bookings List'}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            sx={createButtonStyles('small')}
            startIcon={<Star />}
            onClick={() => navigate('/admin-dashboard-celebrities')}
          >
            Celebrity List
          </Button>
        </Box>

        {/* 📋 Bookings Section */}
        {showBookings && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#fff',
              boxShadow: 5,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered={!isMobile}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons
              allowScrollButtonsMobile
              sx={{
                mb: 3,
                '& .MuiTab-root': { fontWeight: 600 },
                '& .Mui-selected': { color: 'primary.main' },
                '& .MuiTabs-indicator': { backgroundColor: 'primary.main' },
              }}
            >
              <Tab label="All" />
              <Tab label="Pending" />
              <Tab label="Cancelled" />
            </Tabs>

            {fetching ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* All Bookings */}
                {tabValue === 0 && (
                  <Grid container spacing={3}>
                    {bookings.length ? (
                      bookings.map((b) => (
                        <Grid key={b._id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <BookingCard
                            booking={b}
                            onCancel={handleCancelBooking}
                            onConfirm={handleConfirmBooking}
                            loading={loading[b._id]?.cancel || loading[b._id]?.confirm}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography align="center" sx={{ width: '100%', py: 3 }}>
                        No bookings found.
                      </Typography>
                    )}
                  </Grid>
                )}

                {/* Pending */}
                {tabValue === 1 && (
                  <Grid container spacing={3}>
                    {pendingBookings.length ? (
                      pendingBookings.map((b) => (
                        <Grid key={b._id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <BookingCard
                            booking={b}
                            onCancel={handleCancelBooking}
                            onConfirm={handleConfirmBooking}
                            loading={loading[b._id]?.cancel || loading[b._id]?.confirm}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography align="center" sx={{ width: '100%', py: 3 }}>
                        No pending bookings.
                      </Typography>
                    )}
                  </Grid>
                )}

                {/* Cancelled */}
                {tabValue === 2 && (
                  <Grid container spacing={3}>
                    {canceledBookings.length ? (
                      canceledBookings.map((b) => (
                        <Grid key={b._id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <BookingCard
                            booking={b}
                            onCancel={handleCancelBooking}
                            onConfirm={handleConfirmBooking}
                            loading={loading[b._id]?.cancel || loading[b._id]?.confirm}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography align="center" sx={{ width: '100%', py: 3 }}>
                        No cancelled bookings.
                      </Typography>
                    )}
                  </Grid>
                )}
              </>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
