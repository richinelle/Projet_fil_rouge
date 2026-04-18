import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import '../styles/EnrollmentSidebar.css'

export default function EnrollmentSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const [documentsCount, setDocumentsCount] = useState(0)

  useEffect(() => {
    fetchEnrollmentData()
    fetchDocumentsCount()
  }, [])

  const fetchEnrollmentData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/enrollment/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSteps(response.data.steps)
      if (response.data.enrollment) {
        setProgress(response.data.progress)
      }
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const fetchDocumentsCount = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/enrollment/documents', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDocumentsCount(response.data.documents?.length || 0)
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId)
    navigate('/enrollment')
  }

  // Don't show on enrollment page (it has its own sidebar)
  if (location.pathname === '/enrollment') {
    return null
  }

  if (loading) {
    return null
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Afficher/Masquer les étapes"
      >
        {isOpen ? '✕' : '📋'}
      </button>

      {/* Sidebar */}
      <div className={`enrollment-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h3>📋 Étapes d'Inscription</h3>
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="sidebar-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{progress}% complété</p>
        </div>

        <div className="documents-info">
          <div className="documents-badge">
            <span className="documents-icon">📄</span>
            <span className="documents-label">Documents</span>
            <span className="documents-count">{documentsCount}</span>
          </div>
        </div>

        <div className="steps-list">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step-item ${progress >= (index + 1) * (100 / steps.length) ? 'completed' : ''}`}
              onClick={() => handleStepClick(step.id)}
            >
              <div className={`step-number ${progress >= (index + 1) * (100 / steps.length) ? 'done' : ''}`}>
                {progress >= (index + 1) * (100 / steps.length) ? '✓' : step.id}
              </div>
              <div className="step-info">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/enrollment')}
          >
            Continuer l'inscription
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}
