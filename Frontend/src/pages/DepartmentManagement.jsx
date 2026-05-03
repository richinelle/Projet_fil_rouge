import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/UserManagement.css'

export default function DepartmentManagement() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  })

  useEffect(() => {
    if (user.role !== 'contest_manager' && user.role !== 'admin') {
      navigate('/manager/dashboard')
    }
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/api/manager/departments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDepartments(response.data.departments)
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des départements')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        await axios.put(`http://localhost:8000/api/manager/departments/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Département mis à jour avec succès!')
      } else {
        await axios.post('http://localhost:8000/api/manager/departments', formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Département créé avec succès!')
      }
      setFormData({
        name: '',
        code: '',
        description: '',
      })
      setShowForm(false)
      setEditingId(null)
      setTimeout(() => setSuccess(''), 3000)
      fetchDepartments()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'opération')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleEdit = (dept) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
    })
    setEditingId(dept.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département?')) {
      try {
        await axios.delete(`http://localhost:8000/api/manager/departments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Département supprimé!')
        setTimeout(() => setSuccess(''), 3000)
        fetchDepartments()
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression')
        setTimeout(() => setError(''), 5000)
      }
    }
  }

  const getFilteredDepartments = () => {
    return departments.filter(dept => {
      const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <div>
          <h1>Gestion des Départements</h1>
          <p>Gérez tous les départements de l'établissement</p>
        </div>
        <div className="header-buttons">
          <button onClick={() => navigate('/manager/dashboard')} className="btn btn-secondary btn-two-thirds">
            ← Retour
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Départements ({getFilteredDepartments().length})</h2>
          <div className="header-buttons">
            <button
              className="btn btn-primary btn-two-thirds"
              onClick={() => {
                setShowForm(!showForm)
                setEditingId(null)
                setFormData({
                  name: '',
                  code: '',
                  description: '',
                })
              }}
            >
              {showForm ? 'Annuler' : '+ Nouveau'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nom du Département *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              {editingId ? 'Mettre à jour' : 'Créer le Département'}
            </button>
          </form>
        )}

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Rechercher par nom ou code..."
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

        <div className="departments-grid">
          {getFilteredDepartments().length === 0 ? (
            <p className="no-results">Aucun département trouvé</p>
          ) : (
            getFilteredDepartments().map((dept) => (
              <div key={dept.id} className="department-card">
                <div className="card-header">
                  <h3>{dept.name}</h3>
                  <span className="code-badge">{dept.code}</span>
                </div>
                {dept.description && <p className="description">{dept.description}</p>}
                <div className="card-footer">
                  <button
                    className="btn btn-small"
                    onClick={() => handleEdit(dept)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDelete(dept.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
