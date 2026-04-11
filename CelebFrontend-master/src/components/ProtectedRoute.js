import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation()

  if (role === 'admin') {
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true'
    if (!isAdmin) return <Navigate to="/adminLogin" state={{ from: location }} replace />
  } else if (role === 'celebrity') {
    const isCelebrity = sessionStorage.getItem('isCelebrityLoggedIn') === 'true'
    if (!isCelebrity) return <Navigate to="/celebrityLogin" state={{ from: location }} replace />
  } else {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true'
    if (!isLoggedIn) return <Navigate to="/userLogin" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
