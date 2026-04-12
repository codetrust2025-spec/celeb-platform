import React, { useState, useEffect } from 'react'
import { Box, Button, Typography, Avatar, Grid, Card, CardContent, IconButton, TextField } from '@mui/material'
import { AccountCircle, CalendarMonth, Edit, Notifications } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getCelebrityProfile, getBookings, getAvailability, updateAvailability, removeAvailability } from '../api'
import { styled } from '@mui/system'
import { showToast } from '../utils/toastUtility'

const DashboardContainer = styled(Box)(() => ({
  display: 'flex', flexDirection: 'column', minHeight: '100vh',
  backgroundColor: '#121212', color: '#fff', padding: '20px',
}))

const Sidebar = styled(Box)(() => ({
  display: 'flex', flexDirection: 'column', width: '250px',
  backgroundColor: '#1e1e1e', padding: '15px', borderRadius: '10px', marginRight: '20px',
}))

const MainContent = styled(Box)(() => ({
  flex: 1, padding: '20px', backgroundColor: '#1f1f1f',
  borderRadius: '10px', boxShadow: '0 5px 10px rgba(0,0,0,0.3)',
}))

const DashboardHeader = styled(Box)(() => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px',
}))

const CelebrityDashboard = () => {
  const [celebrity, setCelebrity] = useState({})
  const [bookings, setBookings] = useState([])
  const [availability, setAvailability] = useState([])
  const [newDate, setNewDate] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getCelebrityProfile()
        setCelebrity(profileData)
        const bookingsData = await getBookings()
        setBookings(Array.isArray(bookingsData) ? bookingsData : (bookingsData?.bookings || []))
        const availabilityData = await getAvailability()
        setAvailability(Array.isArray(availabilityData) ? availabilityData : [])
      } catch (error) {
        console.error('Error fetching celebrity data:', error)
      }
    }
    fetchData()
  }, [])

  const handleAvailabilityChange = async () => {
    if (!newDate) { showToast('Please select a date', 'error'); return }
    try {
      await updateAvailability(newDate)
      setAvailability(prev => [...prev, newDate])
      setNewDate('')
      showToast('Availability updated!', 'success')
    } catch (error) {
      showToast('Error updating availability', 'error')
    }
  }

  const handleRemoveAvailability = async (date) => {
    try {
      await removeAvailability(date)
      setAvailability(prev => prev.filter(d => d !== date))
      showToast('Date removed', 'success')
    } catch {
      showToast('Error removing date', 'error')
    }
  }

  const upcomingBookings = bookings.filter(b => b.status !== 'cancelled')

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f0a500' }}>Celebrity Dashboard</Typography>
        <Box>
          <IconButton color="inherit" sx={{ marginRight: '15px' }}><Notifications /></IconButton>
          <IconButton color="inherit" onClick={() => navigate('/celebrityDashboard')}><AccountCircle /></IconButton>
        </Box>
      </DashboardHeader>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Sidebar>
            <Typography variant="h6" sx={{ color: '#f0a500', marginBottom: '20px' }}>Quick Access</Typography>
            <Button variant="outlined" color="secondary" fullWidth sx={{ mb: 1 }} onClick={() => navigate('/celebrityDashboard')}>Profile</Button>
            <Button variant="outlined" color="secondary" fullWidth sx={{ mb: 1 }} onClick={() => {
              document.getElementById('celebrity-bookings-section')?.scrollIntoView({ behavior: 'smooth' })
            }}>Bookings</Button>
            <Button variant="outlined" color="secondary" fullWidth sx={{ mb: 1 }} onClick={() => navigate('/celebrity-portfolio')}>Portfolio</Button>
            <Button variant="outlined" color="secondary" fullWidth sx={{ mb: 1 }} onClick={() => navigate('/celebrity-settings')}>Settings</Button>
          </Sidebar>
        </Grid>

        <Grid size={{ xs: 12, sm: 9 }}>
          <MainContent>
            {/* Profile Card */}
            <Card sx={{ backgroundColor: '#333', mb: 2, p: 2, borderRadius: '15px' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar alt={celebrity.name} src={celebrity.imageUrl} sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }} />
                <Typography variant="h6">{celebrity.name || 'Your Name'}</Typography>
                <Typography variant="body2" sx={{ color: '#bbb', mb: 1 }}>{celebrity.description || 'No bio available.'}</Typography>
                <Typography variant="body2" sx={{ color: '#f0a500' }}>{celebrity.category || ''}</Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit />}
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/celebrity-settings')}
                >
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Availability Calendar */}
            <Card sx={{ backgroundColor: '#333', p: 2, borderRadius: '15px', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#f0a500', mb: 2 }}>Availability Calendar</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <TextField
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  label="Select Date"
                  size="small"
                  sx={{ input: { color: '#fff' }, label: { color: '#aaa' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#555' } } }}
                />
                <Button variant="contained" color="secondary" startIcon={<CalendarMonth />} onClick={handleAvailabilityChange}>
                  Add Date
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availability.length === 0 && <Typography variant="body2" sx={{ color: '#bbb' }}>No availability set.</Typography>}
                {availability.map((date, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, backgroundColor: '#444', borderRadius: '8px' }}>
                    <Typography variant="body2" sx={{ color: '#f0a500' }}>{date}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveAvailability(date)}
                      sx={{ color: '#f44336', p: 0.25, '&:hover': { color: '#ff6659' } }}
                      aria-label={`Remove ${date}`}
                    >
                      <span style={{ fontSize: 14, lineHeight: 1 }}>✕</span>
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Card>

            {/* Upcoming Bookings */}
            <Card id="celebrity-bookings-section" sx={{ backgroundColor: '#333', p: 2, borderRadius: '15px' }}>
              <Typography variant="h6" sx={{ color: '#f0a500', mb: 2 }}>Upcoming Bookings</Typography>
              {upcomingBookings.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#bbb' }}>No upcoming bookings.</Typography>
              ) : (
                upcomingBookings.map((booking, i) => (
                  <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: '#444', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      <strong>{booking.eventType}</strong> on {new Date(booking.eventDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#bbb' }}>
                      Booked by: {booking.name} | Location: {booking.eventLocation}
                    </Typography>
                    <Typography variant="body2" sx={{ color: booking.status === 'confirmed' ? '#4caf50' : '#f0a500' }}>
                      Status: {booking.status}
                    </Typography>
                  </Box>
                ))
              )}
            </Card>
          </MainContent>
        </Grid>
      </Grid>
    </DashboardContainer>
  )
}

export default CelebrityDashboard
