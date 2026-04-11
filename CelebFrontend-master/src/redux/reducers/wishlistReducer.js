import { createSlice } from '@reduxjs/toolkit'

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { wishlist: [], loading: false, error: null },
  reducers: {
    setWishlistLoading: state => { state.loading = true },
    setWishlistError: (state, action) => { state.error = action.payload; state.loading = false },
    setWishlist: (state, action) => { state.wishlist = action.payload || []; state.loading = false },
    addToWishlist: (state, action) => { state.wishlist.push(action.payload) },
    removeFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter(c => c._id !== action.payload)
    }
  }
})

export const { setWishlistLoading, setWishlistError, setWishlist, addToWishlist, removeFromWishlist } = wishlistSlice.actions
export default wishlistSlice.reducer
