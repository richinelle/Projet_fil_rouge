import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function EnrollmentReview() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showDocuments, setShowDocuments] = useState(false)
  const [documents, setDocuments] = useState([])
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [candidateCode, setCandidateCode] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/admin/dashboard')
    }
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const response = await client.get('/admin/inscriptions')
      setEnrollments(response.data.enrollments || [])
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des inscriptions:', err.response?.data || err.message)
      setError('Erreur lors du chargement des inscriptions')
      setLoading(false)
    }
  }

  const handleViewDetails = async (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDetails(true)
    setCandidateCode('')
    
    try {
      const response = await client.get(`/admin/inscriptions/${enrollment.id}/documents`)
      setDocuments(response.data.documents || [])
    } catch (err) {
      console.error('Erreur lors du chargement des documents:', err)
    }
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedEnrollment(null)
    setShowRejectForm(false)
    setRejectionReason('')
    setCandidateCode('')
  }

  const handleViewDocuments = async (enrollment) => {
    try {
      const response = await client.get(`/admin/inscriptions/${enrollment.id}/documents`)
      setDocuments(response.data.documents || [])
      setSelectedEnrollment(enrollment)
      setShowDocuments(true)
    } catch (err) {
      console.error('Erreur lors du chargement des documents:', err)
      alert('Erreur lors du chargement des documents')
    }
  }

  const handleApprove = async (enrollment) => {
    if (!window.confirm('Êtes-vous sûr de vouloir approuver cette candidature?')) {
      return
    }

    try {
      setActionLoading(true)
      await client.post(`/admin/inscriptions/${enrollment.id}/approve`, {})
      alert('Candidature approuvée avec succès')
      fetchEnrollments()
      setShowDetails(false)
      setSelectedEnrollment(null)
    } catch (err) {
      console.error('Erreur lors de l\'approbation:', err)
      alert('Erreur lors de l\'approbation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (enrollment) => {
    if (!rejectionReason.trim()) {
      alert('Veuillez entrer une raison de rejet')
      return
    }

    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette candidature?')) {
      return
    }

    try {
      setActionLoading(true)
      await client.post(`/admin/inscriptions/${enrollment.id}/reject`, {
        rejection_reason: rejectionReason,
      })
      alert('Candidature rejetée avec succès')
      fetchEnrollments()
      setShowDetails(false)
      setSelectedEnrollment(null)
      setRejectionReason('')
      setShowRejectForm(false)
    } catch (err) {
      console.error('Erreur lors du rejet:', err)
      alert('Erreur lors du rejet')
    } finally {
      setActionLoading(false)
    }
  }

  const handleViewDocument = async (docId) => {
    try {
      const response = await client.get(`/admin/documents/${docId}/view`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Erreur lors de l\'affichage du document:', err)
      alert('Erreur lors de l\'affichage du document')
    }
  }

  const handleDownloadCertificate = async (enrollment) => {
    try {
      const response = await client.get(`/admin/inscriptions/${enrollment.id}/certificate`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fiche_inscription_${enrollment.candidate_code}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur lors du téléchargement de la fiche:', err)
      alert('Erreur lors du téléchargement de la fiche')
    }
  }

  const generateCandidateCode = () => {
    const code = 'GS' + String(selectedEnrollment.id).padStart(4, '0')
    setCandidateCode(code)
  }

  const getFilteredEnrollments = () => {
    return enrollments.filter(enrollment => {
      const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter
      const matchesSearch = enrollment.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.candidate_email.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }

  const getStatusCounts = () => {
    return {
      all: enrollments.length,
      pending: enrollments.filter(e => e.status === 'pending').length,
      approved: enrollments.filter(e => e.status === 'approved').length,
      rejected: enrollments.filter(e => e.status === 'rejected').length,
    }
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <h1>Vérification des Candidatures</h1>
        <p>Examinez et validez les candidatures soumises</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Candidatures ({getFilteredEnrollments().length})</h2>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Rechercher par nom ou email..."
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
                <option value="all">Tous ({getStatusCounts().all})</option>
                <option value="pending">En cours ({getStatusCounts().pending})</option>
                <option value="approved">Approuvées ({getStatusCounts().approved})</option>
                <option value="rejected">Rejetées ({getStatusCounts().rejected})</option>
              </select>
            </div>

            <button
              className="filter-reset-btn"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
            >
              ↻ Réinitialiser
            </button>
          </div>
        </div>

        <div className="enrollments-list">
          {getFilteredEnrollments().length === 0 ? (
            <div className="no-results">
              <p>Aucune candidature trouvée</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Département</th>
                  <th>Filière</th>
                  <th>Date de soumission</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredEnrollments().map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>{enrollment.candidate_name}</td>
                    <td>{enrollment.candidate_email}</td>
                    <td>{enrollment.candidate_phone}</td>
                    <td>{enrollment.department_name || '-'}</td>
                    <td>{enrollment.filiere_name || '-'}</td>
                    <td>{new Date(enrollment.submitted_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <span className={`status-badge status-${enrollment.status}`}>
                        {enrollment.status === 'pending' && '⏳ En cours'}
                        {enrollment.status === 'approved' && '✓ Approuvée'}
                        {enrollment.status === 'rejected' && '✕ Rejetée'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewDetails(enrollment)}
                      >
                        👁️ Détails
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleViewDocuments(enrollment)}
                      >
                        📄 Documents
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedEnrollment && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de la Candidature</h2>
              <button className="modal-close" onClick={handleCloseDetails}>✕</button>
            </div>

            <div className="modal-body">
              <div className="enrollment-header">
                <div className="candidate-info-header">
                  <h2>{selectedEnrollment.candidate_name}</h2>
                  <p className="candidate-subtitle">Fiche d'inscription au concours</p>
                </div>
              </div>

              <div className="enrollment-details">
                <div className="qr-code-section">
                  <h3>📱 Code QR du Reçu de Paiement</h3>
                  <div className="qr-code-container">
                    {documents.length > 0 && documents.find(d => d.document_type === 'payment_receipt') ? (
                      <div className="qr-code-display">
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewDocument(documents.find(d => d.document_type === 'payment_receipt').id)}
                        >
                          👁️ Voir le QR Code
                        </button>
                      </div>
                    ) : (
                      <p className="no-qr">Aucun reçu de paiement trouvé</p>
                    )}
                  </div>
                </div>

                <div className="candidate-code-section">
                  <h3>🎓 Code Candidat</h3>
                  <div className="candidate-code-input">
                    <input 
                      type="text" 
                      placeholder="Code candidat"
                      value={candidateCode}
                      readOnly
                      className="code-display"
                    />
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={generateCandidateCode}
                    >
                      Générer
                    </button>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Informations Personnelles</h3>
                  <div className="detail-row">
                    <span className="label">Nom complet:</span>
                    <span className="value">{selectedEnrollment.full_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date de naissance:</span>
                    <span className="value">{selectedEnrollment.date_of_birth}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Genre:</span>
                    <span className="value">{selectedEnrollment.gender}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Nationalité:</span>
                    <span className="value">{selectedEnrollment.nationality}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Identification</h3>
                  <div className="detail-row">
                    <span className="label">Numéro CNI:</span>
                    <span className="value">{selectedEnrollment.cni_number}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Adresse</h3>
                  <div className="detail-row">
                    <span className="label">Adresse:</span>
                    <span className="value">{selectedEnrollment.address}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ville:</span>
                    <span className="value">{selectedEnrollment.city}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Pays:</span>
                    <span className="value">{selectedEnrollment.country}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Code postal:</span>
                    <span className="value">{selectedEnrollment.postal_code}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Éducation</h3>
                  <div className="detail-row">
                    <span className="label">Niveau d'études:</span>
                    <span className="value">{selectedEnrollment.education_level}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">École/Université:</span>
                    <span className="value">{selectedEnrollment.school_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Domaine d'études:</span>
                    <span className="value">{selectedEnrollment.field_of_study}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Contact d'Urgence</h3>
                  <div className="detail-row">
                    <span className="label">Nom:</span>
                    <span className="value">{selectedEnrollment.emergency_contact_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Téléphone:</span>
                    <span className="value">{selectedEnrollment.emergency_contact_phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Relation:</span>
                    <span className="value">{selectedEnrollment.emergency_contact_relationship}</span>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Informations de Contact</h3>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedEnrollment.candidate_email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Téléphone:</span>
                    <span className="value">{selectedEnrollment.candidate_phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-success"
                onClick={() => handleApprove(selectedEnrollment)}
                disabled={actionLoading}
              >
                ✓ Approuver
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={actionLoading}
              >
                ✕ Rejeter
              </button>
              {selectedEnrollment.status === 'approved' && selectedEnrollment.candidate_code && (
                <button
                  className="btn btn-info"
                  onClick={() => handleDownloadCertificate(selectedEnrollment)}
                >
                  📥 Télécharger Fiche
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={handleCloseDetails}
              >
                Fermer
              </button>
            </div>

            {showRejectForm && (
              <div className="reject-form">
                <h4>Raison du rejet</h4>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Entrez la raison du rejet..."
                  rows="4"
                />
                <div className="form-actions">
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(selectedEnrollment)}
                    disabled={actionLoading}
                  >
                    Confirmer le rejet
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectionReason('')
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocuments && selectedEnrollment && (
        <div className="modal-overlay" onClick={() => setShowDocuments(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Documents de {selectedEnrollment.candidate_name}</h2>
              <button className="modal-close" onClick={() => setShowDocuments(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="documents-grid">
                {documents.length === 0 ? (
                  <p>Aucun document trouvé</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="document-name">{doc.filename}</div>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        👁️ Voir
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDocuments(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.status-pending {
          background-color: #fff3e0;
          color: #f57c00;
          border: 1px solid #ffe0b2;
        }

        .status-badge.status-approved {
          background-color: #e8f5e9;
          color: #388e3c;
          border: 1px solid #c8e6c9;
        }

        .status-badge.status-rejected {
          background-color: #ffebee;
          color: #d32f2f;
          border: 1px solid #ffcdd2;
        }

        .enrollment-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .candidate-info-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .candidate-subtitle {
          margin: 5px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .qr-code-section {
          background: #f9f9f9;
          border: 2px solid #667eea;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          text-align: center;
        }

        .qr-code-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .qr-code-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100px;
        }

        .qr-code-display {
          background: white;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .no-qr {
          color: #999;
          font-style: italic;
        }

        .candidate-code-section {
          background: #f0f7ff;
          border: 2px solid #17a2b8;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .candidate-code-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .candidate-code-input {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .code-display {
          flex: 1;
          padding: 12px;
          border: 2px solid #17a2b8;
          border-radius: 4px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          background: white;
          color: #17a2b8;
        }

        .btn-primary {
          background-color: #17a2b8;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          padding: 10px 20px;
          font-weight: 600;
        }

        .btn-primary:hover {
          background-color: #138496;
        }

        .enrollment-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .details-section {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background-color: #f9f9f9;
        }

        .details-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 16px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-row .label {
          font-weight: 600;
          color: #555;
          min-width: 150px;
        }

        .detail-row .value {
          color: #333;
          text-align: right;
          flex: 1;
        }

        .reject-form {
          margin-top: 20px;
          padding: 15px;
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
        }

        .reject-form h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .reject-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: Arial, sans-serif;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .form-actions .btn {
          flex: 1;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 15px;
        }

        .document-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          background-color: #f9f9f9;
        }

        .document-name {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
          word-break: break-word;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-info {
          background-color: #17a2b8;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-info:hover {
          background-color: #138496;
        }

        .btn-warning {
          background-color: #ffc107;
          color: #333;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-warning:hover {
          background-color: #e0a800;
        }

        .btn-success {
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          padding: 8px 16px;
        }

        .btn-success:hover:not(:disabled) {
          background-color: #218838;
        }

        .btn-success:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          padding: 8px 16px;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: #c82333;
        }

        .btn-danger:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          padding: 8px 16px;
        }

        .btn-secondary:hover {
          background-color: #5a6268;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          border-radius: 8px;
          max-width: 700px;
          width: 90%;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          color: #333;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
        }

        .no-results {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  )
}
