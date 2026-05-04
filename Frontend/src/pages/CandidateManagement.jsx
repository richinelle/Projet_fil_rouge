import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function CandidateManagement() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/admin/dashboard')
    }
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await client.get('/admin/candidates')
      setCandidates(response.data.candidates)
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des candidats')
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length < 2) {
      fetchCandidates()
      return
    }
    try {
      const response = await client.get(`/admin/search?q=${query}`)
      setCandidates(response.data.candidates)
    } catch (err) {
      console.error('Erreur de recherche:', err)
    }
  }

  const getFilteredCandidates = () => {
    if (filterStatus === 'all') return candidates
    if (filterStatus === 'verified') return candidates.filter(c => c.email_verified)
    if (filterStatus === 'unverified') return candidates.filter(c => !c.email_verified)
    return candidates
  }

  const exportToExcel = () => {
    try {
      setExporting(true)
      const filteredCandidates = getFilteredCandidates()
      const data = filteredCandidates.map(c => ({
        'Nom': c.name,
        'Email': c.email,
        'Téléphone': c.phone || '-',
        'Statut Email': c.email_verified ? 'Vérifié' : 'En attente',
        'Date d\'inscription': new Date(c.created_at).toLocaleDateString('fr-FR')
      }))
      const headers = Object.keys(data[0])
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `candidats_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setSuccess('Candidats exportés avec succès')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'exportation')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = async () => {
    try {
      setExporting(true)
      const filteredCandidates = getFilteredCandidates()
      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Liste des Candidats</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #4A90E2; color: white; padding: 10px; text-align: left; }
              td { padding: 10px; border-bottom: 1px solid #ddd; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>Liste des Candidats SGEE</h1>
            <p>Généré le: ${new Date().toLocaleDateString('fr-FR')}</p>
            <table>
              <thead>
                <tr>
                  <th>Nom</th><th>Email</th><th>Téléphone</th>
                  <th>Statut Email</th><th>Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                ${filteredCandidates.map(c => `
                  <tr>
                    <td>${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone || '-'}</td>
                    <td>${c.email_verified ? 'Vérifié' : 'En attente'}</td>
                    <td>${new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <p>Total: ${filteredCandidates.length} candidat(s)</p>
              <p>SGEE - Système de Gestion d'Enrôlement des Étudiants</p>
            </div>
          </body>
        </html>
      `
      const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `candidats_${new Date().toISOString().split('T')[0]}.html`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setSuccess('Candidats exportés avec succès')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erreur lors de l\'exportation')
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  const filteredCandidates = getFilteredCandidates()

  return (
    <div className="user-management">
      <header className="management-header">
        <div>
          <h1>🎓 Gestion des Candidats</h1>
          <p>Gérez tous les candidats inscrits</p>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-secondary">
          Retour
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Candidats ({filteredCandidates.length})</h2>
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les candidats</option>
              <option value="verified">Email vérifié</option>
              <option value="unverified">Email non vérifié</option>
            </select>
            <button onClick={exportToExcel} disabled={exporting || filteredCandidates.length === 0} className="btn btn-success">
              📊 Excel
            </button>
            <button onClick={exportToPDF} disabled={exporting || filteredCandidates.length === 0} className="btn btn-danger">
              📄 PDF
            </button>
          </div>
        </div>

        <div className="candidates-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th><th>Email</th><th>Téléphone</th>
                <th>Statut Email</th><th>Inscrit le</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone || '-'}</td>
                  <td>
                    <span className={`status-badge ${c.email_verified ? 'verified' : 'unverified'}`}>
                      {c.email_verified ? '✓ Vérifié' : '⏳ En attente'}
                    </span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <button className="btn btn-small" onClick={() => navigate(`/admin/candidates/${c.id}`)}>
                      Voir détails
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
