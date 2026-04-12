import React, { useEffect, useState } from 'react'
import {
  useLocation,
  useParams,
  Link
} from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  useTheme,
  Tooltip,
  Chip,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
  Skeleton
} from '@mui/material'
import {
  ArrowBack,
  Instagram,
  YouTube
} from '@mui/icons-material'
import { showToast } from '../utils/toastUtility'
import { buildFileURL } from '../utils/fileUrl'
import { getCelebrityById } from '../api'

const singular = s => {
  if (!s) return '-'
  const w = String(s).trim().toLowerCase()
  const base = w.endsWith('s') ? w.slice(0, -1) : w
  return base.replace(/^\w/, c => c.toUpperCase())
}

const formatINR = v => {
  const n = Number(v)
  if (!Number.isFinite(n)) return '-'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

const formatDate = iso => {
  try {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return '-'
  }
}

/**
 * Collage (smaller tiles, frame reduced ~30%)
 * - Shows up to 12 images at once inside a fixed-height frame
 * - Responsive columns: 3 (mobile) / 4 (tablet) / 5 (desktop)
 * - Square tiles for compact, uniform look
 */
const Collage = ({ images, name }) => {
  const all = Array.isArray(images) ? images : []
  const maxTiles = Math.min(all.length, 12)
  const visible = all.slice(0, maxTiles)

  const colsXs = Math.min(maxTiles, 3)
  const colsSm = Math.min(maxTiles, 4)
  const colsMd = Math.min(maxTiles, 5)

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        height: { xs: 300, sm: 380, md: 400 }, // ~30% smaller
        display: 'grid',
        gap: '4px',
        p: '4px',
        bgcolor: 'rgba(255,255,255,0.02)',
        gridTemplateColumns: {
          xs: `repeat(${colsXs}, 1fr)`,
          sm: `repeat(${colsSm}, 1fr)`,
          md: `repeat(${colsMd}, 1fr)`
        }
      }}
    >
      {visible.map((url, i) => (
        <Box
          key={`${url}-${i}`}
          sx={{
            overflow: 'hidden',
            borderRadius: 2,
            backgroundColor: '#1f1f1f'
          }}
        >
          <Box
            component="img"
            src={buildFileURL(url)}
            alt={`${name}-${i}`}
            loading="lazy"
            decoding="async"
            onError={e => { e.currentTarget.src = buildFileURL('/uploads/placeholder-9x16.jpg') }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              aspectRatio: '1 / 1', // square -> smaller perceived size
              transition: 'transform 0.25s ease',
              '&:hover': { transform: 'scale(1.04)' }
            }}
          />
        </Box>
      ))}

      {all.length > maxTiles && (
        <Box
          sx={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            bgcolor: 'rgba(0,0,0,0.55)',
            color: '#fff',
            px: 1,
            py: 0.4,
            borderRadius: 1.5,
            fontWeight: 700,
            fontSize: '.75rem',
            border: '1px solid rgba(255,255,255,0.18)'
          }}
        >
          +{all.length - maxTiles} more
        </Box>
      )}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 65%, rgba(0,0,0,0.35) 90%)'
        }}
      />
    </Box>
  )
}

