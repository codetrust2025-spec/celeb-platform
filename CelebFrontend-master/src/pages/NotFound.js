import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'

const NotFound = () => (
  <Box
    sx={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#0b0b0c',
      color: '#fff',
      textAlign: 'center',
      px: 2
    }}
  >
    <Typography variant="h1" sx={{ fontSize: { xs: '5rem', md: '8rem' }, fontWeight: 900, color: '#f0a500', lineHeight: 1 }}>
      404
    </Typography>
    <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
      Page Not Found
    </Typography>
    <Typography variant="body1" sx={{ color: '#9e9e9e', mb: 4 }}>
      The page you are looking for does not exist or has been moved.
    </Typography>
    <Button
      component={Link}
      to="/"
      variant="contained"
      sx={{
        backgroundColor: '#f0a500',
        color: '#111',
        fontWeight: 700,
        borderRadius: 2,
        px: 4,
        py: 1.25,
        '&:hover': { backgroundColor: '#ffb300' }
      }}
    >
      Back to Home
    </Button>
  </Box>
)

export default NotFound
