import React, { useState, useEffect } from 'react'
import { Grid, Typography, Button, Box, CircularProgress, Tabs, Tab, Alert } from '@mui/material'
import { createButtonStyles, showToast } from '../utils/toastUtility'
import { adminGetBookings, cancelBooking, confirmBooking } from '../api'
import { useNavigate } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import BookingCard from './BookingCard'

const ViewBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState({})
  const [globalLoading, setGlobalLoading] = useState(false)
  const [error, setError] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const navigate = useNavigate()

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setGlobalLoading(true)
    try {
      const data = await adminGetBookings()
      setBookings(data)
    } catch {
      setError('An error occurred while fetching bookings.')
    } finally {
      setGlobalLoading(false)
    }
  }

  const handleTabChange = (_, v) => setTabValue(v)

  const handleBookingAction = async (bookingId, actionType) => {
    setLoading(prev => ({ ...prev, [bookingId]: true }))
    try {
      if (actionType === 'cancel') {
        await cancelBooking(bookingId)
        showToast('Booking cancelled successfully!', 'success')
      } else {
        await confirmBooking(bookingId)
        showToast('Booking confirmed successfully!', 'success')
      }
      fetchBookings()
    } catch {
      showToast(`Failed to ${actionType} booking.`, 'error')
    } finally {
      setLoading(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  const canceledBookings = bookings.filter(b => b.status === 'cancelled')
  const pendingBookings = bookings.filter(b => b.status !== 'cancelled')

  const handleBackToDashboard = () => navigate('/admin-dashboard')

  return (
    <Box sx={{ pt: '3rem', pb: '3rem', textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, mb: 2 }}>
        <Button
          variant='contained'
          color='primary'
          onClick={handleBackToDashboard}
          sx={createButtonStyles('small')}
          startIcon={<ArrowBack />}
        >
          Back to Dashboard
        </Button>
      </Box>
      <Typography variant='h4' color='primary' sx={{ fontWeight: 'bold' }}>Bookings List</Typography>

      {error && <Alert severity='error' sx={{ mb: '1.5rem' }}>{error}</Alert>}

      {globalLoading ? (
        <CircularProgress size={50} color='primary' sx={{ mt: '2rem' }} />
      ) : (
        <>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mt: '2rem' }}>
            <Tab label='All' />
            <Tab label='Pending' />
            <Tab label='Canceled' />
          </Tabs>

          <Grid container spacing={4} sx={{ mt: 1 }}>
            {tabValue === 0 && bookings.map(booking => (
              <Grid key={booking._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BookingCard
                  booking={booking}
                  loading={loading[booking._id]}
                  onCancel={id => handleBookingAction(id, 'cancel')}
                  onConfirm={id => handleBookingAction(id, 'confirm')}
                />
              </Grid>
            ))}

            {tabValue === 1 && pendingBookings.map(booking => (
              <Grid key={booking._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BookingCard
                  booking={booking}
                  loading={loading[booking._id]}
                  onCancel={id => handleBookingAction(id, 'cancel')}
                  onConfirm={id => handleBookingAction(id, 'confirm')}
                />
              </Grid>
            ))}

            {tabValue === 2 && canceledBookings.map(booking => (
              <Grid key={booking._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <BookingCard
                  booking={booking}
                  loading={loading[booking._id]}
                  onCancel={id => handleBookingAction(id, 'cancel')}
                  onConfirm={id => handleBookingAction(id, 'confirm')}
                />
              </Grid>
            ))}

            {!bookings.length && (
              <Typography align='center' sx={{ width: '100%' }}>No bookings available.</Typography>
            )}
          </Grid>
        </>
      )}

    </Box>
  )
}

export default ViewBookings