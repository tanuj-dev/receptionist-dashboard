import { useState } from 'react'
import { getToken, getRole, clearSession } from './api'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './index.css'

export default function App() {
  const [token, setToken] = useState(getToken())
  const [role,  setRole]  = useState(getRole())

  function handleLogin(data) {
    setToken(data.token)
    setRole(data.role)
  }

  function handleLogout() {
    clearSession()
    setToken(null)
    setRole(null)
  }

  if (!token) return <Login onLogin={handleLogin} />
  return <Dashboard role={role} onLogout={handleLogout} />
}
