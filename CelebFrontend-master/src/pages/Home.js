import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToWishlist, removeFromWishlist, getCelebrities, getWishlist } from '../api'
import {
  Grid,
  Typography,
  Container,
  Select,
  MenuItem,
  FormControl,
  Box,
  Stack,
  useMediaQuery,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
  TextField,
  Alert
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import CelebrityCard from '../components/CelebrityCard'
import styled from '@emotion/styled'
import { showToast } from '../utils/toastUtility'
import { setCelebrities, setLoading, setError } from '../redux/reducers/celebrityReducer'

const SelectWrapper = styled(FormControl)`
  min-width: 120px;
  position: relative;
  margin: 6px 0;
  z-index: 2;
  @media (max-width: 600px) {
    min-width: 0;
    width: 48%;
  }
  @media (min-width: 601px) and (max-width: 900px) {
    width: 46%;
  }
  .MuiInputBase-root {
    min-height: 32px;
  }
`

const SelectStyled = styled(Select)`
  background-color: #121212;
  color: #ffffff;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.75rem;
  padding: 4px 8px;
  border: 1px solid #333;
  min-height: 32px;
  transition: all 0.15s ease;
  & .MuiSelect-select {
    color: #ffffff;
  }
  & .MuiSelect-icon {
    color: #f0a500;
    font-size: 18px;
  }
  &:hover {
    background-color: #121212;
    border-color: #f0a500;
  }
  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: #f0a500;
  }
  &:focus,
  &.Mui-focused {
    outline: none;
    box-shadow: none;
  }
  @media (max-width: 768px) {
    font-size: 0.72rem;
    padding: 3px 6px;
    min-height: 30px;
  }
`

const MenuItemStyled = styled(MenuItem)`
  font-size: 0.78rem;
  font-weight: 500;
  padding: 6px 8px;
  min-height: 30px;
  color: #ffffff;
  background-color: #121212;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
  &:hover {
    background-color: #121212;
    color: #f0a500;
    transform: translateY(-1px);
  }
  &:focus {
    outline: none;
    box-shadow: none;
    background-color: #121212;
    color: #f0a500;
  }
  &.Mui-selected {
    background-color: #121212;
    color: #f0a500;
  }
  &.Mui-selected:hover {
    background-color: #121212;
    color: #ffb300;
  }
`

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />
})

