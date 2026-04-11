import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loggedIn: false,
  adminDetails: {},
  celebrityProfiles: [],
  bookingRequests: []
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminLogin: (state, action) => {
      state.loggedIn = true
      state.adminDetails = action.payload
    },
    setCelebrityProfiles: (state, action) => {
      state.celebrityProfiles = action.payload || []
    },
    setBookingRequests: (state, action) => {
      state.bookingRequests = action.payload || []
    },
    approveBooking: (state, action) => {
      const id = action.payload?.bookingId
      state.bookingRequests = state.bookingRequests.map(b =>
        (b._id === id || b.id === id) ? { ...b, status: 'confirmed' } : b
      )
    },
    rejectBooking: (state, action) => {
      const id = action.payload?.bookingId
      state.bookingRequests = state.bookingRequests.map(b =>
        (b._id === id || b.id === id) ? { ...b, status: 'cancelled' } : b
      )
    }
  }
})

export const {
  setAdminLogin,
  setCelebrityProfiles,
  setBookingRequests,
  approveBooking,
  rejectBooking
} = adminSlice.actions

export default adminSlice.reducer
