import React, { useState } from 'react'
import {
  Box, Typography, Button, Divider, Card, CardContent,
  TextField, Stack, CircularProgress
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Logout, ArrowBack, Save, CloudUpload } from '@mui/icons-material'
import { updateCelebrityProfile } from '../api'
import { showToast } from '../utils/toastUtility'

const CelebritySettings = () => {
  const navigate = useNavigate()
  const profile = JSON.parse(sessionStorage.getItem('celebrityProfile') || '{}')

  const [form, setForm] = useState({
    name: profile.name || '',
    description: profile.description || '',
    price: profile.price || '',
    contact: profile.contact || '',
    category: profile.category || '',
    instagram: profile.socialLinks?.instagram || '',
    youtube: profile.socialLinks?.youtube || '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [saving, setSaving] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFileChange = e => {
    const files = Array.from(e.target.files).slice(0, 5)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      if (form.name) formData.append('name', form.name)
      if (form.description) formData.append('description', form.description)
      if (form.price) formData.append('price', form.price)
      if (form.contact) formData.append('contact', form.contact)
      if (form.category) formData.append('category', form.category)
      formData.append('socialLinks', JSON.stringify({ instagram: form.instagram, youtube: form.youtube }))
      images.forEach(img => formData.append('images', img))

      const updated = await updateCelebrityProfile(formData)
      const updatedProfile = { ...profile, ...updated }
      sessionStorage.setItem('celebrityProfile', JSON.stringify(updatedProfile))
      showToast('Profile updated successfully!', 'success')
      setImages([])
      setPreviews([])
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.clear()
    window.dispatchEvent(new Event('loginStatusChange'))
    navigate('/')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#121212', color: '#fff', p: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/celebrityDashboard')}
        sx={{ color: '#f0a500', mb: 3 }}>Back to Dashboard</Button>

      <Typography variant="h5" sx={{ color: '#f0a500', mb: 3, fontWeight: 700 }}>Settings</Typography>

      <Card sx={{ bgcolor: '#1e1e1e', borderRadius: 3, maxWidth: 520 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Edit Profile</Typography>
          <Stack spacing={2}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange}
              size="small" InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#444' } }} />
            <TextField label="Description" name="description" value={form.description} onChange={handleChange}
              multiline rows={3} size="small" InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#444' } }} />
            <TextField label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange}
              size="small" InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#444' } }} />
            <TextField label="Contact" name="contact" value={form.contact} onChange={handleChange}
              size="small" InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#444' } }} />
            <TextField label="Category" name="category" value={form.category} onChange={handleChange}
              size="small" InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#444' } }} />
            <TextField label="Instagram URL" name="instagram" value={form.instagram} onChange={handleChange}
              size="small" InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#444' } }} />
            <TextField label="YouTube URL" name="youtube" value={form.youtube} onChange={handleChange}
              size="small" InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root fieldset': { borderColor: '#444' } }} />

            <Box>
              <input type="file" accept="image/*" multiple id="celeb-img-upload"
                style={{ display: 'none' }} onChange={handleFileChange} />
              <label htmlFor="celeb-img-upload">
                <Button variant="outlined" component="span" startIcon={<CloudUpload />}
                  sx={{ borderColor: '#f0a500', color: '#f0a500' }}>
                  {images.length > 0 ? `${images.length} image(s) selected` : 'Upload Images (optional)'}
                </Button>
              </label>
              {previews.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt={`preview-${i}`}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                  ))}
                </Box>
              )}
            </Box>

            <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
              onClick={handleSave} disabled={saving}
              sx={{ bgcolor: '#f0a500', color: '#000', '&:hover': { bgcolor: '#ffb300' } }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>

          <Divider sx={{ borderColor: '#333', my: 3 }} />

          <Typography variant="body2" sx={{ color: '#bbb', mb: 0.5 }}>Email: {profile.email || '-'}</Typography>

          <Button variant="contained" color="error" startIcon={<Logout />}
            onClick={handleLogout} fullWidth sx={{ mt: 2 }}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CelebritySettings
