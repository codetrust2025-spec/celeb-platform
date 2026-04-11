import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import {
  setWishlist,
  setLoading,
  setError,
  removeFromWishlist
} from '../redux/actions/wishlistActions'
import {
  getWishlist,
  removeFromWishlist as removeFromWishlistApi
} from '../api'
import LogoAndNavLinks from './LogoAndNavLinks'
import MobileDrawer from './MobileDrawer'
import WishlistPopup from './WishlistPopup'
import BookingsPopup from './BookingsPopup'
import { showToast } from '../utils/toastUtility'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { wishlist } = useSelector(state => state.wishlist)

  const userSlice = useSelector(s => s.user)
  const adminSlice = useSelector(s => s.admin)
  const celebritySlice = useSelector(s => s.celebrity)

  const reduxUserLoggedIn = Boolean(
    userSlice?.isAuthenticated ||
    userSlice?.loggedIn ||
    (userSlice?.userProfile && Object.keys(userSlice.userProfile).length)
  )

  const reduxAdminLoggedIn = Boolean(
    adminSlice?.loggedIn ||
    adminSlice?.isAuthenticated ||
    (adminSlice?.adminDetails && Object.keys(adminSlice.adminDetails).length)
  )

  const reduxCelebrityLoggedIn = Boolean(
    celebritySlice?.loggedIn ||
    celebritySlice?.isAuthenticated ||
    (celebritySlice?.profile && Object.keys(celebritySlice.profile).length) ||
    (celebritySlice?.celebrityProfile && Object.keys(celebritySlice.celebrityProfile).length)
  )

  const [loginStatus, setLoginStatus] = useState({
    isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
    isAdminLoggedIn: sessionStorage.getItem('isAdminLoggedIn') === 'true',
    isCelebrityLoggedIn: sessionStorage.getItem('isCelebrityLoggedIn') === 'true'
  })

  const isLoggedIn = loginStatus.isLoggedIn || reduxUserLoggedIn
  const isAdminLoggedIn = loginStatus.isAdminLoggedIn || reduxAdminLoggedIn
  const isCelebrityLoggedIn = loginStatus.isCelebrityLoggedIn || reduxCelebrityLoggedIn

  useEffect(() => {
    const setIfChanged = (key, val) => {
      const str = val ? 'true' : 'false'
      if (sessionStorage.getItem(key) !== str) {
        sessionStorage.setItem(key, str)
        window.dispatchEvent(new Event('loginStatusChange'))
      }
    }
    setIfChanged('isLoggedIn', isLoggedIn)
    setIfChanged('isAdminLoggedIn', isAdminLoggedIn)
    setIfChanged('isCelebrityLoggedIn', isCelebrityLoggedIn)
  }, [isLoggedIn, isAdminLoggedIn, isCelebrityLoggedIn])

  const [isSticky, setIsSticky] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isBookingsPopupOpen, setIsBookingsPopupOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const updateLoginStatus = () => {
      setLoginStatus({
        isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
        isAdminLoggedIn: sessionStorage.getItem('isAdminLoggedIn') === 'true',
        isCelebrityLoggedIn: sessionStorage.getItem('isCelebrityLoggedIn') === 'true'
      })
    }
    window.addEventListener('storage', updateLoginStatus)
    window.addEventListener('loginStatusChange', updateLoginStatus)
    return () => {
      window.removeEventListener('storage', updateLoginStatus)
      window.removeEventListener('loginStatusChange', updateLoginStatus)
    }
  }, [])

  const handleWishlistClick = useCallback(async () => {
    dispatch(setLoading())
    try {
      const response = await getWishlist()
      dispatch(setWishlist(response.celebrities))
      setIsPopupOpen(true)
    } catch {
      dispatch(setError('Error loading wishlist'))
      showToast('Error loading wishlist', 'error')
    }
  }, [dispatch])

  const handleRemoveClick = useCallback(async celebrityId => {
    try {
      await removeFromWishlistApi(celebrityId)
      dispatch(removeFromWishlist(celebrityId))
      showToast('Celebrity removed from wishlist', 'success')
    } catch {
      showToast('Error removing celebrity from wishlist', 'error')
    }
  }, [dispatch])

  const closePopup = useCallback(() => setIsPopupOpen(false), [])
  const closeBookingsPopup = useCallback(() => setIsBookingsPopupOpen(false), [])

  const handleLogout = useCallback(() => {
    sessionStorage.clear()
    window.dispatchEvent(new Event('loginStatusChange'))
    window.location.href = '/'
  }, [])

  const handleBookingsClick = useCallback(() => {
    setIsBookingsPopupOpen(true)
  }, [])

  const navLinks = useMemo(() => {
    const links = [
      { label: 'Home', to: '/' },
      { label: 'Wishlist', to: '#', action: handleWishlistClick },
      { label: 'Bookings', to: '#', action: handleBookingsClick },
      { label: 'About Us', to: '/aboutUs' }
    ]

    if (!isLoggedIn && !isAdminLoggedIn && !isCelebrityLoggedIn)
      links.push({ label: 'Celebrity', to: '/celebrityLogin' })

    if (isCelebrityLoggedIn)
      links.push({ label: 'Celebrity Dashboard', to: '/celebrityDashboard' })

    if (isAdminLoggedIn)
      links.push({ label: 'Admin Dashboard', to: '/admin-dashboard' })

    return links
  }, [isLoggedIn, isAdminLoggedIn, isCelebrityLoggedIn, handleWishlistClick, handleBookingsClick])

  return (
    <>
      <AppBar
        position='sticky'
        sx={{ boxShadow: isSticky ? 10 : 6, backgroundColor: '#121212', color: '#ffffff', py: { xs: 0.5, sm: 1 }, px: { xs: 1.5, sm: 3 }, zIndex: 1200, transition: 'box-shadow 0.3s ease-in-out' }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LogoAndNavLinks
            isLoggedIn={isLoggedIn || isAdminLoggedIn || isCelebrityLoggedIn}
            handleWishlistClick={handleWishlistClick}
            handleLogout={handleLogout}
            handleLoginClick={() => navigate('/userLogin')}
            handleBookingsClick={handleBookingsClick}
            sx={{ color: '#ffffff', '& a': { color: '#ffffff !important', textDecoration: 'none', transition: 'color 0.2s ease', '&:hover': { color: '#f0a500' } } }}
          />
          <IconButton
            edge='end'
            onClick={() => setIsMenuOpen(prev => !prev)}
            disableRipple
            aria-label='menu'
            sx={{ color: '#f0a500', bgcolor: 'transparent', '&:hover': { backgroundColor: '#1c1c1c' }, '&:focus': { boxShadow: 'none' } }}
          >
            <MenuIcon sx={{ color: '#f0a500', fontSize: '1.6rem' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <MobileDrawer isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} navLinks={navLinks} />

      <WishlistPopup isPopupOpen={isPopupOpen} wishlist={wishlist} handleRemoveClick={handleRemoveClick} closePopup={closePopup} />

      <BookingsPopup isPopupOpen={isBookingsPopupOpen} closePopup={closeBookingsPopup} />
    </>
  )
}

export default Header