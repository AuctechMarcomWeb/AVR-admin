/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CContainer, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'
import { AppContext } from '../Context/AppContext'

const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { user } = useContext(AppContext)

  const role = user?.role || 'Admin'
  const name = user?.name || user?.user?.name || 'Guest'

  return (
    <CHeader
      position="sticky"
      className="p-0"
      style={{ backgroundColor: '#042954', borderBottom: '1px solid #021933' }}
    >
      <CContainer fluid className="px-3 d-flex align-items-center justify-content-between" style={{ height: '56px' }}>

        {/* LEFT — hamburger */}
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ color: 'white', marginInlineStart: '-8px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

      

        {/* RIGHT — role badge + user info */}
        <CHeaderNav className="d-flex align-items-center gap-3">
          

         

          {/* User dropdown */}
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
