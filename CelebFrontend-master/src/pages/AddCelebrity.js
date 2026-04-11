import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCelebrity } from '../api';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { showToast } from '../utils/toastUtility';

const AddCelebrity = () => {
  const navigate = useNavigate();
  const [newCelebrity, setNewCelebrity] = useState({
    name: '',
    images: [],
    description: '',
    price: '',
    contact: '+91', // ✅ default prefix
    category: '',
    socialLinks: { instagram: '', youtube: '' }
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const platform = name.split('.')[1];
      setNewCelebrity({
        ...newCelebrity,
        socialLinks: { ...newCelebrity.socialLinks, [platform]: value }
      });
    } else if (name === 'contact') {
      // ✅ Always keep +91 prefix and only allow digits after it
      let formatted = value.startsWith('+91') ? value : '+91' + value.replace(/\D/g, '');
      if (formatted.length > 13) formatted = formatted.slice(0, 13); // +91 + 10 digits
      setNewCelebrity({ ...newCelebrity, contact: formatted });
    } else {
      setNewCelebrity({ ...newCelebrity, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newCelebrity.images.length > 5) {
      showToast('You can upload up to 5 images only.', 'error');
      return;
    }
    setNewCelebrity({
      ...newCelebrity,
      images: [...newCelebrity.images, ...files]
    });
    setImagePreviews([
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file))
    ]);
  };

  const handleRemoveImage = (index) => {
    setNewCelebrity({
      ...newCelebrity,
      images: newCelebrity.images.filter((_, i) => i !== index)
    });
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setNewCelebrity({ ...newCelebrity, images: [] });
    setImagePreviews([]);
  };

  const handleAddCelebrity = async (e) => {
    e.preventDefault();
    if (
      !newCelebrity.name ||
      newCelebrity.images.length === 0 ||
      !newCelebrity.description ||
      !newCelebrity.price ||
      !newCelebrity.contact ||
      !newCelebrity.category
    ) {
      setError('Please fill in all fields and upload at least one image.');
      setFormStatus('error');
      showToast('Please fill in all fields and upload at least one image.', 'error');
      return;
    }

    setError('');
    setLoading(true);
    setFormStatus(null);

    const formData = new FormData();
    formData.append('name', newCelebrity.name);
    formData.append('description', newCelebrity.description);
    formData.append('price', newCelebrity.price);
    formData.append('contact', newCelebrity.contact);
    formData.append('category', newCelebrity.category);
    newCelebrity.images.forEach((image) => formData.append('images', image));
    formData.append('socialLinks', JSON.stringify(newCelebrity.socialLinks));

    try {
      await addCelebrity(formData)
      showToast('Celebrity added successfully!', 'success')
      setFormStatus('success')
      setImagePreviews([])
      setNewCelebrity({
        name: '',
        images: [],
        description: '',
        price: '',
        contact: '+91',
        category: '',
        socialLinks: { instagram: '', youtube: '' }
      })
      navigate('/admin-dashboard-celebrities')
    } catch (err) {
      // Extract the most specific message available
      const serverMsg = err?.response?.data?.message
      const clientMsg = err?.message

      let errorMessage = serverMsg || clientMsg || 'Failed to add celebrity. Please try again.'

      // Map technical messages to user-friendly ones
      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch'))
        errorMessage = 'Network error. Please check your connection and try again.'
      else if (errorMessage.toLowerCase().includes('token') || errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('401'))
        errorMessage = 'Your session has expired. Please log in again.'
      else if (errorMessage.toLowerCase().includes('contact'))
        errorMessage = 'Invalid contact number. Please enter a valid 10-digit number with +91 prefix.'
      else if (errorMessage.toLowerCase().includes('price'))
        errorMessage = 'Invalid price. Please enter a positive number.'
      else if (errorMessage.toLowerCase().includes('image'))
        errorMessage = 'Image upload failed. Please use JPG, PNG or WebP files under 10MB.'
      else if (errorMessage.toLowerCase().includes('too many'))
        errorMessage = 'Too many images. Maximum 5 images allowed.'
      else if (errorMessage.toLowerCase().includes('size'))
        errorMessage = 'Image is too large. Maximum size is 10MB per image.'

      setError(errorMessage)
      setFormStatus('error')
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f4f4'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          padding: '30px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#333',
            marginBottom: '25px',
            textAlign: 'center'
          }}
        >
          Add New Celebrity
        </Typography>

        {formStatus === 'error' && (
          <Alert severity="error" sx={{ marginBottom: '20px' }}>
            {error}
          </Alert>
        )}
        {formStatus === 'success' && (
          <Alert severity="success" sx={{ marginBottom: '20px' }}>
            Celebrity added successfully!
          </Alert>
        )}

        <form onSubmit={handleAddCelebrity}>
          <TextField
            fullWidth
            label="Celebrity Name"
            name="name"
            value={newCelebrity.name}
            onChange={handleInputChange}
            required
            disabled={loading}
            sx={{
              marginBottom: '15px',
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }
            }}
          />

          <Box sx={{ marginBottom: '15px' }}>
            <Typography variant="body1" sx={{ color: '#333', fontWeight: 600 }}>
              Upload Images (Max 5)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              multiple
              style={{ display: 'none' }}
              id="upload-button"
            />
            <label htmlFor="upload-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  padding: '8px',
                  textTransform: 'none',
                  borderColor: '#fbc02d',
                  color: '#000',
                  '&:hover': {
                    borderColor: '#fbc02d',
                    backgroundColor: '#fbc02d',
                    color: '#fff'
                  }
                }}
              >
                Choose Images
              </Button>
            </label>

            {imagePreviews.length > 0 && (
              <Box sx={{ marginTop: '15px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                    {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''} selected
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleClearAll}
                    sx={{ color: '#e53935', fontSize: '0.75rem', textTransform: 'none', p: 0 }}
                  >
                    Clear all
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {imagePreviews.map((preview, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                      />
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: 'absolute', top: -8, right: -8,
                            bgcolor: '#e53935', color: '#fff', width: 20, height: 20,
                            '&:hover': { bgcolor: '#b71c1c' }
                          }}
                        >
                          <Close sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={newCelebrity.description}
            onChange={handleInputChange}
            required
            disabled={loading}
            multiline
            rows={3}
            sx={{
              marginBottom: '15px',
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }
            }}
          />

          <TextField
            fullWidth
            label="Price"
            name="price"
            value={newCelebrity.price}
            onChange={handleInputChange}
            required
            disabled={loading}
            type="number"
            sx={{
              marginBottom: '15px',
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }
            }}
          />

          <TextField
            fullWidth
            label="Contact"
            name="contact"
            value={newCelebrity.contact}
            onChange={handleInputChange}
            required
            disabled={loading}
            sx={{
              marginBottom: '15px',
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }
            }}
          />

          <FormControl fullWidth sx={{ marginBottom: '15px' }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              name="category"
              value={newCelebrity.category}
              onChange={handleInputChange}
              required
              disabled={loading}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }
              }}
            >
              {[
                'actors',
                'artists',
                'comedians',
                'djs',
                'entrepreneurs',
                'fashion-designers',
                'influencers',
                'models',
                'motivational-speakers',
                'politicians',
                'singers',
                'youtubers',
                'athletes'
              ].map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Instagram URL"
            name="socialLinks.instagram"
            value={newCelebrity.socialLinks.instagram}
            onChange={handleInputChange}
            disabled={loading}
            sx={{
              marginBottom: '15px',
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }
            }}
            placeholder="https://instagram.com/username"
          />

          <TextField
            fullWidth
            label="YouTube URL"
            name="socialLinks.youtube"
            value={newCelebrity.socialLinks.youtube}
            onChange={handleInputChange}
            disabled={loading}
            sx={{
              marginBottom: '25px',
              '& .MuiInputBase-root': {
                borderRadius: '8px',
                backgroundColor: '#fafafa'
              }
            }}
            placeholder="https://youtube.com/channel"
          />

          <Button
            type="submit"
            variant="outlined"
            disabled={loading}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              padding: '6px 12px',
              width: 'auto',
              maxWidth: '200px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              mx: 'auto',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Add Celebrity'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default AddCelebrity;