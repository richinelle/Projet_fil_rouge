import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function DepositCenterManagement() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [depositCenters, setDepositCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    contact_email: '',
    contact_phone: '',
  })

  useEffect(() => {
    if (user.role !== 'contest_manager' && user.role !== 'admin') {
      navigate('/manager/dashboard')
    }
    fetchDepositCenters()
  }, [])

  const fetchDepositCenters = async () => {
    try {
      setLoading(true)
      const response = await client.get('/manager/deposit-centers')
      setDepositCenters(response.data.deposit_centers || [])
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des centres de dépôt:', err.response?.data || err.message)
      setError('Erreur lors du chargement des centres de dépôt')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        await client.put(`/manager/deposit-centers/${editingId}`, formData)
        setSuccess('Centre de dépôt modifié avec succès!')
      } else {
        await client.post('/manager/deposit-centers', formData)
        setSuccess('Centre de dépôt créé avec succès!')
      }
      setFormData({
        name: '',
        address: '',
        city: '',
        country: '',
        contact_email: '',
        contact_phone: '',
      })
      setEditingId(null)
      setShowForm(false)
      setTimeout(() => setSuccess(''), 3000)
      fetchDepositCenters()
    } catch (err) {
      console.error('Erreur lors de l\'opération:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'Erreur lors de l\'opération')
    }
  }

  const handleEdit = (center) => {
    setFormData(center)
    setEditingId(center.id)
    setShowForm(true)
  }

  const handleDelete = async (centerId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce centre de dépôt?')) {
      try {
        await client.delete(`/manager/deposit-centers/${centerId}`)
        setSuccess('Centre de dépôt supprimé!')
        fetchDepositCenters()
      } catch (err) {
        console.error('Erreur lors de la suppression:', err.response?.data || err.message)
        setError('Erreur lors de la suppression')
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      contact_email: '',
      contact_phone: '',
    })
  }

  const getFilteredDepositCenters = () => {
    return depositCenters.filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.country.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <h1>Gestion des Centres de Dépôt</h1>
        <p>Gérez tous vos centres de dépôt des dossiers</p>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Centres de Dépôt</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Annuler' : '+ Créer un centre'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nom du centre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ville *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pays *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Adresse *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email de contact</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Téléphone de contact</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Modifier' : 'Créer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Rechercher par nom, ville ou pays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          {searchQuery && (
            <button
              className="filter-reset-btn"
              onClick={() => setSearchQuery('')}
            >
              ↻ Réinitialiser
            </button>
          )}
        </div>

        <div className="centers-list">
          {getFilteredDepositCenters().length === 0 ? (
            <p className="no-results">Aucun centre de dépôt trouvé</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Ville</th>
                  <th>Pays</th>
                  <th>Adresse</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredDepositCenters().map((center) => (
                  <tr key={center.id}>
                    <td>{center.name}</td>
                    <td>{center.city}</td>
                    <td>{center.country}</td>
                    <td>{center.address}</td>
                    <td>{center.contact_email}</td>
                    <td>{center.contact_phone}</td>
                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() => handleEdit(center)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(center.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
