import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/UserManagement.css'

export default function ManagerManagement() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
  })

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/admin/dashboard')
    }
    fetchManagers()
  }, [])

  const fetchManagers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setManagers(response.data.users.filter(u => u.role === 'contest_manager'))
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des managers')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await axios.post('http://localhost:8000/api/admin/users', 
        { ...formData, role: 'contest_manager' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuccess('Manager créé avec succès!')
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        organization: '',
      })
      setShowForm(false)
      fetchManagers()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleToggleStatus = async (managerId) => {
    try {
      await axios.put(`http://localhost:8000/api/admin/users/${managerId}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('Statut mis à jour!')
      fetchManagers()
    } catch (err) {
      setError('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (managerId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce manager?')) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/users/${managerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Manager supprimé!')
        fetchManagers()
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression')
      }
    }
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <div>
          <h1>🎯 Gestion des Managers</h1>
          <p>Créez et gérez les managers de concours</p>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
          Retour
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Managers ({managers.length})</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Annuler' : '+ Créer un Manager'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mot de passe *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Organisation</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Créer le Manager
            </button>
          </form>
        )}

        <div className="users-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Organisation</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.email}</td>
                  <td>{m.organization || '-'}</td>
                  <td>{m.phone || '-'}</td>
                  <td>
                    <span className={`status-badge ${m.is_active ? 'active' : 'inactive'}`}>
                      {m.is_active ? '✓ Actif' : '✗ Inactif'}
                    </span>
                  </td>
                  <td>{new Date(m.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <button
                      className="btn btn-small"
                      onClick={() => handleToggleStatus(m.id)}
                    >
                      {m.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(m.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
