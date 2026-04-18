import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function ContestManagement() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [examCenters, setExamCenters] = useState([])
  const [depositCenters, setDepositCenters] = useState([])
  const [departments, setDepartments] = useState([])
  const [filieres, setFilieres] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    registration_start_date: '',
    registration_end_date: '',
    contest_date: '',
    location: '',
    registration_fee: '',
    max_participants: '',
    prizes: '',
    contact_email: '',
    contact_phone: '',
    exam_center_id: '',
    deposit_center_id: '',
    department_id: '',
    filiere_id: '',
  })

  useEffect(() => {
    if (user.role !== 'contest_manager' && user.role !== 'admin') {
      navigate('/manager/dashboard')
    }
    fetchContests()
    fetchExamCenters()
    fetchDepositCenters()
    fetchDepartments()
  }, [])

  const fetchExamCenters = async () => {
    try {
      const response = await client.get('/manager/exam-centers')
      setExamCenters(response.data.exam_centers || response.data || [])
    } catch (err) {
      console.error('Erreur lors du chargement des centres d\'examen:', err.response?.data || err.message)
    }
  }

  const fetchDepositCenters = async () => {
    try {
      const response = await client.get('/manager/deposit-centers')
      setDepositCenters(response.data.deposit_centers || response.data || [])
    } catch (err) {
      console.error('Erreur lors du chargement des centres de dépôt:', err.response?.data || err.message)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await client.get('/manager/departments')
      setDepartments(response.data.departments || response.data || [])
    } catch (err) {
      console.error('Erreur lors du chargement des départements:', err.response?.data || err.message)
    }
  }

  const fetchFilieres = async (departmentId) => {
    if (!departmentId) {
      setFilieres([])
      return
    }
    try {
      const response = await client.get(`/manager/filieres/by-department/${departmentId}`)
      setFilieres(response.data.filieres || response.data || [])
    } catch (err) {
      console.error('Erreur lors du chargement des filières:', err.response?.data || err.message)
    }
  }

  const fetchContests = async () => {
    try {
      setLoading(true)
      const response = await client.get('/manager/contests')
      setContests(response.data.contests || [])
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des concours:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'Erreur lors du chargement des concours')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Convertir les chaînes vides en null
      const dataToSend = {
        ...formData,
        exam_center_id: formData.exam_center_id || null,
        deposit_center_id: formData.deposit_center_id || null,
        department_id: formData.department_id || null,
        filiere_id: formData.filiere_id || null,
      }

      if (editingId) {
        await client.put(`/manager/contests/${editingId}`, dataToSend)
        setSuccess('Concours modifié avec succès!')
      } else {
        await client.post('/manager/contests', dataToSend)
        setSuccess('Concours créé avec succès!')
      }
      setFormData({
        title: '',
        description: '',
        requirements: '',
        registration_start_date: '',
        registration_end_date: '',
        contest_date: '',
        location: '',
        registration_fee: '',
        max_participants: '',
        prizes: '',
        contact_email: '',
        contact_phone: '',
        exam_center_id: '',
        deposit_center_id: '',
        department_id: '',
        filiere_id: '',
      })
      setEditingId(null)
      setShowForm(false)
      setTimeout(() => setSuccess(''), 3000)
      fetchContests()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'opération')
    }
  }

  const handleEdit = (contest) => {
    setFormData(contest)
    setEditingId(contest.id)
    setShowForm(true)
  }

  const handleDelete = async (contestId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce concours?')) {
      try {
        await client.delete(`/manager/contests/${contestId}`)
        setSuccess('Concours supprimé!')
        fetchContests()
      } catch (err) {
        setError('Erreur lors de la suppression')
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      requirements: '',
      registration_start_date: '',
      registration_end_date: '',
      contest_date: '',
      location: '',
      registration_fee: '',
      max_participants: '',
      prizes: '',
      contact_email: '',
      contact_phone: '',
      exam_center_id: '',
      deposit_center_id: '',
      department_id: '',
      filiere_id: '',
    })
    setFilieres([])
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <h1>Gestion des Concours</h1>
        <p>Gérez tous vos concours</p>
      </header>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Mes Concours</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Annuler' : '+ Créer un concours'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>Titre du concours *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date du concours *</label>
                <input
                  type="date"
                  value={formData.contest_date}
                  onChange={(e) => setFormData({ ...formData, contest_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Début des inscriptions *</label>
                <input
                  type="date"
                  value={formData.registration_start_date}
                  onChange={(e) => setFormData({ ...formData, registration_start_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fin des inscriptions *</label>
                <input
                  type="date"
                  value={formData.registration_end_date}
                  onChange={(e) => setFormData({ ...formData, registration_end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lieu *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Frais d'inscription (FCFA) *</label>
                <input
                  type="number"
                  value={formData.registration_fee}
                  onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre maximum de participants</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email de contact</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Téléphone de contact</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Prix/Récompenses</label>
                <input
                  type="text"
                  value={formData.prizes}
                  onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                  placeholder="Ex: 1er: 100 000 FCFA, 2e: 50 000 FCFA"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Centre d'examen</label>
                <select
                  value={formData.exam_center_id}
                  onChange={(e) => setFormData({ ...formData, exam_center_id: e.target.value })}
                >
                  <option value="">Sélectionner un centre d'examen</option>
                  {examCenters.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Centre de dépôt des dossiers</label>
                <select
                  value={formData.deposit_center_id}
                  onChange={(e) => setFormData({ ...formData, deposit_center_id: e.target.value })}
                >
                  <option value="">Sélectionner un centre de dépôt</option>
                  {depositCenters.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Département</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => {
                    setFormData({ ...formData, department_id: e.target.value, filiere_id: '' })
                    fetchFilieres(e.target.value)
                  }}
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Filière</label>
                <select
                  value={formData.filiere_id}
                  onChange={(e) => setFormData({ ...formData, filiere_id: e.target.value })}
                  disabled={!formData.department_id}
                >
                  <option value="">Sélectionner une filière</option>
                  {filieres.map((filiere) => (
                    <option key={filiere.id} value={filiere.id}>
                      {filiere.name}
                    </option>
                  ))}
                </select>
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

        <div className="contests-list">
          {contests.length === 0 ? (
            <p>Aucun concours créé</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Frais (FCFA)</th>
                  <th>Centre d'examen</th>
                  <th>Département</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((contest) => (
                  <tr key={contest.id}>
                    <td>{contest.title}</td>
                    <td>{new Date(contest.contest_date).toLocaleDateString('fr-FR')}</td>
                    <td>{contest.location}</td>
                    <td>{contest.registration_fee}</td>
                    <td>{contest.exam_center?.name || '-'}</td>
                    <td>{contest.department?.name || '-'}</td>
                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() => handleEdit(contest)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(contest.id)}
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
