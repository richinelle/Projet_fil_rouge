import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const candidate = JSON.parse(localStorage.getItem('candidate') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('candidate')
    localStorage.removeItem('candidate_id')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎯 Plateforme de Candidature
        </Link>

        <div className="navbar-menu">
          {!token ? (
            <>
              <Link to="/register" className="nav-link">
                S'inscrire
              </Link>
              <Link to="/login" className="nav-link">
                Connexion Candidat
              </Link>
              <Link to="/admin-login" className="nav-link nav-link-admin">
                Admin/Manager
              </Link>
            </>
          ) : userRole === 'candidate' ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Tableau de Bord
              </Link>
              <Link to="/contests" className="nav-link">
                Concours
              </Link>
              <Link to="/payment" className="nav-link">
                Paiements
              </Link>
              <span className="nav-user">
                {candidate.first_name}
              </span>
              <button onClick={handleLogout} className="nav-logout">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              {userRole === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link">
                  Admin
                </Link>
              )}
              {userRole === 'contest_manager' && (
                <Link to="/manager/dashboard" className="nav-link">
                  Manager
                </Link>
              )}
              <span className="nav-user">
                {user.name}
              </span>
              <button onClick={handleLogout} className="nav-logout">
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
