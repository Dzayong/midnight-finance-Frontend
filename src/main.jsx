import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios' // <-- 1. Import axios di sini

// 2. TAMBAHKAN KODE SAKTI INI:
// Ini memaksa Laravel mengembalikan error JSON, bukan melempar ke halaman GET /login
axios.defaults.headers.common['Accept'] = 'application/json';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)