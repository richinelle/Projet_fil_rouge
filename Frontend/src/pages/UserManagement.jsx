import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/UserManagement.css'

export default function UserManagement() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [candidates, setCandidates] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'contest_manager',
    phone: '',
    organization: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('all')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showCandidateDetails, setShowCandidateDetails] = useState(false)

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/admin/dashboard')
    }
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      if (activeTab === 'users') {
        const response = await axios.get('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(response.data.users)
      } else if (activeTab === 'candidates') {
        const response = await axios.get('http://localhost:8000/api/admin/candidates', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setCandidates(response.data.candidates)
      } else if (activeTab === 'statistics') {
        const response = await axios.get('http://localhost:8000/api/admin/statistics/users', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStatistics(response.data)
      } else if (activeTab === 'activity') {
        const response = await axios.get('http://localhost:8000/api/admin/activity-log', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setActivities(response.data.activities)
      }
      
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des données')
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await axios.post('http://localhost:8000/api/admin/users', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('Utilisateur créé avec succès!')
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'contest_manager',
        phone: '',
        organization: '',
      })
      setShowCreateForm(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création')
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      await axios.put(`http://localhost:8000/api/admin/users/${userId}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess('Statut utilisateur mis à jour!')
      fetchData()
    } catch (err) {
      setError('Erreur lors de la mise à jour')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSuccess('Utilisateur supprimé!')
        fetchData()
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la suppression')
      }
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length < 2) {
      fetchData()
      return
    }

    try {
      const response = await axios.get(`http://localhost:8000/api/admin/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers(response.data.users)
      setCandidates(response.data.candidates)
    } catch (err) {
      console.error('Erreur de recherche:', err)
    }
  }

  const getFilteredUsers = () => {
    return users.filter(u => {
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
      const matchesStatus = userStatusFilter === 'all' ||
        (userStatusFilter === 'active' && u.is_active) ||
        (userStatusFilter === 'inactive' && !u.is_active)
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesRole && matchesStatus && matchesSearch
    })
  }

  const getFilteredCandidates = () => {
    return candidates.filter(c => {
      const matchesStatus = candidateStatusFilter === 'all' ||
        (candidateStatusFilter === 'verified' && c.email_verified) ||
        (candidateStatusFilter === 'unverified' && !c.email_verified)
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }

  const handleViewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate)
    setShowCandidateDetails(true)
  }

  const handleCloseCandidateDetails = () => {
    setShowCandidateDetails(false)
    setSelectedCandidate(null)
  }

  if (loading && !statistics) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <h1>Gestion des Utilisateurs</h1>
        <p>Gérez tous les utilisateurs du système</p>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Utilisateurs ({users.length})
        </button>
        <button
          className={`tab ${activeTab === 'candidates' ? 'active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          🎓 Candidats ({candidates.length})
        </button>
        <button
          className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Statistiques
        </button>
        <button
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📋 Activité
        </button>
      </div>

      <div className="management-content">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>Gestion des Utilisateurs (Admin/Manager)</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Annuler' : '+ Créer un utilisateur'}
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateUser} className="create-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
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
                    <label>Mot de passe</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rôle</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="contest_manager">Manager de Concours</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
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
                  Créer l'utilisateur
                </button>
              </form>
            )}

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="🔍 Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="filter-input"
                />
              </div>

              <div className="filters-row">
                <div className="filter-group">
                  <label>Rôle:</label>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Admin</option>
                    <option value="contest_manager">Manager de Concours</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Statut:</label>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>

                <button
                  className="filter-reset-btn"
                  onClick={() => {
                    setSearchQuery('')
                    setUserRoleFilter('all')
                    setUserStatusFilter('all')
                  }}
                >
                  ↻ Réinitialiser
                </button>
              </div>
            </div>

            <div className="users-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Créé le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUsers().map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role === 'admin' ? '👑 Admin' : '🎯 Manager'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                          {u.is_active ? '✓ Actif' : '✗ Inactif'}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button
                          className="btn btn-small"
                          onClick={() => handleToggleStatus(u.id)}
                        >
                          {u.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredUsers().length === 0 && (
                <div className="no-results">
                  <p>Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div className="candidates-section">
            <div className="section-header">
              <h2>Gestion des Candidats</h2>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="🔍 Rechercher un candidat..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="filter-input"
                />
              </div>

              <div className="filters-row">
                <div className="filter-group">
                  <label>Statut Email:</label>
                  <select
                    value={candidateStatusFilter}
                    onChange={(e) => setCandidateStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="verified">Vérifié</option>
                    <option value="unverified">En attente</option>
                  </select>
                </div>

                <button
                  className="filter-reset-btn"
                  onClick={() => {
                    setSearchQuery('')
                    setCandidateStatusFilter('all')
                  }}
                >
                  ↻ Réinitialiser
                </button>
              </div>
            </div>

            <div className="candidates-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Statut Email</th>
                    <th>Inscrit le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredCandidates().map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.phone || '-'}</td>
                      <td>
                        <span className={`status-badge ${c.email_verified ? 'verified' : 'unverified'}`}>
                          {c.email_verified ? '✓ Vérifié' : '⏳ En attente'}
                        </span>
                      </td>
                      <td>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <button 
                          className="btn btn-small"
                          onClick={() => handleViewCandidateDetails(c)}
                        >
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getFilteredCandidates().length === 0 && (
                <div className="no-results">
                  <p>Aucun candidat trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Details Modal */}
        {showCandidateDetails && selectedCandidate && (
          <div className="modal-overlay" onClick={handleCloseCandidateDetails}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Détails du Candidat</h2>
                <button className="modal-close" onClick={handleCloseCandidateDetails}>✕</button>
              </div>
              <div className="modal-body">
                <div className="detail-section">
                  <h3>Informations Personnelles</h3>
                  <div className="detail-row">
                    <span className="label">Nom:</span>
                    <span className="value">{selectedCandidate.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedCandidate.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Téléphone:</span>
                    <span className="value">{selectedCandidate.phone || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Statut Email:</span>
                    <span className={`status-badge ${selectedCandidate.email_verified ? 'verified' : 'unverified'}`}>
                      {selectedCandidate.email_verified ? '✓ Vérifié' : '⏳ En attente'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Inscrit le:</span>
                    <span className="value">{new Date(selectedCandidate.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseCandidateDetails}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && statistics && (
          <div className="statistics-section">
            <h2>Statistiques du Système</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>👑 Admins</h3>
                <p className="stat-number">{statistics.statistics.total_admins}</p>
              </div>
              <div className="stat-card">
                <h3>🎯 Managers</h3>
                <p className="stat-number">{statistics.statistics.total_managers}</p>
              </div>
              <div className="stat-card">
                <h3>🎓 Total Candidats</h3>
                <p className="stat-number">{statistics.statistics.total_candidates}</p>
              </div>
              <div className="stat-card">
                <h3>✓ Candidats Vérifiés</h3>
                <p className="stat-number">{statistics.statistics.verified_candidates}</p>
              </div>
              <div className="stat-card">
                <h3>⏳ En Attente</h3>
                <p className="stat-number">{statistics.statistics.unverified_candidates}</p>
              </div>
            </div>

            <div className="recent-section">
              <h3>Candidats Récents</h3>
              <div className="recent-list">
                {statistics.recent_candidates.map((c) => (
                  <div key={c.id} className="recent-item">
                    <div>
                      <strong>{c.name}</strong>
                      <p>{c.email}</p>
                    </div>
                    <span className="date">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="recent-section">
              <h3>Utilisateurs Récents</h3>
              <div className="recent-list">
                {statistics.recent_users.map((u) => (
                  <div key={u.id} className="recent-item">
                    <div>
                      <strong>{u.name}</strong>
                      <p>{u.email} - {u.role}</p>
                    </div>
                    <span className="date">{new Date(u.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="activity-section">
            <h2>Journal d'Activité</h2>

            <div className="activity-list">
              {activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'candidate_registration' ? '🎓' : '👤'}
                  </div>
                  <div className="activity-details">
                    <strong>{activity.user_name}</strong>
                    <p>{activity.action}</p>
                    <small>{activity.user_email}</small>
                  </div>
                  <div className="activity-time">
                    {new Date(activity.timestamp).toLocaleDateString('fr-FR')}
                    <br />
                    {new Date(activity.timestamp).toLocaleTimeString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
