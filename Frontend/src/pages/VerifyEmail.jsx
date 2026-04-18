import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../api/auth'
import '../styles/Auth.css'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const candidateId = location.state?.candidateId || localStorage.getItem('candidate_id')
  
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await authAPI.verifyEmail({
        candidate_id: candidateId,
        code: code,
      })
      setSuccess('Email vérifié avec succès! Vous pouvez maintenant vous connecter.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Vérifier votre email</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Entrez le code de vérification envoyé à votre email
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Code de vérification</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Entrez le code"
              required
              maxLength="6"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Vérification en cours...' : 'Vérifier'}
          </button>
        </form>
      </div>
    </div>
  )
}
