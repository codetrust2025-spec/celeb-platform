import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createBooking, getBookings, updateBooking } from '../api'
import {
  Card,
  TextField,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack
} from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { showToast } from '../utils/toastUtility'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBookingsStart, fetchBookingsSuccess, fetchBookingsFailure } from '../redux/reducers/bookingReducer'

const BookingForm = () => {
  const dispatch = useDispatch()
  const bookingsData = useSelector(state => state.bookings.bookings)
  const location = useLocation()
  const navigate = useNavigate()
  const { isUpdate, bookingId, celebrity } = location.state || {}

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    eventType: '',
    eventDate: '',
    eventLocation: '',
    eventTime: null,
    otherEventType: ''
  })
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    if (!celebrity) return
    const fetchBookingsData = async () => {
        dispatch(fetchBookingsStart())
        try {
          const data = await getBookings()
          dispatch(fetchBookingsSuccess(data))
        } catch (error) {
          dispatch(fetchBookingsFailure('Error fetching bookings.'))
        }
      }
    fetchBookingsData()
  }, [dispatch, celebrity])

  useEffect(() => {
    if (isUpdate && bookingsData.length > 0 && bookingId) {
      const existingBooking = bookingsData.find(booking => booking._id === bookingId)
      if (existingBooking) {
        setFormData({
          name: existingBooking.name || '',
          contact: existingBooking.contact || '',
          eventType: existingBooking.eventType || '',
          eventDate: existingBooking.eventDate ? existingBooking.eventDate.split('T')[0] : '',
          eventLocation: existingBooking.eventLocation || '',
          eventTime: existingBooking.eventTime ? new Date(existingBooking.eventTime) : null,
          otherEventType: existingBooking.eventType === 'Others' ? existingBooking.otherEventType || '' : ''
        })
      }
    } else if (isUpdate && !bookingId) {
      showToast('Booking ID is missing!', 'error')
    }
  }, [isUpdate, bookingsData, bookingId])

  if (!celebrity) return <div style={{ padding: 40, textAlign: 'center' }}>No celebrity selected. Please go back and choose a celebrity.</div>

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleEventTypeChange = e => setFormData({ ...formData, eventType: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    const userProfile = JSON.parse(sessionStorage.getItem('userProfile'))
    const resolvedEventType = formData.eventType === 'Others' && formData.otherEventType
      ? formData.otherEventType
      : formData.eventType
    const payload = {
      name: formData.name,
      contact: formData.contact,
      eventType: resolvedEventType,
      eventDate: formData.eventDate,
      eventLocation: formData.eventLocation,
      celebrityId: celebrity._id,
      userId: userProfile?.id || userProfile?._id || 'guest',
      eventTime: formData.eventTime ? (formData.eventTime instanceof Date ? formData.eventTime.toISOString() : formData.eventTime) : null
    }
    try {
      if (isUpdate) {
        await updateBooking(bookingId, payload)
        showToast('Booking updated successfully!', 'success')
      } else {
        await createBooking(payload)
        showToast('Booking successful!', 'success')
      }
      setFormData({
        name: '',
        contact: '',
        eventType: '',
        eventDate: '',
        eventLocation: '',
        eventTime: null,
        otherEventType: ''
      })
      setOpenDialog(true)
      setTimeout(() => navigate('/'), 2500)
    } catch (err) {
      const message = err?.message || 'Booking Failed. Please try again.'
      showToast(message, 'error')
    }
  }

  const handleCloseDialog = () => setOpenDialog(false)

  const eventTypes = [
    'Marriage',
    'Birthday',
    'Shop Opening',
    'Corporate Event',
    'Private Party',
    'Wedding Anniversary',
    'Graduation Party',
    'Product Launch',
    'Music Concert',
    'Charity Event'
  ]

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', backgroundColor: '#f7f7f7', py: 6, px: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 520, borderRadius: 3, boxShadow: '0px 20px 40px rgba(0,0,0,0.12)', p: 4, background: '#fff' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
          {isUpdate ? `Update Booking for ${celebrity.name}` : `Book ${celebrity.name}`}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>
          {isUpdate ? `Update your booking details for ${celebrity.name}` : `Fill the details below to book ${celebrity.name} for your event.`}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Your Full Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
            <TextField label="Your Contact Number" name="contact" value={formData.contact} onChange={handleChange} fullWidth required />
            <FormControl fullWidth required>
              <InputLabel id="event-type-label">Event Type</InputLabel>
              <Select labelId="event-type-label" value={formData.eventType} label="Event Type" name="eventType" onChange={handleEventTypeChange}>
                {eventTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
            {formData.eventType === 'Others' && <TextField label="Specify Event Type" name="otherEventType" value={formData.otherEventType} onChange={handleChange} fullWidth required />}
            <TextField label="Event Date" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
            <TextField label="Event Location" name="eventLocation" value={formData.eventLocation} onChange={handleChange} fullWidth required />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Event Time"
                value={formData.eventTime}
                onChange={newValue => setFormData(prev => ({ ...prev, eventTime: newValue }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
            <Button type="submit" variant="contained" fullWidth sx={{ py: 1.25, mt: 1, backgroundColor: '#222', '&:hover': { backgroundColor: '#111' } }}>
              {isUpdate ? 'Update Booking' : 'Book Now'}
            </Button>
          </Stack>
        </form>
      </Card>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>{isUpdate ? 'Booking Updated' : 'Booking Successful'}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', color: '#666' }}>
          <Typography>{isUpdate ? `Your booking for ${celebrity.name} has been updated successfully!` : `Your booking for ${celebrity.name} has been submitted!`}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={handleCloseDialog} variant="contained" sx={{ backgroundColor: '#1976d2', color: '#fff' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BookingForm
