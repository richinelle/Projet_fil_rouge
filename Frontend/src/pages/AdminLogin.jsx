import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/Auth.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:8000/api/admin/login', formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('userRole', response.data.user.role)
      
      if (response.data.user.role === 'contest_manager') {
        navigate('/manager/dashboard')
      } else if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Connexion Admin/Manager</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Entrez votre mot de passe"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>Identifiants de test:</p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            <strong>Admin:</strong> admin@example.com / admin123<br/>
            <strong>Manager:</strong> manager@example.com / manager123
          </p>
        </div>

        <p className="auth-link">
          <Link to="/">Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  )
}
