import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function ContestsAdmin() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/admin/dashboard')
    }
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      setLoading(true)
      const response = await client.get('/admin/contests')
      setContests(response.data.contests || [])
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des concours:', err.response?.data || err.message)
      setError('Erreur lors du chargement des concours')
      setLoading(false)
    }
  }

  const getFilteredContests = () => {
    return contests.filter(contest => {
      const matchesSearch = contest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contest.organizer && contest.organizer.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || contest.status === statusFilter

      const matchesLocation = locationFilter === 'all' || contest.location === locationFilter

      return matchesSearch && matchesStatus && matchesLocation
    })
  }

  const getUniqueLocations = () => {
    const locations = contests
      .map(c => c.location)
      .filter((location, index, self) => location && self.indexOf(location) === index)
    return locations.sort()
  }

  const getUniqueStatuses = () => {
    const statuses = contests
      .map(c => c.status)
      .filter((status, index, self) => status && self.indexOf(status) === index)
    return statuses.sort()
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <h1>Gestion des Concours</h1>
        <p>Consultez tous les concours disponibles</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Tous les Concours ({getFilteredContests().length})</h2>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Rechercher par titre ou organisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>Statut:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les statuts</option>
                {getUniqueStatuses().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Lieu:</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les lieux</option>
                {getUniqueLocations().map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="filter-reset-btn"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setLocationFilter('all')
              }}
            >
              ↻ Réinitialiser
            </button>
          </div>
        </div>

        <div className="contests-list">
          {getFilteredContests().length === 0 ? (
            <div className="no-results">
              <p>Aucun concours trouvé</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Organisateur</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Frais (FCFA)</th>
                  <th>Participants</th>
                  <th>Statut</th>
                  <th>Département</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredContests().map((contest) => (
                  <tr key={contest.id}>
                    <td>{contest.title}</td>
                    <td>{contest.organizer}</td>
                    <td>{new Date(contest.contest_date).toLocaleDateString('fr-FR')}</td>
                    <td>{contest.location}</td>
                    <td>{contest.registration_fee}</td>
                    <td>{contest.current_participants}/{contest.max_participants || '∞'}</td>
                    <td>
                      <span className={`status-badge status-${contest.status}`}>
                        {contest.status}
                      </span>
                    </td>
                    <td>{contest.department || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-upcoming {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .status-open {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        .status-closed {
          background-color: #ffebee;
          color: #d32f2f;
        }

        .status-ongoing {
          background-color: #fff3e0;
          color: #f57c00;
        }

        .status-completed {
          background-color: #f3e5f5;
          color: #7b1fa2;
        }
      `}</style>
    </div>
  )
}
