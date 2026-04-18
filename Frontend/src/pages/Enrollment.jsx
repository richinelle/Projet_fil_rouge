import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { QRCodeSVG } from 'qrcode.react'
import '../styles/Enrollment.css'

export default function Enrollment() {
  const navigate = useNavigate()
  const candidate = JSON.parse(localStorage.getItem('candidate') || '{}')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState([])
  const [filieres, setFilieres] = useState([])
  const [examCenters, setExamCenters] = useState([])
  const [depositCenters, setDepositCenters] = useState([])
  const [documents, setDocuments] = useState({})
  const [uploading, setUploading] = useState({})
  const [contests, setContests] = useState([])
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [documentPreviews, setDocumentPreviews] = useState({})
  const [viewingDocument, setViewingDocument] = useState(null)

  useEffect(() => {
    if (!candidate || !candidate.id) {
      navigate('/login')
      return
    }
    
    // Log token status on component mount
    const token = localStorage.getItem('token')
    console.log('[Enrollment] Component mounted', {
      candidateId: candidate.id,
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
    })
    
    fetchEnrollmentData()
    fetchDepartments()
    fetchExamCenters()
    fetchDepositCenters()
    fetchDocuments()
    fetchContests()
  }, [])

  // Fetch filières when department_id changes or form data loads
  useEffect(() => {
    if (formData.department_id) {
      fetchFilieres(formData.department_id)
    }
  }, [formData.department_id])

  const fetchEnrollmentData = async () => {
    try {
      const response = await client.get('/enrollment/status')
      if (response.data.enrollment) {
        setFormData(response.data.enrollment)
      }
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await client.get('/departments')
      setDepartments(response.data.departments || [])
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const fetchFilieres = async (departmentId) => {
    try {
      if (!departmentId) {
        setFilieres([])
        return
      }
      const response = await client.get(`/filieres/by-department/${departmentId}`)
      setFilieres(response.data.filieres || [])
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const fetchExamCenters = async () => {
    try {
      const response = await client.get('/exam-centers')
      setExamCenters(response.data.exam_centers || [])
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const fetchDepositCenters = async () => {
    try {
      const response = await client.get('/deposit-centers')
      setDepositCenters(response.data.deposit_centers || [])
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await client.get('/enrollment/documents')
      const docsMap = {}
      response.data.documents.forEach(doc => {
        docsMap[doc.document_type] = doc
      })
      setDocuments(docsMap)
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const fetchContests = async () => {
    try {
      const response = await client.get('/contests')
      setContests(response.data.contests || [])
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log('[Enrollment] Field changed:', { name, value })
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value,
      }
      console.log('[Enrollment] FormData updated:', newData)
      return newData
    })
    
    if (name === 'department_id') {
      fetchFilieres(value)
    }
  }

  const handleDocumentUpload = async (documentType, file, contestId = null) => {
    if (!file) return

    // Validation côté client
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf']
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'pdf']

    // Vérifier la taille
    if (file.size > maxSize) {
      setError(`Le fichier dépasse la taille maximale de 2MB (taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      return
    }

    // Vérifier le type MIME
    if (!allowedTypes.includes(file.type)) {
      setError(`Type de fichier non autorisé. Formats acceptés: PNG, JPG, PDF`)
      return
    }

    // Vérifier l'extension
    const fileExtension = file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Extension de fichier non autorisée. Formats acceptés: .png, .jpg, .jpeg, .pdf`)
      return
    }

    // Créer une prévisualisation pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (documentType === 'payment_receipt') {
          setReceiptPreview(e.target.result)
        } else {
          setDocumentPreviews({
            ...documentPreviews,
            [documentType]: e.target.result,
          })
        }
      }
      reader.readAsDataURL(file)
    }

    try {
      setUploading({ ...uploading, [documentType]: true })
      setError('')

      const formDataObj = new FormData()
      formDataObj.append('document_type', documentType)
      formDataObj.append('file', file)
      if (contestId) {
        formDataObj.append('contest_id', contestId)
      }

      console.log('[Enrollment] Uploading document:', {
        documentType,
        fileName: file.name,
        fileSize: file.size,
        contestId,
        token: localStorage.getItem('token') ? 'present' : 'missing',
      })

      const response = await client.post('/enrollment/documents/upload', formDataObj)

      console.log('[Enrollment] Upload successful:', response.data)

      // Mettre à jour l'état documents avec le nouveau document
      const updatedDocuments = {
        ...documents,
        [documentType]: response.data.document,
      }
      setDocuments(updatedDocuments)

      console.log('[Enrollment] Documents state updated:', updatedDocuments)

      setSuccess(`Document téléchargé avec succès`)
      
      // Afficher automatiquement le document après le téléchargement
      setTimeout(() => {
        console.log('[Enrollment] Attempting to view document:', documentType)
        handleViewDocument(documentType)
        setSuccess('')
      }, 500)
    } catch (err) {
      console.error('[Enrollment] Upload error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      })
      
      setError(err.response?.data?.message || 'Erreur lors du téléchargement')
      if (documentType === 'payment_receipt') {
        setReceiptPreview(null)
      } else {
        const newPreviews = { ...documentPreviews }
        delete newPreviews[documentType]
        setDocumentPreviews(newPreviews)
      }
    } finally {
      setUploading({ ...uploading, [documentType]: false })
    }
  }

  const handleDeleteDocument = async (documentType) => {
    if (!documents[documentType]) return

    try {
      await client.delete(`/enrollment/documents/${documents[documentType].id}`)

      const newDocs = { ...documents }
      delete newDocs[documentType]
      setDocuments(newDocs)

      setSuccess('Document supprimé avec succès')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression')
    }
  }

  const handleViewDocument = async (documentType) => {
    const doc = documents[documentType]
    if (!doc) return

    let preview = null
    
    // Si c'est une image et qu'on a une prévisualisation en cache, l'utiliser
    if (documentType === 'payment_receipt' && receiptPreview) {
      preview = receiptPreview
    } else if (documentPreviews[documentType]) {
      preview = documentPreviews[documentType]
    } else if (doc.mime_type?.startsWith('image/')) {
      // Sinon, charger l'image depuis le serveur
      try {
        const response = await client.get(`/enrollment/documents/${doc.id}/view`, {
          responseType: 'blob'
        })
        const blob = new Blob([response.data], { type: doc.mime_type })
        preview = URL.createObjectURL(blob)
      } catch (err) {
        console.error('Erreur lors du chargement du document:', err)
        setError('Impossible de charger le document')
        return
      }
    } else if (doc.mime_type === 'application/pdf') {
      // Pour les PDFs, charger depuis le serveur
      try {
        const response = await client.get(`/enrollment/documents/${doc.id}/view`, {
          responseType: 'blob'
        })
        const blob = new Blob([response.data], { type: 'application/pdf' })
        preview = URL.createObjectURL(blob)
      } catch (err) {
        console.error('Erreur lors du chargement du PDF:', err)
        setError('Impossible de charger le PDF')
        return
      }
    }

    setViewingDocument({
      type: documentType,
      preview: preview,
      filename: doc.original_filename || 'Document',
      mimeType: doc.mime_type
    })
  }

  const handleSave = async () => {
    try {
      setError('')
      setSuccess('')
      
      console.log('[Enrollment] Saving form data:', formData)
      
      const response = await client.post('/enrollment/save', formData)
      
      console.log('[Enrollment] Save response:', response.data)
      
      // Mettre à jour formData avec la réponse du serveur
      if (response.data.enrollment) {
        setFormData(response.data.enrollment)
      }
      
      setSuccess('Étape sauvegardée avec succès')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('[Enrollment] Save error:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        error: err.message,
      })
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setError('')
      await client.post('/enrollment/submit', {})
      setSuccess('Votre candidature est en cours de traitement. Veuillez patienter qu\'elle soit approuvée ou rejetée.')
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (err) {
      const errorData = err.response?.data
      const errorMsg = errorData?.message || 'Erreur lors de la soumission'
      
      // Afficher les champs manquants avec leurs valeurs actuelles
      if (errorData?.missing_fields && errorData.missing_fields.length > 0) {
        const fieldLabels = {
          'full_name': 'Nom complet',
          'date_of_birth': 'Date de naissance',
          'gender': 'Genre',
          'nationality': 'Nationalité',
          'city': 'Ville',
          'country': 'Pays',
          'cni_number': 'Numéro CNI',
          'address': 'Adresse',
          'postal_code': 'Code postal',
          'education_level': 'Niveau d\'études',
          'school_name': 'Nom de l\'école/université',
          'field_of_study': 'Domaine d\'études',
          'department_id': 'Département',
          'filiere_id': 'Filière',
          'exam_center_id': 'Centre d\'examen',
          'deposit_center_id': 'Centre de dépôt',
          'emergency_contact_name': 'Nom du contact d\'urgence',
          'emergency_contact_phone': 'Téléphone du contact d\'urgence',
          'emergency_contact_relationship': 'Relation avec le contact d\'urgence',
        }
        
        const enrollmentData = errorData.enrollment_data || {}
        const missingFieldDetails = errorData.missing_fields.map(field => {
          const label = fieldLabels[field] || field
          const currentValue = enrollmentData[field]
          const valueDisplay = currentValue ? `(actuellement: ${currentValue})` : '(vide)'
          return `${label} ${valueDisplay}`
        })
        
        const detailedError = `${errorMsg}\n\nChamps manquants:\n- ${missingFieldDetails.join('\n- ')}`
        setError(detailedError)
      } else {
        setError(errorMsg)
      }
      
      // If payment is missing, offer to go to payment page
      if (errorMsg.includes('Payment')) {
        setTimeout(() => {
          if (window.confirm('Vous devez effectuer un paiement. Voulez-vous aller à la page de paiement?')) {
            navigate('/contests-selection')
          }
        }, 1000)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="enrollment-container"><p>Chargement...</p></div>
  }

  const steps = [
    {
      id: 1,
      title: 'Informations Personnelles',
      fields: ['full_name', 'date_of_birth', 'gender', 'nationality', 'city', 'country']
    },
    {
      id: 2,
      title: 'Identification',
      fields: ['cni_number']
    },
    {
      id: 3,
      title: 'Adresse',
      fields: ['address', 'postal_code']
    },
    {
      id: 4,
      title: 'Éducation',
      fields: ['education_level', 'school_name', 'field_of_study', 'department_id', 'filiere_id']
    },
    {
      id: 5,
      title: 'Centres',
      fields: ['exam_center_id', 'deposit_center_id']
    },
    {
      id: 6,
      title: 'Contact d\'Urgence',
      fields: ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship']
    },
    {
      id: 7,
      title: 'Documents Requis',
      fields: ['documents']
    },
  ]

  const currentStepData = steps[currentStep - 1]

  const fieldLabels = {
    full_name: 'Nom complet',
    date_of_birth: 'Date de naissance',
    gender: 'Sexe',
    nationality: 'Nationalité',
    city: 'Ville',
    country: 'Pays',
    address: 'Adresse',
    postal_code: 'Code postal',
    cni_number: 'Numéro CNI',
    education_level: 'Niveau d\'études',
    school_name: 'Nom de l\'école/université',
    field_of_study: 'Domaine d\'études',
    department_id: 'Département',
    filiere_id: 'Filière',
    exam_center_id: 'Centre d\'examen',
    deposit_center_id: 'Centre de dépôt',
    emergency_contact_name: 'Nom du contact d\'urgence',
    emergency_contact_phone: 'Téléphone du contact d\'urgence',
    emergency_contact_relationship: 'Relation avec le contact d\'urgence',
  }

  const fieldTypes = {
    date_of_birth: 'date',
    gender: 'select',
    education_level: 'select',
    department_id: 'select',
    filiere_id: 'select',
    exam_center_id: 'select',
    deposit_center_id: 'select',
    address: 'textarea',
  }

  const selectOptions = {
    gender: [
      { value: 'male', label: 'Masculin' },
      { value: 'female', label: 'Féminin' },
      { value: 'other', label: 'Autre' },
    ],
    education_level: [
      { value: 'high_school', label: 'Lycée' },
      { value: 'bachelor', label: 'Licence' },
      { value: 'master', label: 'Master' },
      { value: 'phd', label: 'Doctorat' },
    ],
  }

  return (
    <div className="enrollment-container">
      <div className="enrollment-header">
        <button 
          className="btn-back-to-dashboard"
          onClick={() => navigate('/dashboard')}
        >
          ← Retour au Dashboard
        </button>
        <h1>📋 Formulaire d'Inscription</h1>
        <p>Complétez votre inscription au concours</p>
      </div>

      <div className="enrollment-content">
        {/* Steps Sidebar */}
        <div className="steps-sidebar">
          <h3>Étapes</h3>
          <div className="steps-list">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`step-item ${currentStep === step.id ? 'active' : ''} ${step.id < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className="step-number">
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                <div className="step-label">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="enrollment-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="step-content">
            <h2>{currentStepData?.title}</h2>

            {currentStepData?.fields[0] === 'documents' ? (
              <div className="documents-section">
                <div className="payment-requirement-notice">
                  <div className="notice-icon">⚠️</div>
                  <div className="notice-content">
                    <h4>Paiement Obligatoire</h4>
                    <p>Vous devez avoir effectué le paiement d'un concours et téléchargé le reçu de paiement avant de pouvoir soumettre votre inscription.</p>
                    <button 
                      type="button"
                      className="btn-go-to-payment"
                      onClick={() => navigate('/contests-selection')}
                    >
                      💳 Aller au paiement
                    </button>
                  </div>
                </div>

                <p className="documents-info">Veuillez télécharger tous les documents requis avant de soumettre votre inscription.</p>
                
                <div className="file-requirements">
                  <h4>📋 Exigences des fichiers:</h4>
                  <ul>
                    <li>Formats acceptés: <strong>PNG, JPG, JPEG, PDF</strong></li>
                    <li>Taille maximale: <strong>2 MB</strong> par fichier</li>
                    <li>Assurez-vous que les documents sont clairs et lisibles</li>
                  </ul>
                </div>

                {/* Contest Selection for Payment Receipt */}
                <div className="contest-selection-section">
                  <label>Sélectionnez un concours pour le reçu de paiement *</label>
                  <select
                    id="contest-select"
                    onChange={(e) => {
                      const contestId = e.target.value
                      if (contestId && documents['payment_receipt']) {
                        // Si un reçu existe déjà, on peut le remplacer
                      }
                    }}
                  >
                    <option value="">-- Sélectionnez un concours --</option>
                    {contests.map((contest) => (
                      <option key={contest.id} value={contest.id}>
                        {contest.title} - {contest.registration_fee} FCFA
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="documents-grid">
                  {[
                    { type: 'bac_transcript', label: 'Relevé du Bac', icon: '📄' },
                    { type: 'birth_certificate', label: 'Acte de Naissance', icon: '📋' },
                    { type: 'valid_cni', label: 'CNI Valide', icon: '🆔' },
                    { type: 'photo_4x4_1', label: 'Photo 4x4 (1/4)', icon: '📸' },
                    { type: 'photo_4x4_2', label: 'Photo 4x4 (2/4)', icon: '📸' },
                    { type: 'photo_4x4_3', label: 'Photo 4x4 (3/4)', icon: '📸' },
                    { type: 'photo_4x4_4', label: 'Photo 4x4 (4/4)', icon: '📸' },
                    { type: 'payment_receipt', label: 'Reçu de Paiement', icon: '💳' },
                  ].map((doc) => (
                    <div key={doc.type} className="document-card">
                      <div className="document-header">
                        <span className="document-icon">{doc.icon}</span>
                        <span className="document-label">{doc.label}</span>
                      </div>
                      
                      {documents[doc.type] ? (
                        <div className="document-uploaded">
                          <div className="uploaded-info">
                            <span className="check-mark">✓</span>
                            <span className="filename">{documents[doc.type].original_filename}</span>
                          </div>
                          <div className="document-actions">
                            <button
                              type="button"
                              className="btn-view-doc"
                              onClick={() => handleViewDocument(doc.type)}
                            >
                              👁️ Voir
                            </button>
                            <button
                              type="button"
                              className="btn-delete-doc"
                              onClick={() => {
                                handleDeleteDocument(doc.type)
                                const newPreviews = { ...documentPreviews }
                                delete newPreviews[doc.type]
                                setDocumentPreviews(newPreviews)
                              }}
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="document-upload">
                          <input
                            type="file"
                            id={`file-${doc.type}`}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                if (doc.type === 'payment_receipt') {
                                  const contestId = document.getElementById('contest-select').value
                                  if (!contestId) {
                                    setError('Veuillez sélectionner un concours d\'abord')
                                    return
                                  }
                                  handleDocumentUpload(doc.type, e.target.files[0], contestId)
                                } else {
                                  handleDocumentUpload(doc.type, e.target.files[0])
                                }
                              }
                            }}
                            disabled={uploading[doc.type]}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                          <label htmlFor={`file-${doc.type}`} className="upload-label">
                            {uploading[doc.type] ? 'Téléchargement...' : 'Cliquez pour télécharger'}
                          </label>
                          {documentPreviews[doc.type] && (
                            <div className="document-preview">
                              <img 
                                src={documentPreviews[doc.type]}
                                alt={doc.label}
                                className="document-image"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form>
                {currentStepData?.fields.map((fieldName) => {
                  const fieldType = fieldTypes[fieldName] || 'text'
                  const label = fieldLabels[fieldName] || fieldName

                  return (
                    <div key={fieldName} className="form-group">
                      <label>{label} *</label>
                      {fieldType === 'textarea' ? (
                        <textarea
                          name={fieldName}
                          value={formData[fieldName] || ''}
                          onChange={handleChange}
                          placeholder={`Entrez ${label.toLowerCase()}`}
                          rows="4"
                        />
                      ) : fieldType === 'select' ? (
                        <select
                          name={fieldName}
                          value={formData[fieldName] || ''}
                          onChange={handleChange}
                        >
                          <option value="">Sélectionnez une option</option>
                          {fieldName === 'department_id' ? (
                            departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))
                          ) : fieldName === 'filiere_id' ? (
                            filieres.map((fil) => (
                              <option key={fil.id} value={fil.id}>
                                {fil.name}
                              </option>
                            ))
                          ) : fieldName === 'exam_center_id' ? (
                            examCenters.map((center) => (
                              <option key={center.id} value={center.id}>
                                {center.name} - {center.city}
                              </option>
                            ))
                          ) : fieldName === 'deposit_center_id' ? (
                            depositCenters.map((center) => (
                              <option key={center.id} value={center.id}>
                                {center.name} - {center.city}
                              </option>
                            ))
                          ) : (
                            (selectOptions[fieldName] || []).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <input
                          type={fieldType}
                          name={fieldName}
                          value={formData[fieldName] || ''}
                          onChange={handleChange}
                          placeholder={`Entrez ${label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  )
                })}
              </form>
            )}
          </div>

          {/* Actions */}
          <div className="enrollment-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              ← Précédent
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSave}
            >
              💾 Sauvegarder
            </button>

            {currentStep === steps.length ? (
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Soumission...' : '✓ Soumettre'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              >
                Suivant →
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            {steps.map((step) => (
              <button
                key={step.id}
                className={`progress-dot ${currentStep === step.id ? 'active' : ''} ${step.id < currentStep ? 'completed' : ''}`}
                onClick={() => setCurrentStep(step.id)}
                title={step.title}
              >
                {step.id < currentStep ? '✓' : step.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal pour voir le document */}
      {viewingDocument && (
        <div className="document-modal-overlay" onClick={() => setViewingDocument(null)}>
          <div className="document-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{viewingDocument.filename}</h3>
              <button 
                className="modal-close"
                onClick={() => setViewingDocument(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              {viewingDocument.mimeType?.startsWith('image/') ? (
                <>
                  <img 
                    src={viewingDocument.preview}
                    alt={viewingDocument.filename}
                    className="modal-image"
                  />
                  {viewingDocument.type === 'payment_receipt' && documents['payment_receipt'] && (
                    <div className="qr-code-overlay">
                      <QRCodeSVG 
                        value={`Transaction: ${documents['payment_receipt'].id}`}
                        size={100}
                        level="H"
                      />
                    </div>
                  )}
                </>
              ) : viewingDocument.mimeType === 'application/pdf' ? (
                <iframe
                  src={viewingDocument.preview}
                  title={viewingDocument.filename}
                  className="pdf-iframe"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
              ) : (
                <div className="file-viewer">
                  <p>📁 Fichier: {viewingDocument.filename}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
