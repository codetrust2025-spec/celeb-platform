import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastContainer } from 'react-toastify'
import BookingForm from './pages/BookingForm'
import Header from './components/Header'
import './App.css'
import CelebrityProfile from './pages/CelebrityProfile'
import AdminDashboard from './pages/AdminDashboard'
import AdminCelebrityList from './pages/AdminCelebrityList'
import AddCelebrity from './pages/AddCelebrity'
import Footer from './components/Footer'
import RegisterForm from './auth/RegisterForm'
import LoginForm from './auth/LoginForm'
import AboutUs from './pages/AboutUs'
import Home from './pages/Home'
import CelebrityDashboard from './pages/CelebrityDashboard'
import CelebrityPortfolio from './pages/CelebrityPortfolio'
import CelebritySettings from './pages/CelebritySettings'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'
import 'react-toastify/dist/ReactToastify.css'
import RegisterAndLoginPrompt from './auth/RegisterAndLoginPrompt'

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <div className='app-container'>
          <Header />
          <div className='main-content'>
            <Routes>
              {/* Public routes */}
              <Route path='/' element={<Home />} />
              <Route path='/celebrity/:id' element={<CelebrityProfile />} />
              <Route path='/aboutUs' element={<AboutUs />} />
              <Route path='/register-login-prompt' element={<RegisterAndLoginPrompt />} />
              <Route path='/register' element={<RegisterForm />} />
              <Route path='/celebrity-register' element={<RegisterForm flag='celebrity' />} />
              <Route path='/userLogin' element={<LoginForm />} />
              <Route path='/celebrityLogin' element={<LoginForm flag='celebrity' />} />
              <Route path='/adminLogin' element={<LoginForm flag='admin' />} />

              {/* User protected routes */}
              <Route path='/celebrity/form' element={
                <ProtectedRoute><BookingForm /></ProtectedRoute>
              } />

              {/* Admin protected routes */}
              <Route path='/admin-dashboard' element={
                <ProtectedRoute role='admin'><AdminDashboard /></ProtectedRoute>
              } />
              <Route path='/admin-dashboard-celebrities' element={
                <ProtectedRoute role='admin'><AdminCelebrityList /></ProtectedRoute>
              } />
              <Route path='/add-celebrity' element={
                <ProtectedRoute role='admin'><AddCelebrity /></ProtectedRoute>
              } />
              {/* Celebrity protected routes */}
              <Route path='/celebrityDashboard' element={
                <ProtectedRoute role='celebrity'><CelebrityDashboard /></ProtectedRoute>
              } />
              <Route path='/celebrity-portfolio' element={
                <ProtectedRoute role='celebrity'><CelebrityPortfolio /></ProtectedRoute>
              } />
              <Route path='/celebrity-settings' element={
                <ProtectedRoute role='celebrity'><CelebritySettings /></ProtectedRoute>
              } />

              {/* 404 catch-all */}
              <Route path='*' element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
        <ToastContainer />
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
