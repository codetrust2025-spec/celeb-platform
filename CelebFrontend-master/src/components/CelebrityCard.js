import React from 'react'
import {
  Card,
  Typography,
  IconButton,
  Box,
  Button,
  Chip
} from '@mui/material'
import {
  Bookmark,
  BookmarkBorder,
  Share,
  Instagram,
  YouTube
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../utils/toastUtility'
import ImageCycler from './ImageCycler'

const CARD_HEIGHT = 430

const getCategoryChipColors = cat => {
  const c = String(cat || '').toLowerCase()
  if (c === 'entrepreneurs' || c === 'entrepreneur') return { bg: '#E3F2FD', fg: '#0D47A1' }
  if (c === 'actor' || c === 'actors') return { bg: '#FFF8E1', fg: '#8D6E63' }
  if (c === 'influencer' || c === 'influencers') return { bg: '#FCE4EC', fg: '#AD1457' }
  return { bg: '#ECEFF1', fg: '#37474F' }
}

const singularCategoryLabel = s => {
  if (!s) return '-'
  const word = String(s).trim().toLowerCase()
  const base = word.endsWith('s') ? word.slice(0, -1) : word
  return base.replace(/^\w/, c => c.toUpperCase())
}

/**
 * CelebrityCard — renders just the Card, no Grid wrapper.
 * The parent (Home.js) is responsible for the Grid item.
 */
const CelebrityCard = ({ celebrity, wishlist, handleWishlistToggle }) => {
  const navigate = useNavigate()
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'

  const imageList = Array.isArray(celebrity.imageUrls) && celebrity.imageUrls.length
    ? celebrity.imageUrls
    : celebrity.imageUrl ? [celebrity.imageUrl] : []

  const hasInstagram = !!celebrity?.socialLinks?.instagram
  const hasYoutube = !!celebrity?.socialLinks?.youtube
  const { bg, fg } = getCategoryChipColors(celebrity.category)

  const handleCardClick = () => {
    navigate(`/celebrity/${celebrity._id}`, { state: { celebrity } })
  }

  const handleBookingClick = e => {
    e.stopPropagation()
    if (!isLoggedIn) {
      navigate('/register-login-prompt', { state: { celebrity } })
      showToast('Please log in to proceed with the booking.', 'info')
      return
    }
    navigate('/celebrity/form', { state: { celebrity } })
  }

  const handleShareClick = e => {
    e.stopPropagation()
    showToast('Share feature coming soon', 'info')
  }

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        width: '100%',
        height: CARD_HEIGHT,
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        border: '2px solid rgba(240,165,0,0.6)',
        boxShadow: '0 0 15px rgba(240,165,0,0.25)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          borderColor: 'rgba(240,165,0,0.95)',
          boxShadow: '0 0 25px rgba(240,165,0,0.6)'
        }
      }}
    >
      {/* Images */}
      {imageList.length > 0
        ? <ImageCycler images={imageList} alt={celebrity.name} interval={2500} />
        : <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#333' }} />
      }

      {/* Gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.82) 85%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Social badges */}
      <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1, zIndex: 2 }}>
        {hasInstagram && (
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,.55)', px: 1, py: 0.3, borderRadius: 2 }}>
            <Instagram sx={{ fontSize: 16, color: '#E4405F' }} />
          </Box>
        )}
        {hasYoutube && (
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(0,0,0,.55)', px: 1, py: 0.3, borderRadius: 2 }}>
            <YouTube sx={{ fontSize: 16, color: '#FF0000' }} />
          </Box>
        )}
      </Box>

      {/* Wishlist */}
      <IconButton
        sx={{ position: 'absolute', top: 10, right: 10, bgcolor: 'rgba(0,0,0,.4)', color: '#fff', zIndex: 2 }}
        onClick={e => { e.stopPropagation(); handleWishlistToggle(celebrity._id) }}
      >
        {wishlist[celebrity._id] ? <Bookmark /> : <BookmarkBorder />}
      </IconButton>

      {/* Share */}
      <IconButton
        sx={{ position: 'absolute', right: 12, bottom: 92, bgcolor: 'rgba(0,0,0,.4)', color: '#fff', zIndex: 2 }}
        size="small"
        onClick={handleShareClick}
      >
        <Share fontSize="small" />
      </IconButton>

      {/* Info */}
      <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 14, zIndex: 2 }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 0.5 }}>
          {celebrity.name}
        </Typography>

        <Chip
          size="small"
          label={singularCategoryLabel(celebrity.category)}
          sx={{ bgcolor: bg, color: fg, fontWeight: 600, mb: 0.5 }}
        />

        <Typography sx={{ color: '#ffd54f', fontSize: '.95rem', mb: 1 }}>
          ₹{celebrity.price?.toLocaleString('en-IN') || '-'}
        </Typography>

        <Button
          variant="contained"
          onClick={handleBookingClick}
          sx={{
            backgroundColor: '#f0a500',
            color: '#000',
            width: { xs: '70%', sm: '60%' },
            display: 'block',
            mx: 'auto',
            borderRadius: 18,
            fontWeight: 600,
            fontSize: '.9rem',
            py: 0.6,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#ffb300' }
          }}
        >
          Book Now
        </Button>
      </Box>
    </Card>
  )
}

export default CelebrityCard
