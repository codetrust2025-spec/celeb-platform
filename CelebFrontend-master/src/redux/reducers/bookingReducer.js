// src/redux/bookingsSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  isLoading: false,
  error: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    fetchBookingsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBookingsSuccess: (state, action) => {
      state.isLoading = false;
      state.bookings = action.payload;
    },
    fetchBookingsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchBookingsStart,
  fetchBookingsSuccess,
  fetchBookingsFailure,
} = bookingsSlice.actions;

export const selectBookings = (state) => state.bookings;

export default bookingsSlice.reducer;
