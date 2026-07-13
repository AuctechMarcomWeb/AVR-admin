import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App'
import store from './store'

import { AppProvider } from './Context/AppContext'
import { RolesProvider } from './Context/AuthContext'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AppProvider>
      <RolesProvider>
        <App />
      </RolesProvider>
    </AppProvider>
  </Provider>,
)
