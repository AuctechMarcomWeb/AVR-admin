/* eslint-disable prettier/prettier */
import React, { useEffect, useContext, useState } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { AppContext } from '../Context/AppContext'
import { authService } from '../services/auth.service'
import { CSpinner } from '@coreui/react'

const DefaultLayout = () => {
  const navigate = useNavigate()
  const { user, setUser } = useContext(AppContext)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const token = Cookies.get('AVR')
    if (!token) {
      navigate('/login')
      return
    }

    // If user already in context (from localStorage after login), skip refetch
    if (user) {
      setAuthChecked(true)
      return
    }

    authService.getProfile()
      .then((res) => {
        const raw = res.data?.data
        const userData = raw?.user || raw?.profile || raw || null
        if (userData && typeof userData === 'object') {
          setUser(userData)
        }
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          Cookies.remove('AVR')
          setUser(null)
          navigate('/login')
        }
      })
      .finally(() => {
        setAuthChecked(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100" style={{ position: 'relative', zIndex: 1 }}>
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
