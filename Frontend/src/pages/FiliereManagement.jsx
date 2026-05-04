import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function FiliereManagement() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [filieres, setFilieres] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '', code: '', department_id: '', description: '',
  })

  useEffect(() => {
    if (user.role !== 'contest_manager' && user.role !== 'admin') {
      navigate('/manager/dashboard')
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [filieresRes, deptsRes] = await Promise.all([
        client.get('/manager/filieres'),
        client.get('/manager/departments'),
      ])
      setFilieres(filieresRes.data.filieres)
      setDepartments(deptsRes.data.departments)
      setLoading(false)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors du chargement des données')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (editingId) {
        await client.put(`/manager/filieres/${editingId}`, formData)
        setSuccess('Filière mise à jour avec succès!')
      } else {
        await client.post('/manager/filieres', formData)
        setSuccess('Filière créée avec succès!')
      }
      setFormData({ name: '', code: '', department_id: '', description: '' })
      setShowForm(false)
      setEditingId(null)
      setTimeout(() => setSuccess(''), 3000)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'opération')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleEdit = (filiere) => {
    setFormData({
      name: filiere.name, code: filiere.code,
      department_id: filiere.department_id, description: filiere.description || '',
    })
    setEditingId(filiere.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette filière?')) {
      try {
        await client.delete(`/manager/filieres/${id}`)
        setSuccess('Filière supprimée!')
        setTimeout(() => setSuccess(''), 3000)
        fetchData()
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression')
        setTimeout(() => setError(''), 5000)
      }
    }
  }

  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId)
    return dept ? dept.name : 'N/A'
  }

  const getFilteredFilieres = () => {
    return filieres.filter(filiere => {
      const matchesSearch = filiere.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filiere.code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = departmentFilter === 'all' || filiere.department_id === parseInt(departmentFilter)
      return matchesSearch && matchesDept
    })
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <div>
          <h1>Gestion des Filières</h1>
          <p>Gérez toutes les filières de l'établissement</p>
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
          <h2>Filières ({getFilteredFilieres().length})</h2>
          <div className="header-buttons">
            <button className="btn btn-primary btn-two-thirds" onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: '', code: '', department_id: '', description: '' })
            }}>
              {showForm ? 'Annuler' : '+ Nouvelle'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nom de la Filière *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Code *</label>
                <input type="text" value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Département *</label>
                <select value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })} required>
                  <option value="">Sélectionner un département</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Mettre à jour' : 'Créer la Filière'}
            </button>
          </form>
        )}

        <div className="filters-section">
          <div className="filter-group">
            <input type="text" placeholder="🔍 Rechercher par nom ou code..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="filter-input" />
          </div>
          <div className="filters-row">
            <div className="filter-group">
              <label>Département:</label>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="filter-select">
                <option value="all">Tous les départements</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            {(searchQuery || departmentFilter !== 'all') && (
              <button className="filter-reset-btn" onClick={() => { setSearchQuery(''); setDepartmentFilter('all') }}>
                ↻ Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="filieres-grid">
          {getFilteredFilieres().length === 0 ? (
            <p className="no-results">Aucune filière trouvée</p>
          ) : (
            getFilteredFilieres().map((filiere) => (
              <div key={filiere.id} className="filiere-card">
                <div className="card-header">
                  <h3>{filiere.name}</h3>
                  <span className="code-badge">{filiere.code}</span>
                </div>
                <div className="card-info">
                  <p><strong>Département:</strong> {getDepartmentName(filiere.department_id)}</p>
                </div>
                {filiere.description && <p className="description">{filiere.description}</p>}
                <div className="card-footer">
                  <button className="btn btn-small" onClick={() => handleEdit(filiere)}>Modifier</button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(filiere.id)}>Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
