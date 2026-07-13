import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import ProtectedRoute from '../ProtectedRoute'

// routes config
import routes from '../routes'

const AppContent = () => {
  return (
    <>
      <div style={{ backgroundColor: '#F7F7F7', padding: 'clamp(8px, 2vw, 16px)', minHeight: 'calc(100vh - 56px)' }}>
        <Suspense fallback={<CSpinner color="primary" />}>
          <Routes>
            {routes.map((route, idx) => {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={
                      <ProtectedRoute allowedRoles={route.roles}>
                        <route.element />
                      </ProtectedRoute>
                    }
                  />
                )
              )
            })}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
    </>
  )
}

export default React.memo(AppContent)
