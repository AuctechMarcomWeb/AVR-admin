import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './Context/AppContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AppContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If roles not specified or user role not in list, redirect to dashboard (not 404)
  if (allowedRoles && allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
