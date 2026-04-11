import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Menu,
  MenuItem,
  Typography,
  IconButton
} from '@mui/material'
import logoImage from '../assets/logoImage.png'
import { showToast } from '../utils/toastUtility'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import HomeIcon from '@mui/icons-material/Home'
import FavoriteIcon from '@mui/icons-material/Favorite'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import LoginIcon from '@mui/icons-material/Login'

const LogoAndNavLinks = ({ isLoggedIn, handleWishlistClick, handleLoginClick, handleBookingsClick, handleLogout }) => {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCelebrity, setIsCelebrity] = useState(false)

  const loadProfileFromSession = () => {
    const adminRaw = sessionStorage.getItem('adminProfile')
    const celebrityRaw = sessionStorage.getItem('celebrityProfile')
    const userRaw = sessionStorage.getItem('userProfile')

    if (adminRaw) {
      try {
        setUserInfo(JSON.parse(adminRaw))
        setIsAdmin(true)
        setIsCelebrity(false)
        return
      } catch {
        setUserInfo(null)
        setIsAdmin(false)
        setIsCelebrity(false)
      }
    }

    if (celebrityRaw) {
      try {
        setUserInfo(JSON.parse(celebrityRaw))
        setIsAdmin(false)
        setIsCelebrity(true)
        return
      } catch {
        setUserInfo(null)
        setIsAdmin(false)
        setIsCelebrity(false)
      }
    }

    if (userRaw) {
      try {
        setUserInfo(JSON.parse(userRaw))
        setIsAdmin(false)
        setIsCelebrity(false)
        return
      } catch {
        setUserInfo(null)
        setIsAdmin(false)
        setIsCelebrity(false)
      }
    }

    setUserInfo(null)
    setIsAdmin(false)
    setIsCelebrity(false)
  }

  useEffect(() => {
    loadProfileFromSession()
    const onStorage = e => {
      if (
        e.key === 'adminProfile' ||
        e.key === 'userProfile' ||
        e.key === 'celebrityProfile' ||
        e.key === null
      ) {
        loadProfileFromSession()
      }
    }
    const onProfileChange = () => loadProfileFromSession()
    window.addEventListener('storage', onStorage)
    window.addEventListener('profileChange', onProfileChange)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('profileChange', onProfileChange)
    }
  }, [isLoggedIn])

  const handleHomeClick = () => navigate('/')
  const handleMenuClick = event => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogoutClick = () => {
    sessionStorage.removeItem('adminProfile')
    sessionStorage.removeItem('userProfile')
    sessionStorage.removeItem('celebrityProfile')
    setUserInfo(null)
    setIsAdmin(false)
    setIsCelebrity(false)
    handleLogout()
    showToast('Logged out successfully', 'success')
    window.dispatchEvent(new Event('profileChange'))
  }

  const displayUsername = (() => {
    if (!userInfo) return 'Username'
    return (userInfo?.name || '').trim() || 'Username'
  })()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 2
      }}
    >
      <Link
        to='/'
        style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <img src={logoImage} alt='Logo' style={{ height: 50, borderRadius: '50%' }} />
        <Typography
          variant='h6'
          sx={{
            ml: 2,
            fontWeight: 800,
            color: '#f0a500',
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' }
          }}
        >
          Celebrity Engagements
        </Typography>
      </Link>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, sm: 1.5 },
          ml: 'auto'
        }}
      >
        <IconButton
          onClick={handleHomeClick}
          aria-label='home'
          disableRipple
          sx={{
            color: '#f0a500',
            p: { xs: '6px', sm: '8px' },
            bgcolor: 'transparent',
            '&:hover': { backgroundColor: '#1c1c1c' }
          }}
        >
          <HomeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>

        <IconButton
          onClick={e => {
            e.stopPropagation()
            handleWishlistClick()
          }}
          aria-label='wishlist'
          disableRipple
          sx={{
            color: '#f0a500',
            p: { xs: '6px', sm: '8px' },
            bgcolor: 'transparent',
            '&:hover': { backgroundColor: '#1c1c1c' }
          }}
        >
          <FavoriteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>

        <IconButton
          onClick={e => {
            e.stopPropagation()
            handleBookingsClick()
          }}
          aria-label='bookings'
          disableRipple
          sx={{
            color: '#f0a500',
            p: { xs: '6px', sm: '8px' },
            bgcolor: 'transparent',
            '&:hover': { backgroundColor: '#1c1c1c' }
          }}
        >
          <EventAvailableIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
        </IconButton>

        {!isLoggedIn ? (
          <IconButton
            onClick={handleLoginClick}
            aria-label='login'
            disableRipple
            sx={{
              color: '#f0a500',
              p: { xs: '6px', sm: '8px' },
              bgcolor: 'transparent',
              '&:hover': { backgroundColor: '#1c1c1c' }
            }}
          >
            <LoginIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        ) : (
          <IconButton
            onClick={handleMenuClick}
            aria-label='account'
            disableRipple
            sx={{
              color: '#f0a500',
              p: { xs: '6px', sm: '8px' },
              bgcolor: 'transparent',
              '&:hover': { backgroundColor: '#1c1c1c' }
            }}
          >
            <AccountCircleIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
          </IconButton>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiMenu-paper': {
            backgroundColor: '#1a1a1a',
            borderRadius: 2,
            minWidth: 150,
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem sx={{ color: '#f0a500', fontWeight: 600 }} disabled>
          {displayUsername}
        </MenuItem>
        {userInfo?.email && (
          <MenuItem sx={{ color: '#f0a500', fontWeight: 400 }} disabled>
            {userInfo.email}
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem
            onClick={() => {
              navigate('/admin-dashboard')
              handleMenuClose()
            }}
            sx={{
              color: '#f0a500',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#444' }
            }}
          >
            Admin Dashboard
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleLogoutClick()
            handleMenuClose()
          }}
          sx={{
            color: '#f0a500',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#444' }
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default LogoAndNavLinks