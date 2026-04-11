import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userProfile: {},
  bookings: []
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload || {}
    },
    setBookings: (state, action) => {
      state.bookings = action.payload || []
    },
    updateBookingStatus: (state, action) => {
      const { bookingId, status } = action.payload || {}
      state.bookings = state.bookings.map(b =>
        (b._id === bookingId || b.id === bookingId) ? { ...b, status } : b
      )
    }
  }
})

export const {
  setUserProfile,
  setBookings,
  updateBookingStatus
} = userSlice.actions

export default userSlice.reducer
