/* eslint-disable prettier/prettier */
import { CNavItem } from '@coreui/react'
import {
  DashboardOutlined,
  PictureOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  MessageOutlined,
  CalendarOutlined,
  StarOutlined,
  BgColorsOutlined,
} from '@ant-design/icons'

const iconStyle = { fontSize: '18px' }
const iconClass = 'me-3'

const nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <DashboardOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  },
  {
    component: CNavItem,
    name: 'Home Slider',
    to: '/home-slider',
    icon: <BgColorsOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  },
  {
    component: CNavItem,
    name: 'Gallery',
    to: '/gallery',
    icon: <PictureOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  },
  {
    component: CNavItem,
    name: 'Blogs',
    to: '/blogs',
    icon: <FileTextOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  },
  {
    component: CNavItem,
    name: 'Portfolio',
    to: '/portfolio',
    icon: <AppstoreOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  },
  // {
  //   component: CNavItem,
  //   name: 'Testimonials',
  //   to: '/testimonials',
  //   icon: <StarOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  // },
  {
    component: CNavItem,
    name: 'Contact',
    to: '/contact',
    icon: <MessageOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  },
  {
    component: CNavItem,
    name: 'Book Consultation',
    to: '/book-consultation',
    icon: <CalendarOutlined className={iconClass} style={{ ...iconStyle, color: '#fff' }} />,
  },
]

const useNav = () => nav

export default useNav
