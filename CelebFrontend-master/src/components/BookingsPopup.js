import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Snackbar,
  Box
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { getBookings, cancelBooking } from '../api'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBookingsFailure, fetchBookingsStart, fetchBookingsSuccess } from '../redux/reducers/bookingReducer'

const BookingItem = ({ booking, onCancel, closePopup }) => {
  const navigate = useNavigate()

  const formattedEventTime = time =>
    new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })

  const formattedEventDate = date =>
    new Date(date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })

  const handleUpdateBooking = bookingId => {
    // Pass the celebrity from the booking so BookingForm has it
    navigate('/celebrity/form', { state: { bookingId, isUpdate: true, celebrity: booking.celebrity } })
    closePopup()
  }

  return (
    <ListItem
      sx={{
        backgroundColor: '#1E1E1E',
        borderRadius: '14px',
        padding: '10px',
        boxShadow: '0px 7px 18px rgba(0,0,0,0.28)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': { transform: 'scale(1.02)', boxShadow: '0px 10px 25px rgba(0,0,0,0.35)' },
        marginBottom: '14px',
        display: 'flex',
        flexDirection: 'column',
        width: { xs: '100%', sm: '95%', md: '85%', lg: '70%', xl: '70%' },
        mx: 'auto',
        boxSizing: 'border-box',
        wordBreak: 'break-word'
      }}
    >
      <ListItemText
        primary={
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#f0a500', mb: 0.8 }}>
            Booking ID: {booking._id}
          </Typography>
        }
        secondary={
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '12px' }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#ffffff', mb: 0.4, fontSize: '0.9rem' }}>
                Celebrity Details
              </Typography>
              {booking.celebrity ? (
                <>
                  <Typography sx={{ color: '#f0a500', fontSize: '0.82rem' }}>
                    Name: {booking.celebrity.name}
                  </Typography>
                  <Typography sx={{ color: '#f0a500', fontSize: '0.82rem' }}>
                    Price: ₹{booking.celebrity.price}
                  </Typography>
                  <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                    Contact: {booking.celebrity.contact}
                  </Typography>
                  <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                    Instagram: {booking.celebrity.socialLinks?.instagram || 'N/A'}
                  </Typography>
                  <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                    YouTube: {booking.celebrity.socialLinks?.youtube || 'N/A'}
                  </Typography>
                  <Typography sx={{ color: '#aaaaaa', fontSize: '0.75rem' }}>
                    Created: {formattedEventDate(booking.celebrity.createdAt)}
                  </Typography>
                  <Typography sx={{ color: '#aaaaaa', fontSize: '0.75rem' }}>
                    Updated: {formattedEventDate(booking.celebrity.updatedAt)}
                  </Typography>
                </>
              ) : (
                <Typography sx={{ color: '#bbb', fontSize: '0.82rem' }}>No Celebrity Selected</Typography>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#ffffff', mb: 0.4, fontSize: '0.9rem' }}>
                Booking Details
              </Typography>
              <Typography sx={{ color: '#f0a500', fontSize: '0.82rem' }}>
                Status: {booking.status}
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                Name: {booking.name}
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                Contact: {booking.contact}
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                Event Type: {booking.eventType}
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                Event Location: {booking.eventLocation}
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                Event Date: {formattedEventDate(booking.eventDate)}
              </Typography>
              <Typography sx={{ color: '#ffffff', fontSize: '0.82rem' }}>
                Event Time: {formattedEventTime(booking.eventTime)}
              </Typography>
            </Box>
          </Box>
        }
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '8px', mt: 1.5 }}>
        {booking.status === 'pending' && (
          <Button
            onClick={() => onCancel(booking._id)}
            sx={{
              backgroundColor: '#E74C3C',
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.72rem',
              px: 1.8,
              py: 0.5,
              borderRadius: '7px',
              '&:hover': { backgroundColor: '#C0392B' }
            }}
          >
            <Delete sx={{ fontSize: '0.85rem', mr: 0.4 }} /> Cancel
          </Button>
        )}

        <Button
          onClick={() => handleUpdateBooking(booking._id)}
          variant='outlined'
          sx={{
            color: '#f0a500',
            borderColor: '#f0a500',
            fontWeight: 600,
            fontSize: '0.72rem',
            px: 1.8,
            py: 0.5,
            borderRadius: '7px',
            '&:hover': { backgroundColor: 'rgba(240,165,0,0.1)', borderColor: '#f0a500' }
          }}
        >
          Update
        </Button>
      </Box>
    </ListItem>
  )
}

