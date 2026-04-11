import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userReducer';
import adminReducer from './reducers/adminReducer';
import celebrityReducer from './reducers/celebrityReducer';
import wishlistReducer from './reducers/wishlistReducer';
import bookingsReducer from './reducers/bookingReducer';

const store = configureStore({
  reducer: {
    user: userReducer,
    admin: adminReducer,
    celebrity: celebrityReducer,
    wishlist: wishlistReducer,
    bookings: bookingsReducer,
  },
});

export default store;