const Home = () => {
  const dispatch = useDispatch()
  const { celebrities = [], loading, error } = useSelector(state => state.celebrity)

  const [searchQuery, setSearchQuery] = useState('')
  const [wishlist, setWishlist] = useState({})
  const [sortBy, setSortBy] = useState('name-asc')
  const [filterBy, setFilterBy] = useState('all')
  const [openSearch, setOpenSearch] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isMobile = useMediaQuery('(max-width:600px)')
  const isTablet = useMediaQuery('(max-width:900px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const searchInputRef = useRef(null)
  const searchBtnRef = useRef(null)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    const s = localStorage.getItem('home.sortBy')
    const f = localStorage.getItem('home.filterBy')
    const q = localStorage.getItem('home.searchQuery')
    if (s) setSortBy(s)
    if (f) setFilterBy(f)
    if (q) setSearchQuery(q)
  }, [])

  useEffect(() => { localStorage.setItem('home.sortBy', sortBy) }, [sortBy])
  useEffect(() => { localStorage.setItem('home.filterBy', filterBy) }, [filterBy])
  useEffect(() => { localStorage.setItem('home.searchQuery', searchQuery) }, [searchQuery])

  const fetchCelebs = useCallback(async () => {
    dispatch(setLoading())
    try {
      const response = await getCelebrities()
      dispatch(setCelebrities(response))
    } catch (e) {
      dispatch(setError(e?.message || 'Failed to load'))
    }
  }, [dispatch])

  useEffect(() => { fetchCelebs() }, [fetchCelebs])

  // Load existing wishlist from server so bookmark icons show correct state
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) return
    getWishlist().then(data => {
      const items = data?.celebrities || []
      const map = {}
      items.forEach(c => { if (c?._id) map[c._id] = true })
      setWishlist(map)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || ''
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)
      if (!isTyping && e.key === '/' && !openSearch) {
        e.preventDefault()
        setOpenSearch(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSearch])

  useEffect(() => {
    if (openSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [openSearch])

  const handleCloseSearch = () => {
    setOpenSearch(false)
    setTimeout(() => searchBtnRef.current?.focus?.(), 0)
  }

  const handleSearchChange = useCallback(event => setSearchQuery(event.target.value), [])
  const handleSortChange = useCallback(event => setSortBy(event.target.value), [])

  const handleWishlistToggle = useCallback(async celebrityId => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) {
      showToast('Please log in to manage your wishlist.', 'info')
      return
    }
    try {
      const newWishlistStatus = !wishlist[celebrityId]
      if (newWishlistStatus) {
        await addToWishlist(celebrityId)
        showToast('Celebrity added to wishlist!', 'success')
      } else {
        await removeFromWishlist(celebrityId)
        showToast('Celebrity removed from wishlist!', 'error')
      }
      setWishlist(prev => ({ ...prev, [celebrityId]: newWishlistStatus }))
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    }
  }, [wishlist])

  const sortedFilteredCelebrities = useMemo(() => {
    return celebrities
      .filter(c =>
        (c?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterBy === 'all' || c.category === filterBy)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-asc': return a.name.localeCompare(b.name)
          case 'name-desc': return b.name.localeCompare(a.name)
          case 'price-asc': return (a.price || 0) - (b.price || 0)
          case 'price-desc': return (b.price || 0) - (a.price || 0)
          case 'newest-first': return new Date(b.createdAt) - new Date(a.createdAt)
          default: return 0
        }
      })
  }, [celebrities, searchQuery, filterBy, sortBy])

  const isEmpty = !loading && sortedFilteredCelebrities.length === 0

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0e0e0d 30%, #100c0c 90%)' }}>
      <Container maxWidth='lg' sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 5, md: 7 } }}>
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert
              severity="error"
              variant="filled"
              sx={{ bgcolor: '#b71c1c' }}
              action={
                <Button color="inherit" size="small" onClick={fetchCelebs}>
                  Retry
                </Button>
              }
            >
              {String(error)}
            </Alert>
          </Box>
        )}

        <Stack
          direction='row'
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backdropFilter: 'blur(6px)',
            background: 'rgba(16, 12, 12, 0.6)',
            borderRadius: 2,
            p: { xs: scrolled ? 0.5 : 0.75, sm: scrolled ? 0.75 : 1 },
            mb: { xs: 1.5, sm: 2 },
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            borderTop: scrolled ? '1px solid #2a2a2a' : '1px solid transparent',
            transition: 'padding 150ms ease, border-color 150ms ease'
          }}
        >
          <SelectWrapper
            variant="outlined"
            sx={{
              width: { xs: 100, sm: 120 },
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              transition: 'transform .12s ease, box-shadow .12s ease',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            <SelectStyled
              aria-label="Sort By"
              value={sortBy}
              onChange={handleSortChange}
              fullWidth
              size="small"
              displayEmpty
              renderValue={() => (
                <span style={{ color: '#ffffff', fontSize: '0.8rem', letterSpacing: '0.3px' }}>
                  Sort By
                </span>
              )}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#121212',
                    color: '#ffffff',
                    border: '1px solid #222',
                    boxShadow: '0 10px 24px rgba(0,0,0,0.6)',
                    mt: 1
                  }
                },
                MenuListProps: { dense: true, sx: { py: 0.5 } }
              }}
              sx={{
                '& .MuiSelect-select': {
                  padding: '4px 8px',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  minHeight: '30px'
                },
                '& .MuiSelect-icon': { color: '#f0a500', fontSize: '1rem' },
                '& fieldset': { border: 'none' }
              }}
            >
              <MenuItemStyled value="name-asc">Name (A–Z)</MenuItemStyled>
              <MenuItemStyled value="name-desc">Name (Z–A)</MenuItemStyled>
              <MenuItemStyled value="price-asc">Price (Low → High)</MenuItemStyled>
              <MenuItemStyled value="price-desc">Price (High → Low)</MenuItemStyled>
              <MenuItemStyled value="newest-first">Newest First</MenuItemStyled>
            </SelectStyled>
          </SelectWrapper>

          <Stack direction='row' alignItems='center' spacing={0.5} sx={{ pl: 0.25 }}>
            <Tooltip title="Search ( / )">
              <IconButton
                ref={searchBtnRef}
                aria-label="Open search"
                onClick={() => setOpenSearch(true)}
                sx={{
                  border: '1px solid #444',
                  borderRadius: '10px',
                  backgroundColor: '#1c1c1c',
                  p: 0.6,
                  '&:hover': { borderColor: '#f0a500', backgroundColor: '#232323' }
                }}
              >
                <SearchIcon sx={{ color: '#f0a500', fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: 'auto',
            pb: 1,
            mb: 2,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#333', borderRadius: 3 }
          }}
        >
          {['all', 'actors', 'artists', 'athletes', 'comedians', 'djs', 'entrepreneurs', 'fashion-designers', 'influencers', 'models', 'motivational-speakers', 'politicians', 'singers', 'youtubers'].map(cat => (
            <Button
              key={cat}
              size="small"
              onClick={() => setFilterBy(cat)}
              disableRipple
              variant={filterBy === cat ? 'contained' : 'outlined'}
              sx={{
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
                bgcolor: filterBy === cat ? '#f0a500' : 'transparent',
                color: '#fff',
                borderColor: '#444',
                fontWeight: 500,
                px: 1.5,
                py: 0.5,
                borderRadius: 999,
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: '#f0a500',
                  bgcolor: filterBy === cat ? '#ffb300' : '#1e1e1e',
                  color: '#fff'
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: 'none'
                },
                '&:active': {
                  bgcolor: filterBy === cat ? '#ffb300' : '#2a2a2a'
                }
              }}
            >
              {cat}
            </Button>
          ))}
        </Stack>

        <Box sx={{ textAlign: 'center', mt: { xs: 1, sm: 2 } }}>
          <Typography
            variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h3'}
            sx={{ color: '#f0a500', fontWeight: 900, textTransform: 'uppercase', letterSpacing: { xs: '1px', md: '2px' }, fontFamily: '"Roboto", sans-serif' }}
          >
            Exclusive Celebrities
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h6'}
            sx={{ color: '#c7c7c7', fontWeight: 500, mt: 1, fontSize: { xs: '1rem', md: '1.1rem' }, fontFamily: '"Roboto", sans-serif', letterSpacing: { xs: '0.3px', md: '1px' } }}
          >
            Choose from our exclusive list of celebrities for your next event.
          </Typography>
        </Box>

        {isEmpty && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography sx={{ color: '#e0e0e0', fontWeight: 700, mb: 1 }}>No matches</Typography>
            <Typography sx={{ color: '#9e9e9e', mb: 2 }}>
              Try a different name or remove filters.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => { setFilterBy('all'); setSearchQuery(''); }}
              sx={{ borderColor: '#f0a500', color: '#f0a500', '&:hover': { borderColor: '#ffb300', color: '#ffb300' } }}
            >
              Clear filters
            </Button>
          </Box>
        )}

        {loading && (
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
            {[...Array(8)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#141414', border: '1px solid #1f1f1f' }}>
                  <Box sx={{ height: 180, bgcolor: '#1e1e1e', borderRadius: 2, mb: 1.5 }} />
                  <Box sx={{ height: 18, bgcolor: '#1e1e1e', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 14, bgcolor: '#1e1e1e', borderRadius: 1, width: '70%' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && sortedFilteredCelebrities.length > 0 && (
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            justifyContent='center'
            sx={{ mt: { xs: 1, sm: 2 } }}
          >
            {sortedFilteredCelebrities.map(celebrity => (
              <Grid key={celebrity._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <CelebrityCard
                  celebrity={celebrity}
                  wishlist={wishlist}
                  handleWishlistToggle={handleWishlistToggle}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog
        open={openSearch}
        TransitionComponent={reduceMotion ? undefined : Transition}
        keepMounted
        onClose={handleCloseSearch}
        PaperProps={{
          sx: {
            backgroundColor: '#121212',
            border: '1px solid #333',
            borderRadius: 3,
            width: '100%',
            maxWidth: 560
          }
        }}
      >
        <DialogTitle
          sx={{
            color: '#f0a500',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            pr: 6
          }}
        >
          Search Celebrities
          <IconButton
            aria-label="Close search"
            onClick={handleCloseSearch}
            sx={{ position: 'absolute', right: 12, top: 12, color: '#bbb' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <TextField
            inputRef={searchInputRef}
            placeholder='Type a name…'
            variant='outlined'
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCloseSearch() }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1.2 }} />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1c1c1c',
                borderRadius: '14px',
                p: '12px 16px',
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#f0a500' },
                '&.Mui-focused fieldset': { borderColor: '#ffd700' }
              },
              '& .MuiOutlinedInput-input': {
                color: '#e6e6e6',
                fontWeight: 500,
                fontSize: '1rem'
              }
            }}
          />
          <Typography sx={{ mt: 1.5, color: '#888', fontSize: 12 }}>
            Tip: Press <kbd>/</kbd> to open search anywhere. Press <kbd>Enter</kbd> to apply.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseSearch} sx={{ color: '#ccc' }}>
            Close
          </Button>
          <Button
            variant='contained'
            onClick={handleCloseSearch}
            sx={{
              backgroundColor: '#f0a500',
              color: '#111',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#ffb300' }
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ height: { xs: 8, sm: 0 } }} />
    </Box>
  )
}

export default Home