const BookingsPopup = ({ isPopupOpen, closePopup }) => {
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const bookingsData = useSelector(state => state.bookings.bookings || [])

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    dispatch(fetchBookingsStart())
    try {
      const data = await getBookings()
      dispatch(fetchBookingsSuccess(data))
    } catch (err) {
      setError('Error fetching bookings.')
      dispatch(fetchBookingsFailure('Error fetching bookings.'))
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    if (isPopupOpen) {
      setError(null)
      fetchBookings()
    }
  }, [isPopupOpen, fetchBookings])

  const handleCancelBooking = async bookingId => {
    try {
      await cancelBooking(bookingId)
      setSuccessMessage('Booking cancelled successfully!')
      fetchBookings()
      setBookingToCancel(null)
      setOpenConfirmDialog(false)
      setOpenSnackbar(true)
    } catch {
      setError('Error cancelling the booking.')
      setOpenSnackbar(true)
    }
  }

  const openConfirmDialogForCancel = bookingId => {
    setBookingToCancel(bookingId)
    setOpenConfirmDialog(true)
  }

  const normalBookings = useMemo(() => bookingsData.filter(b => b.status !== 'cancelled'), [bookingsData])
  const cancelledBookings = useMemo(() => bookingsData.filter(b => b.status === 'cancelled'), [bookingsData])

  return (
    <>
      <Dialog
        open={isPopupOpen}
        onClose={closePopup}
        fullWidth
        maxWidth='md'
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#121212',
            color: '#ffffff',
            borderRadius: '16px',
            width: '95%',
            maxWidth: '700px',
            overflowX: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#f0a500', textAlign: 'center' }}>
          Your Bookings
        </DialogTitle>

        <DialogContent sx={{ padding: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: !isLoading && bookingsData.length === 0 ? '50vh' : 'auto' }}>
            {error ? (
              <Typography sx={{ color: '#aaa', fontSize: '1.1rem' }}>
                You need to log in first to see your bookings.
              </Typography>
            ) : (
              !isLoading &&
              bookingsData.length === 0 && (
                <Typography sx={{ color: '#aaa', fontSize: '1.1rem' }}>No bookings yet.</Typography>
              )
            )}
          </Box>

          {isLoading && <CircularProgress sx={{ display: 'block', margin: '0 auto', color: '#f0a500' }} />}

          {normalBookings.length > 0 && (
            <>
              <Typography variant='h6' sx={{ fontWeight: 600, color: '#f0a500', textAlign: 'center', mt: 2 }}>
                Active Bookings
              </Typography>
              <List>
                {normalBookings
                  .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
                  .map(booking => (
                    <BookingItem key={booking._id} booking={booking} onCancel={openConfirmDialogForCancel} closePopup={closePopup} />
                  ))}
              </List>
            </>
          )}

          {cancelledBookings.length > 0 && (
            <>
              <Typography variant='h6' sx={{ fontWeight: 600, color: '#f0a500', textAlign: 'center', mt: 2 }}>
                Cancelled Bookings
              </Typography>
              <List>
                {cancelledBookings
                  .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
                  .map(booking => (
                    <BookingItem key={booking._id} booking={booking} onCancel={openConfirmDialogForCancel} closePopup={closePopup} />
                  ))}
              </List>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closePopup} variant='outlined' sx={{ color: '#f0a500', borderColor: '#f0a500', fontWeight: 600, '&:hover': { backgroundColor: 'rgba(240,165,0,0.1)', borderColor: '#f0a500' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this booking?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color='primary'>
            No
          </Button>
          <Button onClick={() => handleCancelBooking(bookingToCancel)} color='secondary'>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} message={successMessage || error} />
    </>
  )
}

export default BookingsPopup
