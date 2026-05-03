import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const candidate = JSON.parse(localStorage.getItem('candidate') || '{}')
  const token = localStorage.getItem('token')

  const [stats, setStats] = useState({
    enrollmentStatus: 'not_started',
    enrollmentProgress: 0,
    documentsCount: 0,
    paymentsCount: 0,
    contestsCount: 0,
    hasCertificate: false,
    candidateCode: null,
  })
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [availableContests, setAvailableContests] = useState([])
  const [selectedContestForPayment, setSelectedContestForPayment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [registeredContests, setRegisteredContests] = useState([])
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [viewingDocument, setViewingDocument] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [contestSearchTerm, setContestSearchTerm] = useState('')
  const [contestStatusFilter, setContestStatusFilter] = useState('all')
  const [contestPriceFilter, setContestPriceFilter] = useState('all')
  const [contestLocationFilter, setContestLocationFilter] = useState('all')

  useEffect(() => {
    fetchStats()
    fetchDocuments()
    fetchAvailableContests()
    fetchPayments()
    fetchNotifications()
  }, [])

  // Refresh contests when returning from payment
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAvailableContests()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Refresh when returning from payment receipt
  useEffect(() => {
    if (location.state?.refresh) {
      fetchAvailableContests()
    }
  }, [location.state?.refresh])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // Fetch enrollment status
      const enrollmentRes = await axios.get('http://localhost:8000/api/enrollment/status', {
        headers: { Authorization: `Bearer ${token}` },
      })

      setStats({
        enrollmentStatus: enrollmentRes.data.status || 'not_started',
        enrollmentProgress: enrollmentRes.data.progress || 0,
        documentsCount: 0,
        paymentsCount: 0,
        contestsCount: 0,
        hasCertificate: enrollmentRes.data.has_certificate || false,
        candidateCode: enrollmentRes.data.candidate_code || null,
      })
      setLoading(false)
    } catch (err) {
      console.error('Erreur:', err)
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/my-contests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const paymentsCount = response.data.contests?.length || 0
      setStats(prev => ({
        ...prev,
        paymentsCount: paymentsCount,
        contestsCount: paymentsCount
      }))
    } catch (err) {
      console.error('Erreur lors de la récupération des paiements:', err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notifications/unread', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.notifications?.length || 0)
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications:', err)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/enrollment/documents', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDocuments(response.data.documents || [])
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const fetchAvailableContests = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/contests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAvailableContests(response.data.contests || [])

      // Fetch registered contests
      const registeredRes = await axios.get('http://localhost:8000/api/my-contests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const registeredIds = registeredRes.data.contests?.map(c => c.contest?.id || c.id) || []
      setRegisteredContests(registeredIds)
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handlePaymentClick = async (contest) => {
    setSelectedContestForPayment(contest)
  }

  const handleProcessPayment = async () => {
    if (!selectedContestForPayment) return

    try {
      setProcessingPayment(true)
      const response = await axios.post(
        'http://localhost:8000/api/payment/initiate',
        {
          contest_id: selectedContestForPayment.id,
          payment_method: paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Redirect to payment receipt page
      navigate(`/payment-receipt?transaction=${response.data.payment.transaction_id}`)
    } catch (err) {
      console.error('Erreur:', err)
      alert(err.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('candidate')
    localStorage.removeItem('userRole')
    navigate('/login')
  }

  const getFilteredContests = () => {
    return availableContests.filter(contest => {
      // Filtre par terme de recherche
      const matchesSearch = contest.title.toLowerCase().includes(contestSearchTerm.toLowerCase()) ||
        (contest.description && contest.description.toLowerCase().includes(contestSearchTerm.toLowerCase()))

      // Filtre par statut
      const isOpen = contest.is_open && new Date(contest.registration_end_date) >= new Date()
      const matchesStatus = contestStatusFilter === 'all' ||
        (contestStatusFilter === 'open' && isOpen) ||
        (contestStatusFilter === 'closed' && !isOpen)

      // Filtre par prix
      const matchesPrice = contestPriceFilter === 'all' ||
        (contestPriceFilter === '0-50000' && contest.registration_fee <= 50000) ||
        (contestPriceFilter === '50000-100000' && contest.registration_fee > 50000 && contest.registration_fee <= 100000) ||
        (contestPriceFilter === '100000+' && contest.registration_fee > 100000)

      // Filtre par lieu
      const matchesLocation = contestLocationFilter === 'all' ||
        (contest.location && contest.location.toLowerCase().includes(contestLocationFilter.toLowerCase()))

      return matchesSearch && matchesStatus && matchesPrice && matchesLocation
    })
  }

  const getUniqueLocations = () => {
    const locations = availableContests
      .map(c => c.location)
      .filter((location, index, self) => location && self.indexOf(location) === index)
    return locations.sort()
  }

  const handleViewDocument = async (doc) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/enrollment/documents/${doc.id}/view`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: doc.mime_type })
      const preview = URL.createObjectURL(blob)

      setViewingDocument({
        preview: preview,
        filename: doc.original_filename,
        mimeType: doc.mime_type,
        fileSize: doc.file_size
      })
    } catch (err) {
      console.error('Erreur lors du chargement du document:', err)
      alert('Impossible de charger le document')
    }
  }

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    try {
      await axios.delete(`http://localhost:8000/api/enrollment/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Refresh documents list
      fetchDocuments()
      alert('Document supprimé avec succès')
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      alert(err.response?.data?.message || 'Erreur lors de la suppression du document')
    }
  }

  const handleDownloadCertificate = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/enrollment/certificate', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fiche_inscription_${stats.candidateCode}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur lors du téléchargement de la fiche:', err)
      alert(err.response?.data?.message || 'Erreur lors du téléchargement de la fiche')
    }
  }

  const menuItems = [
    { icon: '▦', label: 'Tableau de bord', path: '/dashboard' },
    { icon: '👤', label: 'Mon Profil', path: '/profile' },
    { icon: '✎', label: 'Inscription', path: '/enrollment', badge: stats.enrollmentStatus === 'submitted' ? '✓' : null },
    { icon: '⊞', label: 'Mes Documents', path: '#documents', badge: documents.length, action: 'scrollDocuments' },
    { icon: '◆', label: 'Paiements', path: '/payment', badge: stats.paymentsCount },
    { icon: '★', label: 'Concours', path: '/contests', badge: stats.contestsCount },
  ]

  return (
    <div className="candidate-dashboard-layout">
      {/* Top Navigation */}
      <nav className="candidate-top-nav">
        <div className="nav-left">
          <h1 className="nav-logo">SGEE</h1>
        </div>
        <div className="nav-center">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`nav-link ${item.path === '/dashboard' ? 'active' : ''}`}
              onClick={(e) => {
                if (item.action === 'scrollDocuments') {
                  e.preventDefault()
                  const docSection = document.querySelector('.documents-section')
                  if (docSection) {
                    docSection.scrollIntoView({ behavior: 'smooth' })
                  }
                } else if (item.path.startsWith('/')) {
                  e.preventDefault()
                  navigate(item.path)
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span
                  className="nav-badge"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (item.label === 'Paiements') {
                      navigate('/payment')
                    } else if (item.label === 'Concours') {
                      navigate('/contests-selection')
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <span className="user-info">{candidate.first_name} {candidate.last_name}</span>
          <button className="logout-btn-nav" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="candidate-main-content">
        <div className="content-header">
          <h1>Bienvenue, {candidate.first_name}!</h1>
          <p>Gérez votre inscription, documents et paiements</p>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <>
            {/* Notifications Section */}
            {notifications.length > 0 && (
              <section className="notifications-section">
                <h2>🔔 Notifications ({unreadCount})</h2>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-icon">
                        {notification.type === 'enrollment_submitted_candidate' && '📋'}
                        {notification.type === 'enrollment_approved' && '✓'}
                        {notification.type === 'enrollment_rejected' && '❌'}
                        {!['enrollment_submitted_candidate', 'enrollment_approved', 'enrollment_rejected'].includes(notification.type) && '📢'}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {new Date(notification.created_at).toLocaleDateString('fr-FR')}
                        </div>
                        {notification.data?.action_url && (
                          <button
                            className="notification-action-btn"
                            onClick={() => navigate(notification.data.action_url)}
                          >
                            {notification.data.action_label || 'Voir plus'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Status Section */}
            <section className="stats-section">
              <h2>Statut de votre inscription</h2>
              <div className="status-card">
                <div className="status-icon">
                  {stats.hasCertificate ? '✓' :
                    stats.enrollmentStatus === 'submitted' ? '✓' : '⏳'}
                </div>
                <div className="status-content">
                  <div className="status-title">
                    {stats.hasCertificate ? 'Inscription terminée' :
                      stats.enrollmentStatus === 'submitted' ? 'Inscription soumise' : 'Inscription en cours'}
                  </div>
                  <div className="status-description">
                    {stats.hasCertificate
                      ? 'Félicitations ! Votre inscription est complète et approuvée.'
                      : stats.enrollmentStatus === 'submitted'
                        ? 'Votre inscription a été soumise avec succès'
                        : 'Complétez votre inscription pour participer aux concours'}
                  </div>
                </div>
              </div>
            </section>

            {/* Certificate Section */}
            {stats.hasCertificate && (
              <section className="stats-section certificate-section">
                <h2>📜 Votre Fiche d'Inscription</h2>
                <div className="certificate-card">
                  <div className="certificate-icon">📋</div>
                  <div className="certificate-content">
                    <div className="certificate-title">Fiche d'Inscription Approuvée</div>
                    <div className="certificate-code">Code Candidat: <strong>{stats.candidateCode}</strong></div>
                    <div className="certificate-description">
                      Votre candidature a été approuvée. Consultez et téléchargez votre fiche d'inscription avec toutes vos informations.
                    </div>
                  </div>
                  <div className="certificate-actions">
                    <button
                      className="btn-view-certificate"
                      onClick={() => navigate('/certificate')}
                    >
                      👁️ Consulter
                    </button>
                    <button
                      className="btn-download-certificate"
                      onClick={handleDownloadCertificate}
                    >
                      📥 Télécharger
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Quick Stats */}
            <section className="stats-section">
              <h2>Résumé</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">✎</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.enrollmentProgress}%</div>
                    <div className="stat-label">Inscription</div>
                  </div>
                </div>

                <div className="stat-card" onClick={() => setShowDocumentsModal(true)} style={{ cursor: 'pointer' }}>
                  <div className="stat-icon">⊞</div>
                  <div className="stat-content">
                    <div className="stat-number">{documents.length}</div>
                    <div className="stat-label">Documents</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">◆</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.paymentsCount}</div>
                    <div className="stat-label">Paiements</div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">★</div>
                  <div className="stat-content">
                    <div className="stat-number">{stats.contestsCount}</div>
                    <div className="stat-label">Concours</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
              <h2>Actions rapides</h2>
              <div className="actions-grid">
                <button
                  className="action-btn"
                  onClick={() => navigate('/enrollment')}
                >
                  <span className="action-icon">✎</span>
                  <span className="action-label">Compléter l'inscription</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => navigate('/contests-selection')}
                >
                  <span className="action-icon">★</span>
                  <span className="action-label">Payer un concours</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => {
                    const docSection = document.querySelector('.documents-section')
                    if (docSection) {
                      docSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <span className="action-icon">⊞</span>
                  <span className="action-label">Voir mes documents</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => navigate('/payment')}
                >
                  <span className="action-icon">◆</span>
                  <span className="action-label">Historique paiements</span>
                </button>
              </div>
            </section>

            {/* Contests Section */}
            {availableContests.length > 0 && (
              <section className="contests-section">
                <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '1rem' }}>🏆 Concours Disponibles</h2>
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                  Découvrez et inscrivez-vous aux concours disponibles pour votre avenir.
                </p>

                {/* Filters Section */}
                <div className="contests-filters">
                  <div className="filter-group">
                    <input
                      type="text"
                      placeholder="🔍 Rechercher un concours..."
                      value={contestSearchTerm}
                      onChange={(e) => setContestSearchTerm(e.target.value)}
                      className="filter-input"
                    />
                  </div>

                  <div className="filters-row">
                    <div className="filter-group">
                      <label>Statut:</label>
                      <select
                        value={contestStatusFilter}
                        onChange={(e) => setContestStatusFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">Tous les concours</option>
                        <option value="open">Ouvert</option>
                        <option value="closed">Fermé</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Frais d'inscription:</label>
                      <select
                        value={contestPriceFilter}
                        onChange={(e) => setContestPriceFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">Tous les prix</option>
                        <option value="0-50000">0 - 50 000 FCFA</option>
                        <option value="50000-100000">50 000 - 100 000 FCFA</option>
                        <option value="100000+">100 000+ FCFA</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Lieu:</label>
                      <select
                        value={contestLocationFilter}
                        onChange={(e) => setContestLocationFilter(e.target.value)}
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
                        setContestSearchTerm('')
                        setContestStatusFilter('all')
                        setContestPriceFilter('all')
                        setContestLocationFilter('all')
                      }}
                    >
                      ↻ Réinitialiser
                    </button>
                  </div>
                </div>

                {/* Filtered Contests */}
                {getFilteredContests().length > 0 ? (
                  <>
                    {/* Open Contests */}
                    {getFilteredContests().filter(c => c.is_open && new Date(c.registration_end_date) >= new Date()).length > 0 && (
                      <div className="contests-subsection">
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>📖 Concours Ouverts</h3>
                        <div className="contests-grid-compact">
                          {getFilteredContests().filter(c => c.is_open && new Date(c.registration_end_date) >= new Date()).map((contest) => (
                            <div key={contest.id} className="contest-card-compact open-contest">
                              <div className="compact-icon-wrapper">
                                🏆
                              </div>

                              <div className="compact-header">
                                <h4 className="compact-title">{contest.title}</h4>
                                <span className="compact-badge open-badge">Ouvert</span>
                              </div>

                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                                {contest.description ?
                                  (contest.description.length > 60 ? contest.description.substring(0, 60) + '...' : contest.description) :
                                  "Inscrivez-vous dès maintenant."}
                              </p>

                              <div className="compact-info">
                                <div className="compact-row">
                                  <span>📅 Date:</span>
                                  <span className="compact-value">{new Date(contest.contest_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="compact-row">
                                  <span>⏳ Fin:</span>
                                  <span className="compact-value" style={{ color: '#EA580C' }}>{new Date(contest.registration_end_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="compact-row">
                                  <span>📍 Lieu:</span>
                                  <span className="compact-value">{contest.location || 'À définir'}</span>
                                </div>
                                <div className="compact-row" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                                  <span>💰 Frais:</span>
                                  <span className="compact-value" style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{contest.registration_fee} FCFA</span>
                                </div>
                              </div>

                              <div className="contest-buttons-container">
                                <button
                                  className="btn-compact-pay"
                                  onClick={() => navigate('/enrollment')}
                                >
                                  S'inscrire
                                </button>
                                <button
                                  className="btn-compact-pay"
                                  onClick={() => handlePaymentClick(contest)}
                                  disabled={registeredContests.includes(contest.id)}
                                >
                                  {registeredContests.includes(contest.id) ? '✓ Payé' : '💳 Payer'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Closed Contests */}
                    {getFilteredContests().filter(c => !c.is_open || new Date(c.registration_end_date) < new Date()).length > 0 && (
                      <div className="contests-subsection" style={{ marginTop: '3rem' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem', opacity: 0.7 }}>🔒 Concours Fermés</h3>
                        <div className="contests-grid-compact">
                          {getFilteredContests().filter(c => !c.is_open || new Date(c.registration_end_date) < new Date()).map((contest) => (
                            <div key={contest.id} className="contest-card-compact closed-contest" style={{ opacity: 0.8 }}>
                              <div className="compact-icon-wrapper" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>
                                🔒
                              </div>

                              <div className="compact-header">
                                <h4 className="compact-title">{contest.title}</h4>
                                <span className="compact-badge closed-badge">Fermé</span>
                              </div>

                              <div className="compact-info">
                                <div className="compact-row">
                                  <span>📅 Date:</span>
                                  <span className="compact-value">{new Date(contest.contest_date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="compact-row">
                                  <span>📍 Lieu:</span>
                                  <span className="compact-value">{contest.location || 'À définir'}</span>
                                </div>
                              </div>

                              <button
                                className="btn-compact-pay disabled-btn"
                                disabled={true}
                                style={{ marginTop: '1.5rem', borderColor: '#E5E7EB', color: '#9CA3AF', background: 'transparent' }}
                              >
                                Inscriptions Closes
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-contests-filtered">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                    <h3>Aucun concours trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                    <button
                      className="filter-reset-btn"
                      onClick={() => {
                        setContestSearchTerm('')
                        setContestStatusFilter('all')
                        setContestPriceFilter('all')
                        setContestLocationFilter('all')
                      }}
                    >
                      ↻ Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Payment Modal */}
            {selectedContestForPayment && (
              <div className="payment-modal-overlay" onClick={() => setSelectedContestForPayment(null)}>
                <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Paiement - {selectedContestForPayment.title}</h3>
                    <button
                      className="close-btn"
                      onClick={() => setSelectedContestForPayment(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-content">
                    <div className="payment-info">
                      <div className="info-row">
                        <span className="label">Concours:</span>
                        <span className="value">{selectedContestForPayment.title}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Montant:</span>
                        <span className="value amount">{selectedContestForPayment.registration_fee} FCFA</span>
                      </div>
                    </div>

                    <div className="payment-method-section">
                      <label>Méthode de paiement:</label>
                      <div className="payment-methods">
                        <label className="payment-option">
                          <input
                            type="radio"
                            value="card"
                            checked={paymentMethod === 'card'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>💳 Carte Bancaire</span>
                        </label>
                        <label className="payment-option">
                          <input
                            type="radio"
                            value="om"
                            checked={paymentMethod === 'om'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>📱 Orange Money</span>
                        </label>
                        <label className="payment-option">
                          <input
                            type="radio"
                            value="mtn_money"
                            checked={paymentMethod === 'mtn_money'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          />
                          <span>📱 MTN Money</span>
                        </label>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => setSelectedContestForPayment(null)}
                      >
                        Annuler
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleProcessPayment}
                        disabled={processingPayment}
                      >
                        {processingPayment ? 'Traitement...' : 'Confirmer le paiement'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            <section className="documents-section">
              <h2>📄 Mes Documents</h2>
              {documents.length > 0 ? (
                <div className="documents-list">
                  {documents.map((doc) => {
                    const docTypeLabels = {
                      'bac_transcript': 'Relevé du Bac',
                      'birth_certificate': 'Acte de Naissance',
                      'valid_cni': 'CNI Valide',
                      'photo_4x4_1': 'Photo 4x4 (1/4)',
                      'photo_4x4_2': 'Photo 4x4 (2/4)',
                      'photo_4x4_3': 'Photo 4x4 (3/4)',
                      'photo_4x4_4': 'Photo 4x4 (4/4)',
                      'payment_receipt': 'Reçu de Paiement',
                    }

                    return (
                      <div key={doc.id} className="document-item">
                        <div className="document-info">
                          <div className="document-type">
                            {docTypeLabels[doc.document_type] || doc.document_type}
                          </div>
                          <div className="document-filename">{doc.original_filename}</div>
                          <div className="document-size">
                            {(doc.file_size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                        <div className="document-actions">
                          <button
                            className="btn-view"
                            onClick={() => handleViewDocument(doc)}
                          >
                            👁️ Voir
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="no-documents">
                  <div className="no-documents-icon">📭</div>
                  <div className="no-documents-text">Aucun document téléchargé</div>
                  <div className="no-documents-hint">Complétez votre inscription pour télécharger vos documents</div>
                  <button
                    className="btn-add-documents"
                    onClick={() => navigate('/enrollment')}
                  >
                    Aller à l'inscription
                  </button>
                </div>
              )}
            </section>

            {/* Documents Modal */}
            {showDocumentsModal && (
              <div className="documents-modal-overlay" onClick={() => setShowDocumentsModal(false)}>
                <div className="documents-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>📄 Mes Documents ({documents.length})</h3>
                    <button
                      className="close-btn"
                      onClick={() => setShowDocumentsModal(false)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-content">
                    {documents.length > 0 ? (
                      <div className="documents-list">
                        {documents.map((doc) => {
                          const docTypeLabels = {
                            'bac_transcript': 'Relevé du Bac',
                            'birth_certificate': 'Acte de Naissance',
                            'valid_cni': 'CNI Valide',
                            'photo_4x4_1': 'Photo 4x4 (1/4)',
                            'photo_4x4_2': 'Photo 4x4 (2/4)',
                            'photo_4x4_3': 'Photo 4x4 (3/4)',
                            'photo_4x4_4': 'Photo 4x4 (4/4)',
                            'payment_receipt': 'Reçu de Paiement',
                          }

                          return (
                            <div key={doc.id} className="document-item">
                              <div className="document-info">
                                <div className="document-type">
                                  {docTypeLabels[doc.document_type] || doc.document_type}
                                </div>
                                <div className="document-filename">{doc.original_filename}</div>
                                <div className="document-size">
                                  {(doc.file_size / 1024).toFixed(2)} KB
                                </div>
                              </div>
                              <div className="document-actions">
                                <button
                                  className="btn-view"
                                  onClick={() => handleViewDocument(doc)}
                                >
                                  👁️ Voir
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                >
                                  🗑️ Supprimer
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="no-documents">
                        <div className="no-documents-icon">📭</div>
                        <div className="no-documents-text">Aucun document</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View Document Modal */}
            {viewingDocument && (
              <div className="view-document-modal-overlay" onClick={() => setViewingDocument(null)}>
                <div className="view-document-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>{viewingDocument.filename}</h3>
                    <button
                      className="close-btn"
                      onClick={() => setViewingDocument(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-content">
                    {viewingDocument.mimeType?.startsWith('image/') ? (
                      <img
                        src={viewingDocument.preview}
                        alt={viewingDocument.filename}
                        className="modal-image"
                      />
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
          </>
        )}
      </main>
    </div>
  )
}
