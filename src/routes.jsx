/* eslint-disable prettier/prettier */
import AVRDashboard      from './views/avr/Dashboard'
import HomeSlider        from './views/avr/HomeSlider'
import AVRGallery        from './views/avr/AVRGallery'
import Blog              from './views/avr/Blog'
import Portfolio         from './views/avr/Portfolio'
import Testimonials      from './views/avr/Testimonials'
import Contact           from './views/avr/Contact'
import BookConsultation  from './views/avr/BookConsultation'

const ADMIN_ROLES = ['Admin', 'SuperAdmin']
const ALL_ROLES   = ['User', 'Admin', 'SuperAdmin']

const routes = [
  { path: '/dashboard',          element: AVRDashboard,     roles: ADMIN_ROLES },
  { path: '/home-slider',        element: HomeSlider,       roles: ADMIN_ROLES },
  { path: '/gallery',            element: AVRGallery,       roles: ALL_ROLES   },
  { path: '/blogs',              element: Blog,             roles: ALL_ROLES   },
  { path: '/portfolio',          element: Portfolio,        roles: ALL_ROLES   },
  { path: '/testimonials',       element: Testimonials,     roles: ADMIN_ROLES },
  { path: '/contact',            element: Contact,          roles: ADMIN_ROLES },
  { path: '/book-consultation',  element: BookConsultation, roles: ADMIN_ROLES },
]

export default routes
