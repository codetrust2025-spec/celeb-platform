import React, { useEffect, useState } from 'react'
import { Box, Typography, Grid, Button, CircularProgress } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getCelebrityProfile } from '../api'
import { buildFileURL } from '../utils/fileUrl'

const CelebrityPortfolio = () => {
  const [celebrity, setCelebrity] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCelebrityProfile().then(data => {
      setCelebrity(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#121212' }}>
      <CircularProgress sx={{ color: '#f0a500' }} />
    </Box>
  )

  const images = celebrity?.images || (celebrity?.imageUrl ? [celebrity.imageUrl] : [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#121212', color: '#fff', p: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/celebrityDashboard')} sx={{ color: '#f0a500', mb: 3 }}>
        Back to Dashboard
      </Button>
      <Typography variant="h5" sx={{ color: '#f0a500', mb: 3, fontWeight: 700 }}>Portfolio</Typography>
      {images.length === 0 ? (
        <Typography sx={{ color: '#bbb' }}>No portfolio images yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {images.map((url, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box component="img" src={buildFileURL(url)} alt={`portfolio-${i}`}
                sx={{ width: '100%', borderRadius: 2, objectFit: 'cover', height: 220 }} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default CelebrityPortfolio
