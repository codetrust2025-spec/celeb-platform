import React, { useEffect, useState, useRef } from 'react'
import {
  Box,
  Card,
  Typography,
  Grid,
  Container,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowBack,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getCelebrities, deleteCelebrity, updateCelebrity } from '../api'
import SearchBar from '../components/SearchBar'
import { useDispatch, useSelector } from 'react-redux'
import { setCelebrities, setLoading, setError } from '../redux/reducers/celebrityReducer'
import { showToast, createButtonStyles } from '../utils/toastUtility'
import { buildFileURL } from '../utils/fileUrl'

// CSS cross-fade cycler — no react-slick layout issues
const ImageCycler = ({ images, alt, height = 320 }) => {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)
  useEffect(() => {
    if (images.length <= 1) return
    timerRef.current = setInterval(() => setActive(p => (p + 1) % images.length), 2000)
    return () => clearInterval(timerRef.current)
  }, [images.length])
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {images.map((url, i) => (
        <Box key={url + i} component="img" src={buildFileURL(url)} alt={i === 0 ? alt : ''}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            filter: 'brightness(0.82)', opacity: i === active ? 1 : 0, transition: 'opacity 0.6s ease' }} />
      ))}
    </Box>
  )
}

const AdminCelebrityList = () => {
  const celebrities = useSelector((state) => state.celebrity.celebrities)
  const loading = useSelector((state) => state.celebrity.loading)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCelebrityList, setFilteredCelebrityList] = useState(celebrities)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCelebrity, setSelectedCelebrity] = useState(null)
  const [editedCelebrity, setEditedCelebrity] = useState({
    name: '',
    description: '',
    price: '',
    contact: '',
    imageUrls: [],
  })
  const [newImages, setNewImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [validationErrors, setValidationErrors] = useState({})

  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      showToast('You can upload up to 5 images only.', 'error')
      return
    }
    setNewImages(files)
    setImagePreviews(files.map(f => URL.createObjectURL(f)))
  }
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchCelebrities = async () => {
      dispatch(setLoading())
      try {
        const response = await getCelebrities()
        dispatch(setCelebrities(response))
      } catch (error) {
        dispatch(setError(error.message))
      }
    }
    fetchCelebrities()
  }, [dispatch])

  useEffect(() => {
    setFilteredCelebrityList(celebrities)
  }, [celebrities])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    setFilteredCelebrityList(
      celebrities.filter((celebrity) =>
        celebrity.name.toLowerCase().includes(query.toLowerCase())
      )
    )
  }

  const handleDeleteClick = (celebrity) => {
    setSelectedCelebrity(celebrity)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteCelebrity(selectedCelebrity._id)
      showToast('Celebrity deleted successfully', 'success')
      setFilteredCelebrityList((prev) =>
        prev.filter((item) => item._id !== selectedCelebrity._id)
      )
    } catch {
      showToast('Failed to delete celebrity.', 'error')
    } finally {
      setDeleteDialogOpen(false)
      setSelectedCelebrity(null)
    }
  }

  const handleEditClick = (celebrity) => {
    setSelectedCelebrity(celebrity)
    setEditedCelebrity({ ...celebrity })
    setNewImages([])
    setImagePreviews([])
    setValidationErrors({})
    setEditDialogOpen(true)
  }

  const handleEditConfirm = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!editedCelebrity.name || editedCelebrity.name.trim().length < 3)
      errors.name = 'Name must be at least 3 characters long.'
    if (!editedCelebrity.description || editedCelebrity.description.trim().length < 10)
      errors.description = 'Description must be at least 10 characters long.'
    if (!editedCelebrity.price || isNaN(editedCelebrity.price) || editedCelebrity.price <= 0)
      errors.price = 'Price must be a positive number.'
    if (!editedCelebrity.contact || !/^\+?[0-9]{10,15}$/.test(editedCelebrity.contact))
      errors.contact = 'Contact must be a valid phone number.'
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors({})
    try {
      const formData = new FormData()
      formData.append('name', editedCelebrity.name)
      formData.append('description', editedCelebrity.description)
      formData.append('price', editedCelebrity.price)
      formData.append('contact', editedCelebrity.contact)
      if (editedCelebrity.category) formData.append('category', editedCelebrity.category)
      if (editedCelebrity.socialLinks) formData.append('socialLinks', JSON.stringify(editedCelebrity.socialLinks))
      newImages.forEach(img => formData.append('images', img))

      await updateCelebrity(editedCelebrity._id, formData)
      showToast('Celebrity updated successfully.', 'success')
      setEditDialogOpen(false)
      setNewImages([])
      setImagePreviews([])
      const data = await getCelebrities()
      dispatch(setCelebrities(data || []))
    } catch {
      showToast('Error updating celebrity.', 'error')
    }
  }

  const handleAddCelebrity = () => navigate('/add-celebrity')

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#f9fafb', pt: 7, pb: 6 }}>
      <Container maxWidth='lg'>
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '0.5rem', sm: '1rem' }, // moved higher
            left: { xs: '1rem', sm: '1.5rem' },
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/admin-dashboard')}
            sx={{
              ...createButtonStyles('small'),
              boxShadow: 3,
              borderRadius: 2,
              minWidth: '32px',
              height: '32px',
              p: '2px 6px',
              '& .MuiButton-startIcon': { m: 0 }, // keeps icon tight
              '& svg': { fontSize: 18 } // slightly smaller icon
            }}
            startIcon={<ArrowBack />}
          />

        </Box>

        {/* Registered Celebrities Count */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '0.5rem', sm: '1rem' },
            right: { xs: '1rem', sm: '1.5rem' },
            backgroundColor: '#e3f2fd',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            boxShadow: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            zIndex: 10,
          }}
        >
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, color: 'primary.main', whiteSpace: 'nowrap' }}
          >
            Registered:
          </Typography>
          <Typography
            variant='body2'
            sx={{ fontWeight: 700, color: 'text.primary' }}
          >
            {filteredCelebrityList.length}
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box display='flex' justifyContent='center' mb={0.5}>
          <Box width={{ xs: '80%', sm: '45%', md: '35%' }}>
            <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearch} />
          </Box>
        </Box>

        {/* Add Celebrity Button */}
        <Box display='flex' justifyContent='center' mb={2} mt={0}>
          <Button
            variant='contained'
            color='secondary'
            startIcon={<AddIcon />}
            onClick={handleAddCelebrity}
            sx={{ ...createButtonStyles('small'), boxShadow: 3, borderRadius: 2 }}
          >
            Add Celebrity
          </Button>
        </Box>


        {/* Title */}
        <Box textAlign='center' mb={3}>
          <Typography variant='h8' sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Celebrity List
          </Typography>
        </Box>

        {/* Celebrity Cards */}
        <Grid container spacing={3} justifyContent='center'>
          {loading ? (
            <Typography sx={{ textAlign: 'center', width: '100%' }}>Loading...</Typography>
          ) : filteredCelebrityList.length > 0 ? (
            filteredCelebrityList.map((celebrity) => (
              <Grid key={celebrity._id} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                  sx={{
                    position: 'relative',
                    width: 280,
                    height: 320,
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.2)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      border: '1px solid rgba(0,0,0,0.6)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                    },
                  }}
                >
                  {(() => {
                    const imgs = Array.isArray(celebrity.imageUrls) && celebrity.imageUrls.length
                      ? celebrity.imageUrls
                      : celebrity.imageUrl ? [celebrity.imageUrl] : []
                    return imgs.length > 0
                      ? <ImageCycler images={imgs} alt={celebrity.name} height={320} />
                      : <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#333' }} />
                  })()}

                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      bgcolor: 'rgba(0,0,0,0.52)',
                      color: '#fff',
                      p: 1.25,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      {celebrity.name}
                    </Typography>
                    <Typography variant='body2'>₹{celebrity.price}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <IconButton onClick={() => handleEditClick(celebrity)} sx={{ color: '#fff' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(celebrity)} sx={{ color: '#f44336' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', width: '100%' }}>No registered celebrities found.</Typography>
          )}
        </Grid>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this celebrity?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color='error' variant='contained'>Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          fullWidth
          maxWidth='sm'
          PaperProps={{
            sx: {
              width: { xs: '90%', sm: '70%', md: '400px' },
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center', pb: 1 }}>
            Edit Celebrity
          </DialogTitle>

          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, px: { xs: 2, sm: 3 }, pb: 1 }}>
            <TextField
              label='Full Name'
              value={editedCelebrity.name}
              onChange={(e) => setEditedCelebrity({ ...editedCelebrity, name: e.target.value })}
              fullWidth
              variant='outlined'
              size='small'
              error={!!validationErrors.name}
              helperText={validationErrors.name}
            />
            <TextField
              label='Description'
              value={editedCelebrity.description}
              onChange={(e) => setEditedCelebrity({ ...editedCelebrity, description: e.target.value })}
              fullWidth
              variant='outlined'
              size='small'
              multiline
              rows={3}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
            />
            <TextField
              label='Price (₹)'
              type='number'
              value={editedCelebrity.price}
              onChange={(e) => setEditedCelebrity({ ...editedCelebrity, price: e.target.value })}
              fullWidth
              variant='outlined'
              size='small'
              error={!!validationErrors.price}
              helperText={validationErrors.price}
            />
            <TextField
              label='Contact Number'
              value={editedCelebrity.contact}
              onChange={(e) => setEditedCelebrity({ ...editedCelebrity, contact: e.target.value })}
              fullWidth
              variant='outlined'
              size='small'
              error={!!validationErrors.contact}
              helperText={validationErrors.contact}
            />

            {/* Image Upload */}
            <Box>
              <input
                type='file'
                accept='image/*'
                multiple
                id='edit-image-upload'
                style={{ display: 'none' }}
                onChange={handleEditImageChange}
              />
              <label htmlFor='edit-image-upload'>
                <Button variant='outlined' component='span' fullWidth size='small'>
                  {newImages.length > 0 ? `${newImages.length} image(s) selected` : 'Upload New Images (optional)'}
                </Button>
              </label>
              {imagePreviews.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} alt={`preview-${i}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>

          <DialogActions sx={{ justifyContent: 'center', px: { xs: 2, sm: 3 }, pb: 2, gap: 1.5 }}>
            <Button onClick={() => setEditDialogOpen(false)} variant='outlined'>Cancel</Button>
            <Button onClick={handleEditConfirm} variant='contained'>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}

export default AdminCelebrityList