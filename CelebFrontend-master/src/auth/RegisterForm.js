import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Link } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { userRegister, celebrityRegister } from '../api';
import { showToast } from '../utils/toastUtility';

const RegisterForm = ({ flag }) => {
  const location = useLocation();
  const { celebrity } = location.state || {};
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    name: '',
    username: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name)) newErrors.name = 'Full name should only contain letters and spaces';
    if (!formData.emailOrPhone) newErrors.emailOrPhone = 'Email or phone number is required';
    else if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.emailOrPhone) && !/^\d{10}$/.test(formData.emailOrPhone))
      newErrors.emailOrPhone = 'Please enter a valid email or phone number';
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3 || formData.username.length > 15) newErrors.username = 'Username must be between 3 and 15 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Username can only contain letters, numbers, and underscores';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    const userId = `${formData.username}-${Date.now()}`;
    try {
      const response =
        flag === 'celebrity'
          ? await celebrityRegister(formData.name, formData.password, formData.emailOrPhone, formData.username)
          : await userRegister(formData.name, formData.password, formData.emailOrPhone, formData.username, userId);
      if (response?.message === 'Registration successful') {
        showToast(response.message, 'success');
        navigate(flag === 'celebrity' ? '/celebrityLogin' : '/userLogin', { state: { celebrity } });
      } else {
        showToast(response.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('An error occurred during registration. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minHeight: '100vh',
        backgroundColor: '#000',
        padding: '20px',
      }}
    >
      <Card
        sx={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#1c1c1c',
          color: '#fff',
          borderRadius: '20px',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <CardContent sx={{ padding: '30px' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              marginBottom: '20px',
              textAlign: 'center',
              color: '#f0a500',
            }}
          >
            {flag === 'celebrity' ? 'Register as a Celebrity' : 'Create an Account'}
          </Typography>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
              error={Boolean(errors.name)}
              helperText={errors.name}
              size="small"
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#f0a500' },
                  '&.Mui-focused fieldset': { borderColor: '#f0a500' },
                },
                label: { color: '#aaa' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f0a500' },
              }}
            />
            <TextField
              label="Email Address or Mobile Number"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleInputChange}
              required
              fullWidth
              error={Boolean(errors.emailOrPhone)}
              helperText={errors.emailOrPhone}
              size="small"
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#f0a500' },
                  '&.Mui-focused fieldset': { borderColor: '#f0a500' },
                },
                label: { color: '#aaa' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f0a500' },
              }}
            />
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              fullWidth
              error={Boolean(errors.username)}
              helperText={errors.username}
              size="small"
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#f0a500' },
                  '&.Mui-focused fieldset': { borderColor: '#f0a500' },
                },
                label: { color: '#aaa' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f0a500' },
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password}
              size="small"
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#f0a500' },
                  '&.Mui-focused fieldset': { borderColor: '#f0a500' },
                },
                label: { color: '#aaa' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f0a500' },
              }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              fullWidth
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              size="small"
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#f0a500' },
                  '&.Mui-focused fieldset': { borderColor: '#f0a500' },
                },
                label: { color: '#aaa' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f0a500' },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#f0a500',
                padding: '12px',
                borderRadius: '25px',
                fontWeight: 'bold',
                color: '#000',
                '&:hover': { backgroundColor: '#e88b00' },
                '&:disabled': { backgroundColor: '#555', color: '#aaa' },
              }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            {flag !== 'admin' && (
              <Typography
                variant="body2"
                sx={{
                  textAlign: 'center',
                  marginTop: '15px',
                  color: '#ccc',
                }}
              >
                Have an account?{' '}
                <Link
                  href={flag === 'celebrity' ? '/celebrityLogin' : '/userLogin'}
                  sx={{
                    color: '#f0a500',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    '&:hover': { color: '#e88b00' },
                  }}
                >
                  {flag === 'celebrity' ? 'Login as Celebrity' : 'Login here'}
                </Link>
              </Typography>
            )}
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterForm;