const CelebrityProfile = () => {
  const location = useLocation()
  const { id } = useParams()
  const theme = useTheme()
  const [celebrity, setCelebrity] = useState(location.state?.celebrity || null)
  const [loading, setLoading] = useState(!celebrity)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!celebrity && id) {
      setLoading(true)
      getCelebrityById(id).then(data => {
        if (data) setCelebrity(data)
        else showToast('Celebrity not found.', 'error')
        setLoading(false)
      })
    }
  }, [id])

  if (loading) return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 4 }, background: '#0b0b0c' }}>
      <Container maxWidth="lg">
        <Skeleton variant="rectangular" width={100} height={40} sx={{ bgcolor: '#1e1e1e', borderRadius: 2, mb: 3 }} />
        <Box sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Grid container>
            <Grid item xs={12} md={6} sx={{ p: { xs: 2, md: 4 } }}>
              <Skeleton variant="rectangular" height={400} sx={{ bgcolor: '#1e1e1e', borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} md={6} sx={{ p: { xs: 2, md: 4 } }}>
              <Skeleton variant="text" height={60} sx={{ bgcolor: '#1e1e1e', mb: 2 }} />
              <Skeleton variant="text" height={30} width="60%" sx={{ bgcolor: '#1e1e1e', mb: 2 }} />
              <Skeleton variant="rectangular" height={100} sx={{ bgcolor: '#1e1e1e', borderRadius: 2, mb: 2 }} />
              <Skeleton variant="text" height={30} width="40%" sx={{ bgcolor: '#1e1e1e', mb: 2 }} />
              <Skeleton variant="rectangular" height={48} width={140} sx={{ bgcolor: '#1e1e1e', borderRadius: 2 }} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )

  if (!celebrity) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0b0b0c' }}>
      <Typography variant="h6" sx={{ color: '#fff' }}>Celebrity not found.</Typography>
    </Box>
  )

  const name = celebrity.name
  const imageUrls = Array.isArray(celebrity.imageUrls) && celebrity.imageUrls.length
    ? celebrity.imageUrls
    : (celebrity.imageUrl ? [celebrity.imageUrl] : [])
  const description = celebrity.description
  const price = celebrity.price
  const contact = celebrity.contact
  const category = celebrity.category
  const instagramUrl = celebrity?.socialLinks?.instagram
  const youtubeUrl = celebrity?.socialLinks?.youtube
  const createdAt = celebrity.createdAt
  const updatedAt = celebrity.updatedAt

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        background: 'radial-gradient(1200px 700px at 15% 10%, #131313 0%, #0f0f10 40%, #0b0b0c 70%), radial-gradient(1000px 600px at 90% 90%, #1c1b12 0%, #0f0e08 55%, #0b0b0c 85%)'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)',
                color: '#1a1a1a',
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                py: 1,
                boxShadow: '0 8px 24px rgba(255, 193, 7, 0.25)',
                '&:hover': { background: '#ffca2a' }
              }}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
          </Link>
        </Box>

        <Box
          sx={{
            backdropFilter: 'saturate(180%) blur(14px)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.0) 100%)',
                p: { xs: 2, sm: 3, md: 4 }
              }}
            >
              {imageUrls.length > 0 ? (
                <Collage images={imageUrls} name={name} />
              ) : (
                <Box sx={{ height: { xs: 300, sm: 380, md: 400 }, display: 'grid', placeItems: 'center', color: '#9ea3a8' }}>
                  <Typography>No images available</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#E0E0E0', letterSpacing: 0.4 }}>
                  All images shown • Smaller frame
                </Typography>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5
              }}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: 0.2,
                    mb: 1
                  }}
                >
                  {name}
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    size="small"
                    label={singular(category)}
                    sx={{
                      bgcolor: '#1f2937',
                      color: '#ffecb3',
                      borderRadius: 2,
                      fontWeight: 700,
                      letterSpacing: 0.5
                    }}
                  />
                  <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
                  <Typography variant="h6" sx={{ color: '#FFD54F', fontWeight: 700, letterSpacing: 0.3 }}>
                    {formatINR(price)}
                  </Typography>
                </Stack>
              </Box>

              <Typography variant="body1" sx={{ color: '#d6d7db', lineHeight: 1.8 }}>
                {description || 'Description not available.'}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ color: '#9ea3a8', letterSpacing: 0.2 }}>
                  Contact
                </Typography>
                <Typography variant="body1" sx={{ color: '#eaecef', fontWeight: 600, letterSpacing: 0.4 }}>
                  {contact || '-'}
                </Typography>
              </Stack>

              {(instagramUrl || youtubeUrl) && (
                <Stack direction="row" spacing={1.5}>
                  <Tooltip title={instagramUrl ? 'Open Instagram' : 'Instagram not available'}>
                    <span>
                      <Button
                        variant="outlined"
                        startIcon={<Instagram />}
                        disabled={!instagramUrl}
                        href={instagramUrl || undefined}
                        target={instagramUrl ? '_blank' : undefined}
                        rel={instagramUrl ? 'noopener noreferrer' : undefined}
                        sx={{
                          borderColor: '#E4405F',
                          color: '#E4405F',
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 2,
                          '&:hover': { borderColor: '#ff5c7a', color: '#ff5c7a' }
                        }}
                      >
                        Instagram
                      </Button>
                    </span>
                  </Tooltip>

                  <Tooltip title={youtubeUrl ? 'Open YouTube' : 'YouTube not available'}>
                    <span>
                      <Button
                        variant="outlined"
                        startIcon={<YouTube />}
                        disabled={!youtubeUrl}
                        href={youtubeUrl || undefined}
                        target={youtubeUrl ? '_blank' : undefined}
                        rel={youtubeUrl ? 'noopener noreferrer' : undefined}
                        sx={{
                          borderColor: '#FF0000',
                          color: '#FF5252',
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 2,
                          '&:hover': { borderColor: '#ff5252', color: '#ff7b7b' }
                        }}
                      >
                        YouTube
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              )}

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Link to="/celebrity/form" state={{ celebrity }} style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)',
                      color: '#1a1a1a',
                      fontWeight: 800,
                      borderRadius: 2,
                      px: 3,
                      py: 1.25,
                      boxShadow: '0 14px 36px rgba(255, 193, 7, 0.35)',
                      '&:hover': { background: '#ffca2a' }
                    }}
                    onClick={() => showToast('Redirecting to booking form...', 'info')}
                  >
                    Book Now
                  </Button>
                </Link>

                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    showToast('Profile link copied', 'success')
                  }}
                  sx={{
                    ml: 0.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    color: '#eaecef',
                    border: '1px solid rgba(255,255,255,0.08)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 17H8V7h11v15z" /></svg>
                </IconButton>
              </Stack>

              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.08)' }} />

              <Stack direction="row" spacing={2}>
                <Typography variant="caption" sx={{ color: '#9ea3a8' }}>
                  Created: {formatDate(createdAt)}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ea3a8' }}>
                  Updated: {formatDate(updatedAt)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}

export default CelebrityProfile
