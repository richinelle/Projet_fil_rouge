import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/CertificateView.css'

export default function CertificateView() {
  const token = localStorage.getItem('token')
  const [enrollment, setEnrollment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnrollmentData()
  }, [])

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://localhost:8000/api/enrollment/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEnrollment(response.data.enrollment)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Chargement...</div>
  }

  if (!enrollment) {
    return <div className="error">Aucune inscription trouvée</div>
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getGenderLabel = (gender) => {
    const genders = {
      'male': 'Masculin',
      'female': 'Féminin',
      'other': 'Autre'
    }
    return genders[gender] || gender
  }

  const getEducationLabel = (level) => {
    const levels = {
      'high_school': 'Lycée',
      'bachelor': 'Licence',
      'master': 'Master',
      'phd': 'Doctorat'
    }
    return levels[level] || level
  }

  return (
    <div className="certificate-container">
      <div className="certificate-page">
        {/* Header */}
        <div className="certificate-header">
          <div className="header-logo">SGEE</div>
          <div className="header-title">
            <h1>FICHE D'INSCRIPTION AU CONCOURS D'ENTRÉE</h1>
            <h2>CURSUS INGENIEUR</h2>
          </div>
          <div className="header-stamp">
            <div>Timbre Fiscal ici</div>
            <div>Stamp here</div>
          </div>
        </div>

        {/* Inscription Number */}
        {enrollment.candidate_code && (
          <div className="inscription-section">
            <div className="inscription-label">INSCRIPTION N°</div>
            <div className="inscription-number">{enrollment.candidate_code}</div>
          </div>
        )}

        {/* Personal Information */}
        <div className="section">
          <h3 className="section-title">Informations Personnelles</h3>
          <div className="section-content">
            <div className="info-row">
              <div className="info-col">
                <label>Nom:</label>
                <span>{enrollment.full_name?.split(' ')[0] || 'N/A'}</span>
              </div>
              <div className="info-col">
                <label>Prénom:</label>
                <span>{enrollment.full_name?.split(' ').slice(1).join(' ') || 'N/A'}</span>
              </div>
              <div className="info-col">
                <label>Date naissance:</label>
                <span>{formatDate(enrollment.date_of_birth)}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-col">
                <label>Sexe:</label>
                <span>{getGenderLabel(enrollment.gender)}</span>
              </div>
              <div className="info-col">
                <label>Nationalité:</label>
                <span>{enrollment.nationality || 'N/A'}</span>
              </div>
              <div className="info-col">
                <label>CNI:</label>
                <span>{enrollment.cni_number || 'N/A'}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-col">
                <label>Adresse:</label>
                <span>{enrollment.address || 'N/A'}</span>
              </div>
              <div className="info-col">
                <label>Ville:</label>
                <span>{enrollment.city || 'N/A'}</span>
              </div>
              <div className="info-col">
                <label>Pays:</label>
                <span>{enrollment.country || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="section">
          <h3 className="section-title">Informations Académique</h3>
          <div className="section-content">
            <div className="info-row">
              <div className="info-col">
                <label>Diplôme:</label>
                <span>{getEducationLabel(enrollment.education_level)}</span>
              </div>
              <div className="info-col">
                <label>École:</label>
                <span>{enrollment.school_name || 'N/A'}</span>
              </div>
              <div className="info-col">
                <label>Domaine:</label>
                <span>{enrollment.field_of_study || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Required Documents */}
        <div className="section">
          <h3 className="section-title documents-title">Documents Nécessaires</h3>
          <div className="documents-list">
            <p>Acte de naissance certifié (moins de 3 mois)</p>
            <p>Diplôme/attestation requis certifié</p>
            <p>Certificat médical (moins de 3 mois)</p>
            <p>Quatre (04) photos d'identité 4x4</p>
            <p>Reçu de versement bancaire</p>
            <p>Enveloppe A4 timbrée avec adresse</p>
          </div>
        </div>

        {/* Footer */}
        <div className="certificate-footer">
          <div className="candidate-code-section">
            <span className="code-label">Code Candidat:</span>
            <span className="code-value">{enrollment.candidate_code || 'N/A'}</span>
          </div>
          <div className="print-date">
            Imprimée le {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="print-button-container">
        <button onClick={() => window.print()} className="btn-print">
          🖨️ Imprimer
        </button>
      </div>
    </div>
  )
}
