/* eslint-disable prettier/prettier */
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CSidebar, CSidebarBrand, CSidebarHeader } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import logo from '../assets/arv-logo-icon.png'
import useNav from '../_nav'

const AppSidebar = () => {
  const navigation = useNav()
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <>
      {/* Overlay backdrop on mobile */}
      {sidebarShow && (
        <div
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
          style={{
            display: 'none',
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 2,
          }}
          className="sidebar-backdrop-custom"
        />
      )}

      <CSidebar
        style={{ zIndex: 3 }}
        className="border-end"
        colorScheme="dark"
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(v) => dispatch({ type: 'set', sidebarShow: v })}
      >
        <CSidebarHeader style={{ backgroundColor: '#ffffff', padding: 0, borderBottom: '1px solid #e0e0e0' }}>
          <CSidebarBrand
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px 10px',
              minHeight: '70px',
              backgroundColor: '#ffffff',
              width: '100%',
            }}
            to="/"
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                maxWidth: '75%',
                maxHeight: '64px',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </CSidebarBrand>
        </CSidebarHeader>
        <AppSidebarNav items={navigation} />
      </CSidebar>
    </>
  )
}

export default React.memo(AppSidebar)
