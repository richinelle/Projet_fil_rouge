import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contestAPI } from '../api/contest'
import { paymentAPI } from '../api/payment'
import { formatCurrency } from '../config/currency'
import '../styles/ContestPayment.css'

export default function ContestPayment() {
  const navigate = useNavigate()
  const candidate = JSON.parse(localStorage.getItem('candidate') || '{}')
  const token = localStorage.getItem('token')

  const [myContests, setMyContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContest, setSelectedContest] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [payment, setPayment] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyContests()
  }, [])

  const fetchMyContests = async () => {
    try {
      const response = await contestAPI.getMyCandidateContests()
      // Filter contests that are not yet paid
      const unpaidContests = response.data.contests.filter(
        (reg) => reg.registration_status === 'registered'
      )
      setMyContests(unpaidContests)
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement de vos concours')
      setLoading(false)
    }
  }

  const handleSelectContest = (contest) => {
    setSelectedContest(contest)
    setError('')
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!selectedContest) {
      setError('Veuillez sélectionner un concours')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await paymentAPI.initiatePayment({
        contest_id: selectedContest.contest.id,
        payment_method: paymentMethod,
      })

      setPayment(response.data.payment)
      setQrCode(response.data.qr_code_url)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setProcessing(false)
    }
  }

  const downloadReceipt = () => {
    if (payment) {
      window.open(`/api/payment/receipt/${payment.transaction_id}`, '_blank')
    }
  }

  const handleNewPayment = () => {
    setPayment(null)
    setQrCode(null)
    setSelectedContest(null)
    setPaymentMethod('card')
    setError('')
    fetchMyContests()
  }

  if (loading) {
    return <div className="contest-payment"><p>Chargement...</p></div>
  }

  return (
    <div className="contest-payment">
      <header className="payment-header">
        <h1>Paiement des frais d'inscription</h1>
        <p>Sélectionnez un concours et effectuez le paiement</p>
      </header>

      <div className="payment-container">
        {!payment ? (
          <div className="payment-form-section">
            {error && <div className="error-message">{error}</div>}

            <div className="contests-selection">
              <h2>Mes concours</h2>
              
              {myContests.length === 0 ? (
                <div className="no-contests-message">
                  <p>Vous n'avez aucun concours en attente de paiement.</p>
                  <button 
                    onClick={() => navigate('/contests')}
                    className="btn btn-primary"
                  >
                    Voir les concours disponibles
                  </button>
                </div>
              ) : (
                <div className="contests-list">
                  {myContests.map((registration) => (
                    <div
                      key={registration.id}
                      className={`contest-selection-card ${
                        selectedContest?.id === registration.id ? 'selected' : ''
                      }`}
                      onClick={() => handleSelectContest(registration)}
                    >
                      <div className="contest-selection-header">
                        <h3>{registration.contest.title}</h3>
                        <span className="registration-status">
                          {registration.registration_status === 'registered' ? '✓ Inscrit' : registration.registration_status}
                        </span>
                      </div>
                      
                      <p className="contest-description">
                        {registration.contest.description}
                      </p>

                      <div className="contest-selection-details">
                        <div className="detail">
                          <span className="label">Date:</span>
                          <span className="value">
                            {new Date(registration.contest.contest_date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="detail">
                          <span className="label">Lieu:</span>
                          <span className="value">
                            {registration.contest.location || 'À définir'}
                          </span>
                        </div>
                        <div className="detail fee">
                          <span className="label">Frais d'inscription:</span>
                          <span className="value">
                            {formatCurrency(registration.contest.registration_fee)}
                          </span>
                        </div>
                      </div>

                      {selectedContest?.id === registration.id && (
                        <div className="selection-indicator">✓ Sélectionné</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedContest && (
              <form onSubmit={handlePayment} className="payment-form">
                <div className="form-section">
                  <h3>Détails du paiement</h3>
                  
                  <div className="payment-summary">
                    <div className="summary-item">
                      <span>Concours:</span>
                      <strong>{selectedContest.contest.title}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Montant à payer:</span>
                      <strong className="amount">
                        {formatCurrency(selectedContest.contest.registration_fee)}
                      </strong>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Méthode de paiement</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      <option value="card">💳 Carte Bancaire</option>
                      <option value="om">📱 Orange Money</option>
                      <option value="mtn_money">📱 MTN Money</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-large"
                    disabled={processing}
                  >
                    {processing ? 'Traitement en cours...' : 'Procéder au paiement'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="payment-success-section">
            <div className="success-message">
              <h2>✓ Paiement initié avec succès!</h2>
              <p>Votre reçu de paiement a été généré avec un code QR.</p>
            </div>

            {/* Receipt Display */}
            <div className="receipt-container">
              <div className="receipt-header">
                <h3>REÇU DE PAIEMENT</h3>
                <p className="receipt-subtitle">SGEE - Système de Gestion des Examens d'Entrée</p>
              </div>

              <div className="receipt-content">
                <div className="receipt-section">
                  <h4>Informations de la Transaction</h4>
                  <div className="receipt-row">
                    <span className="label">ID Transaction:</span>
                    <span className="value">{payment.transaction_id}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(payment.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="receipt-section">
                  <h4>Informations du Candidat</h4>
                  <div className="receipt-row">
                    <span className="label">Nom:</span>
                    <span className="value">{candidate.first_name} {candidate.last_name}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="label">Email:</span>
                    <span className="value">{candidate.email}</span>
                  </div>
                </div>

                <div className="receipt-section">
                  <h4>Détails du Concours</h4>
                  <div className="receipt-row">
                    <span className="label">Concours:</span>
                    <span className="value">{payment.contest?.title || 'Concours'}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="label">Montant:</span>
                    <span className="value amount">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="label">Méthode de Paiement:</span>
                    <span className="value">
                      {payment.payment_method === 'card' ? '💳 Carte Bancaire' :
                       payment.payment_method === 'om' ? '📱 Orange Money' :
                       '📱 MTN Money'}
                    </span>
                  </div>
                  <div className="receipt-row">
                    <span className="label">Statut:</span>
                    <span className={`value status ${payment.status}`}>
                      {payment.status === 'pending' ? '⏳ En attente' : '✓ Complété'}
                    </span>
                  </div>
                </div>

                {qrCode && (
                  <div className="receipt-section qr-section">
                    <h4>Code QR de Vérification</h4>
                    <div className="qr-code-container">
                      <img src={qrCode} alt="QR Code" className="qr-code" />
                      <p className="qr-description">
                        Scannez ce code QR pour vérifier votre paiement
                      </p>
                    </div>
                  </div>
                )}

                <div className="receipt-footer">
                  <p>Merci pour votre paiement!</p>
                  <p className="footer-note">Conservez ce reçu pour vos dossiers</p>
                </div>
              </div>
            </div>

            <div className="payment-details">
              <h3>Détails de la transaction</h3>
              
              <div className="details-grid">
                <div className="detail-box">
                  <strong>Concours</strong>
                  <p>{payment.contest?.title || 'Concours'}</p>
                </div>

                <div className="detail-box">
                  <strong>ID de transaction</strong>
                  <p className="transaction-id">{payment.transaction_id}</p>
                </div>

                <div className="detail-box">
                  <strong>Montant</strong>
                  <p className="amount">{formatCurrency(payment.amount)}</p>
                </div>

                <div className="detail-box">
                  <strong>Méthode</strong>
                  <p>
                    {payment.payment_method === 'card' ? '💳 Carte Bancaire' :
                     payment.payment_method === 'om' ? '📱 Orange Money' :
                     '📱 MTN Money'}
                  </p>
                </div>

                <div className="detail-box">
                  <strong>Statut</strong>
                  <p className="status">{payment.status === 'pending' ? '⏳ En attente' : '✓ Complété'}</p>
                </div>

                <div className="detail-box">
                  <strong>Date</strong>
                  <p>{new Date(payment.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={downloadReceipt}
                className="btn btn-primary"
              >
                📥 Télécharger le reçu
              </button>
              <button 
                onClick={handleNewPayment}
                className="btn btn-secondary"
              >
                ➕ Nouveau paiement
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-tertiary"
              >
                ← Retour au tableau de bord
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
