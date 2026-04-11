import React from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material';
import { showToast } from '../utils/toastUtility';

/**
 * BookingCard — renders just the Card, no Grid wrapper.
 * Parent (AdminDashboard / ViewBookings) handles the Grid item.
 */
const BookingCard = ({ booking, onCancel, onConfirm, loading }) => {
  const eventDate = new Date(booking.eventDate).toLocaleDateString();
  const eventTime = new Date(booking.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const eventDateTime = `${eventDate} ${eventTime}`;

  const handleCancel = () => {
    showToast('Cancelling booking...', 'info');
    onCancel(booking._id);
  };

  const handleConfirm = () => {
    showToast('Confirming booking...', 'info');
    onConfirm(booking._id);
  };

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 4,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000', mb: 1, textAlign: 'center', wordWrap: 'break-word' }}>
          {booking.name}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2"><strong>Contact:</strong> {booking.contact}</Typography>
          <Typography variant="body2"><strong>Event Type:</strong> {booking.eventType}</Typography>
          <Typography variant="body2"><strong>Date & Time:</strong> {eventDateTime}</Typography>
          <Typography variant="body2" sx={{ color: booking.status === 'cancelled' ? '#d32f2f' : '#388e3c' }}>
            <strong>Status:</strong> {booking.status}
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000', mt: 1.5, mb: 0.5, textAlign: 'center', fontSize: '1rem' }}>
          Celebrity
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2"><strong>Name:</strong> {booking.celebrity?.name}</Typography>
          <Typography variant="body2"><strong>Contact:</strong> {booking.celebrity?.contact}</Typography>
          <Typography variant="body2"><strong>Price:</strong> ₹{booking.celebrity?.price}</Typography>
        </Box>
      </CardContent>

      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        {booking.status !== 'cancelled' && (
          <Button variant="outlined" color="error" fullWidth onClick={handleCancel} disabled={loading}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Cancel'}
          </Button>
        )}
        {booking.status === 'pending' && (
          <Button variant="outlined" color="success" fullWidth onClick={handleConfirm} disabled={loading}
            sx={{ textTransform: 'none', borderRadius: 2 }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
          </Button>
        )}
        {booking.status !== 'pending' && (
          <Button variant="outlined" disabled fullWidth
            sx={{ textTransform: 'none', borderRadius: 2, color: booking.status === 'confirmed' ? '#388e3c' : '#d32f2f' }}>
            {booking.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default BookingCard;
