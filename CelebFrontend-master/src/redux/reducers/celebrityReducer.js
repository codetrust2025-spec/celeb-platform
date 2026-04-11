import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  celebrities: [],
  loading: false,
  error: null,
  loggedIn: false,
  profile: null
}

const celebritySlice = createSlice({
  name: 'celebrity',
  initialState,
  reducers: {
    setCelebrities: (state, action) => {
      state.celebrities = action.payload || []
      state.loading = false
      state.error = null
    },
    setLoading: state => {
      state.loading = true
      state.error = null
    },
    setError: (state, action) => {
      state.error = action.payload || 'Something went wrong'
      state.loading = false
    },
    addCelebrity: (state, action) => {
      state.celebrities.push(action.payload)
    },
    removeCelebrity: (state, action) => {
      const id = action.payload?.id || action.payload
      state.celebrities = state.celebrities.filter(c => c._id !== id && c.id !== id)
    },
    setCelebrityLogin: (state, action) => {
      state.loggedIn = true
      state.profile = action.payload
    },
    celebrityLogout: state => {
      state.loggedIn = false
      state.profile = null
    }
  }
})

export const {
  setCelebrities,
  setLoading,
  setError,
  addCelebrity,
  removeCelebrity,
  setCelebrityLogin,
  celebrityLogout
} = celebritySlice.actions

export default celebritySlice.reducer
