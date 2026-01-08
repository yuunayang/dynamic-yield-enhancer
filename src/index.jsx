import React from 'react'
import ReactDOM from 'react-dom/client'
import DynamicYieldEnhancer from '../main.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DynamicYieldEnhancer />
  </React.StrictMode>,
)

