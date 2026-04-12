import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

axios.defaults.baseURL = API_URL
axios.defaults.headers.post['Content-Type'] = 'application/json'

// Attach JWT token to every request if available
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem('authToken')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

export const getCelebrities = async () => {
  try {
    const response = await axios.get('/celebrities')
    return response.data
  } catch (error) {
    console.error('Error fetching celebrities:', error)
    return []
  }
}

export const getCelebrityById = async (id) => {
  try {
    const response = await axios.get(`/celebrities/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching celebrity:', error)
    return null
  }
}

export const createBooking = async bookingData => {
  try {
    const response = await axios.post('/bookings', bookingData)
    return response.data
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

export const getBookings = async () => {
  try {
    const response = await axios.get('/bookings')
    // Backend returns { bookings, total, page, pages } — extract array
    if (Array.isArray(response.data)) return response.data
    return response.data.bookings || []
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
}

export const updateBooking = async (bookingId, updatedData) => {
  try {
    const response = await axios.put(`/bookings/${bookingId}`, updatedData)
    return response.data
  } catch (error) {
    console.error('Error updating booking:', error)
    throw error
  }
}

// adminGetBookings is an alias for getBookings — same endpoint, role-filtered server-side
export { getBookings as adminGetBookings }

export const deleteCelebrity = async celebrityId => {
  try {
    const response = await axios.delete(`/celebrities/${celebrityId}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting celebrity with ID ${celebrityId}:`, error)
    throw error
  }
}

export const addCelebrity = async celebrityData => {
  try {
    const response = await axios.post('/celebrities', celebrityData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (error) {
    const msg = error?.response?.data?.message || error.message || 'Failed to add celebrity'
    console.error('Error adding celebrity:', msg)
    const err = new Error(msg)
    err.response = error.response
    throw err
  }
}

export const updateCelebrity = async (celebrityId, celebrityData) => {
  try {
    const response = await axios.put(`/celebrities/${celebrityId}`, celebrityData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (error) {
    const msg = error?.response?.data?.message || error.message || 'Failed to update celebrity'
    console.error(`Error updating celebrity with ID ${celebrityId}:`, msg)
    const err = new Error(msg)
    err.response = error.response
    throw err
  }
}

export const cancelBooking = async bookingId => {
  try {
    const response = await axios.patch(`/bookings/${bookingId}/cancel`)
    return response.data
  } catch (error) {
    console.error(`Error canceling booking with ID ${bookingId}:`, error)
    throw error
  }
}

export const confirmBooking = async bookingId => {
  try {
    const response = await axios.patch(`/bookings/${bookingId}/confirm`)
    return response.data
  } catch (error) {
    console.error(`Error confirming booking with ID ${bookingId}:`, error)
    throw error
  }
}

export const deleteBooking = async bookingId => {
  try {
    const response = await axios.delete(`/bookings/${bookingId}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting booking with ID ${bookingId}:`, error)
    throw error
  }
}

export const getWishlist = async () => {
  try {
    const response = await axios.get('/wishlist')
    return response.data
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    throw error
  }
}

export const addToWishlist = async celebrityId => {
  try {
    const response = await axios.post(`/wishlist/${celebrityId}`)
    return response.data
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    throw error
  }
}

export const removeFromWishlist = async celebrityId => {
  try {
    const response = await axios.delete(`/wishlist/${celebrityId}`)
    return response.data
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    throw error
  }
}

export const adminLogin = async (username, password) => {
  try {
    const response = await axios.post('/adminlogin', { username, password })
    return response.data
  } catch (err) {
    const msg = err?.response?.data?.message || 'Invalid credentials or unauthorized access'
    throw new Error(msg)
  }
}

const resolveEmailPhonePayload = emailOrPhone => {
  if (!emailOrPhone) return {}
  const trimmed = String(emailOrPhone).trim()
  if (/^\d{10}$/.test(trimmed)) return { phone: trimmed }
  return { email: trimmed }
}

export const userLogin = async (emailOrPhone, password) => {
  try {
    const resolved = resolveEmailPhonePayload(emailOrPhone)
    const payload = { password, ...resolved, emailOrPhone }
    const response = await axios.post('/userlogin', payload)
    return response.data
  } catch (error) {
    const msg = error?.response?.data?.message || 'Invalid credentials or unauthorized access'
    console.error('Error during user login:', msg)
    throw new Error(msg)
  }
}

export const userRegister = async (name, password, emailOrPhone, username, userId) => {
  try {
    const payload = { name, password }
    if (username) payload.username = username
    if (userId) payload.userId = userId
    if (emailOrPhone) {
      Object.assign(payload, resolveEmailPhonePayload(emailOrPhone))
      payload.emailOrPhone = String(emailOrPhone).trim()
    }
    const response = await axios.post('/userregister', payload)
    if (response.status === 201) return response.data
    throw new Error(response.data?.message || 'Registration failed')
  } catch (error) {
    console.error('Error during user registration:', error)
    const msg = error?.response?.data?.message || error.message || 'Registration failed. Please try again'
    throw new Error(msg)
  }
}

export const celebrityRegister = async (name, password, emailOrPhone, username) => {
  try {
    const payload = { name, password }
    if (username) payload.username = username
    if (emailOrPhone) {
      Object.assign(payload, resolveEmailPhonePayload(emailOrPhone))
      payload.emailOrPhone = String(emailOrPhone).trim()
    }
    const response = await axios.post('/celebrityregister', payload)
    if (response.status === 201) return response.data
    throw new Error(response.data?.message || 'Registration failed')
  } catch (error) {
    console.error('Error during celebrity registration:', error)
    const msg = error?.response?.data?.message || error.message || 'Registration failed. Please try again'
    throw new Error(msg)
  }
}

export const celebrityLogin = async (emailOrPhone, password) => {
  try {
    const payload = { password, ...resolveEmailPhonePayload(emailOrPhone), emailOrPhone }
    const response = await axios.post('/celebritylogin', payload)
    return response.data
  } catch (error) {
    const msg = error?.response?.data?.message || 'Invalid credentials or unauthorized access'
    console.error('Error during celebrity login:', msg)
    throw new Error(msg)
  }
}

export const getCelebrityProfile = async () => {
  try {
    const response = await axios.get('/celebrity/profile')
    return response.data
  } catch (error) {
    console.error('Error fetching celebrity profile:', error)
    throw error
  }
}

export const getAvailability = async () => {
  try {
    const response = await axios.get('/celebrity/availability')
    return response.data
  } catch (error) {
    console.error('Error fetching availability:', error)
    throw error
  }
}

export const updateAvailability = async date => {
  try {
    const response = await axios.post('/celebrity/availability', { date })
    return response.data
  } catch (error) {
    console.error('Error updating availability:', error)
    throw error
  }
}

export const removeAvailability = async date => {
  try {
    const response = await axios.delete('/celebrity/availability', { data: { date } })
    return response.data
  } catch (error) {
    console.error('Error removing availability:', error)
    throw error
  }
}

export const updateCelebrityProfile = async (profileData) => {
  try {
    const response = await axios.put('/celebrity/profile', profileData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (error) {
    const msg = error?.response?.data?.message || error.message || 'Failed to update profile'
    console.error('Error updating celebrity profile:', msg)
    throw new Error(msg)
  }
}