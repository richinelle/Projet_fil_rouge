import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function EnrollmentManagement() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (user.role !== 'contest_manager' && user.role !== 'admin') {
      navigate('/manager/dashboard')
    }
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const response = await client.get('/manager/enrollments')
      setEnrollments(response.data.enrollments || [])
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des inscriptions:', err.response?.data || err.message)
      setError('Erreur lors du chargement des inscriptions')
      setLoading(false)
    }
  }

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    setSelectedEnrollment(null)
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <h1>Gestion des Inscriptions</h1>
        <p>Consultez tous les candidats qui ont soumis leur inscription</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Inscriptions Soumises ({enrollments.length})</h2>
        </div>

        <div className="enrollments-list">
          {enrollments.length === 0 ? (
            <p>Aucune inscription soumise</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom Complet</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Département</th>
                  <th>Filière</th>
                  <th>Date de Soumission</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>{enrollment.full_name}</td>
                    <td>{enrollment.candidate_email}</td>
                    <td>{enrollment.candidate_phone}</td>
                    <td>{enrollment.department_id || '-'}</td>
                    <td>{enrollment.filiere_id || '-'}</td>
                    <td>{new Date(enrollment.submitted_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() => handleViewDetails(enrollment)}
                      >
                        Voir Détails
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
              <h2>Détails de l'Inscription</h2>
              <button className="modal-close" onClick={handleCloseDetails}>✕</button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-section">
                  <h3>Informations Personnelles</h3>
                  <div className="detail-row">
                    <span className="label">Nom Complet:</span>
                    <span className="value">{selectedEnrollment.full_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date de Naissance:</span>
                    <span className="value">{selectedEnrollment.date_of_birth}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Sexe:</span>
                    <span className="value">{selectedEnrollment.gender}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Nationalité:</span>
                    <span className="value">{selectedEnrollment.nationality}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Numéro CNI:</span>
                    <span className="value">{selectedEnrollment.cni_number}</span>
                  </div>
                </div>

                <div className="detail-section">
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
                    <span className="label">Code Postal:</span>
                    <span className="value">{selectedEnrollment.postal_code}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Pays:</span>
                    <span className="value">{selectedEnrollment.country}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Éducation</h3>
                  <div className="detail-row">
                    <span className="label">Niveau d'Études:</span>
                    <span className="value">{selectedEnrollment.education_level}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Nom de l'École/Université:</span>
                    <span className="value">{selectedEnrollment.school_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Domaine d'Études:</span>
                    <span className="value">{selectedEnrollment.field_of_study}</span>
                  </div>
                </div>

                <div className="detail-section">
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

                <div className="detail-section">
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
              <button className="btn btn-secondary" onClick={handleCloseDetails}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .detail-section {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
        }

        .detail-section h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
