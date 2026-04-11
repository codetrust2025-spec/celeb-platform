import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Link
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  userLogin,
  celebrityLogin,
  adminLogin
} from '../api'
import { showToast } from '../utils/toastUtility'
import { setAdminLogin } from '../redux/reducers/adminReducer'
import { setCelebrityLogin } from '../redux/reducers/celebrityReducer'
import { setUserProfile } from '../redux/reducers/userReducer'

const LoginForm = ({ flag }) => {
  const [formData, setFormData] = useState({ emailOrPhone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { celebrity } = location.state || {}

  useEffect(() => {
    // Redirect if already logged in (any role)
    if (sessionStorage.getItem('isLoggedIn') === 'true') { navigate('/'); return }
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { navigate('/admin-dashboard'); return }
    if (sessionStorage.getItem('isCelebrityLoggedIn') === 'true') { navigate('/celebrityDashboard'); return }
  }, [navigate])

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    if (!formData.emailOrPhone || !formData.password) {
      showToast('Please fill out all required fields.', 'error')
      setLoading(false)
      return
    }

    try {
      let response

      if (flag === 'celebrity') {
        response = await celebrityLogin(formData.emailOrPhone, formData.password)
        const celeb = response?.celebrity || {}
        const celebProfile = {
          id: celeb._id || celeb.email || celeb.name || '',
          name: celeb.name,
          email: celeb.email,
          role: 'celebrity'
        }
        dispatch(setCelebrityLogin(celebProfile))
        sessionStorage.setItem('isCelebrityLoggedIn', 'true')
        sessionStorage.setItem('celebrityProfile', JSON.stringify(celebProfile))
        if (response?.token) sessionStorage.setItem('authToken', response.token)
        showToast('Celebrity logged in successfully!', 'success')
        navigate('/celebrityDashboard')
      } else if (flag === 'admin') {
        response = await adminLogin(formData.emailOrPhone, formData.password)
        const adminUser = response?.user || response
        const adminProfile = {
          id: adminUser?.username || 'admin',
          name: adminUser?.username || 'admin',
          role: 'admin'
        }
        dispatch(setAdminLogin(adminProfile))
        sessionStorage.setItem('isAdminLoggedIn', 'true')
        sessionStorage.setItem('adminProfile', JSON.stringify(adminProfile))
        if (response?.token) sessionStorage.setItem('authToken', response.token)
        showToast('Admin logged in successfully!', 'success')
        navigate('/admin-dashboard')
      } else {
        response = await userLogin(formData.emailOrPhone, formData.password)
        const u = response?.user || {}
        const userProfile = {
          id: u.userId || response?.userId || u.email || '',
          name: u.name,
          email: u.email,
          role: u.role || 'user'
        }
        dispatch(setUserProfile(userProfile))
        sessionStorage.setItem('isLoggedIn', 'true')
        sessionStorage.setItem('userProfile', JSON.stringify(userProfile))
        if (response?.token) sessionStorage.setItem('authToken', response.token)
        showToast('User logged in successfully!', 'success')
        navigate(celebrity ? '/celebrity/form' : '/')
      }
    } catch (error) {
      showToast(error.message || 'Something went wrong. Please try again later.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        padding: '20px'
      }}
    >

      <Card
        sx={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#1c1c1c',
          color: '#fff',
          borderRadius: '20px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
        }}
      >
        <CardContent
          sx={{
            padding: '30px'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              mb: '20px',
              textAlign: 'center',
              color: '#f0a500'
            }}
          >
            {flag === 'celebrity' ? 'Celebrity Login' : flag === 'admin' ? 'Admin Login' : 'Login to Your Account'}
          </Typography>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            <TextField
              label="Email Address or Mobile Number"
              name="emailOrPhone"
              type="text"
              value={formData.emailOrPhone}
              onChange={handleInputChange}
              required
              fullWidth
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#f0a500' },
                  '&.Mui-focused fieldset': { borderColor: '#f0a500' }
                },
                label: { color: '#aaa' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f0a500' }
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
              sx={{
                input: { color: '#fff' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#f0a500' },
                  '&.Mui-focused fieldset': { borderColor: '#f0a500' }
                },
                label: { color: '#aaa' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#f0a500' }
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
                '&:disabled': { backgroundColor: '#555', color: '#aaa' }
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {flag !== 'admin' && (
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                mt: '15px',
                color: '#ccc'
              }}
            >
              Don’t have an account?{' '}
              <Link
                href={flag === 'celebrity' ? '/celebrity-register' : '/register'}
                sx={{
                  color: '#f0a500',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  '&:hover': { color: '#e88b00' }
                }}
              >
                {flag === 'celebrity' ? 'Register as Celebrity' : 'Register here'}
              </Link>
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginForm