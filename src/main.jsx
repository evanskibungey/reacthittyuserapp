import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Preload critical assets will be added later
// import preloadCriticalAssets from './utils/preloadAssets'

// preloadCriticalAssets().then(() => {
//   console.log('Application ready with preloaded assets')
// })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
