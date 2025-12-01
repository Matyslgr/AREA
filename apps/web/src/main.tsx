// Redirect localhost to 127.0.0.1
if (window.location.hostname === 'localhost') {
  window.location.href = window.location.href.replace('localhost', '127.0.0.1');
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
