import React, { useState, useEffect } from 'react'
import { contestAPI } from '../api/contest'
import { paymentAPI } from '../api/payment'
import { formatCurrency } from '../config/currency'
import '../styles/Contests.css'

export default function Contests() {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedContest, setSelectedContest] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processing, setProcessing] = useState(false)
  const [payment, setPayment] = useState(null)
  const [qrCode, setQrCode] = useState(null)
  const [paymentError, setPaymentError] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      const response = await contestAPI.listContests()
      setContests(response.data.contests)
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du chargement des concours')
      setLoading(false)
    }
  }

  const handleRegister = async (contestId) => {
    try {
      setRegistering(true)
      await contestAPI.registerForContest(contestId)
      alert('Inscription réussie!')
      setIsRegistered(true)
      fetchContests()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setRegistering(false)
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setPaymentError('')

    try {
      const response = await paymentAPI.initiatePayment({
        contest_id: selectedContest.id,
        payment_method: paymentMethod,
      })

      setPayment(response.data.payment)
      setQrCode(response.data.qr_code_url)
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setProcessing(false)
    }
  }

  const downloadReceipt = () => {
    if (payment) {
      window.open(`/api/payment/receipt/${payment.transaction_id}`, '_blank')
    }
  }

  const handleCloseModal = () => {
    setSelectedContest(null)
    setPayment(null)
    setQrCode(null)
    setPaymentError('')
    setPaymentMethod('card')
    setIsRegistered(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="contests-container"><p>Chargement...</p></div>
  }

  return (
    <div className="contests-container">
      <header className="contests-header">
        <h1>Concours disponibles</h1>
        <p>Découvrez et inscrivez-vous aux concours</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="contests-grid">
        {contests.length === 0 ? (
          <p className="no-contests">Aucun concours disponible pour le moment</p>
        ) : (
          contests.map((contest) => (
            <div key={contest.id} className="contest-card">
              <div className="contest-header">
                <h3>{contest.title}</h3>
                <span className={`status-badge ${contest.status}`}>
                  {contest.status === 'open' ? 'Ouvert' : 
                   contest.status === 'upcoming' ? 'À venir' :
                   contest.status === 'closed' ? 'Fermé' : contest.status}
                </span>
              </div>

              <p className="contest-description">{contest.description}</p>

              <div className="contest-details">
                <div className="detail-item">
                  <span className="label">📅 Date du concours:</span>
                  <span className="value">
                    {formatDate(contest.contest_date)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">📝 Inscription jusqu'au:</span>
                  <span className="value">
                    {formatDate(contest.registration_end_date)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">📍 Lieu:</span>
                  <span className="value">{contest.location || 'À définir'}</span>
                </div>

                <div className="detail-item">
                  <span className="label">💰 Frais d'inscription:</span>
                  <span className="value">{formatCurrency(contest.registration_fee)}</span>
                </div>

                <div className="detail-item">
                  <span className="label">👥 Participants:</span>
                  <span className="value">
                    {contest.current_participants}
                    {contest.max_participants ? `/${contest.max_participants}` : ' (illimité)'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="label">🏢 Organisateur:</span>
                  <span className="value">{contest.organizer}</span>
                </div>
              </div>

              <button
                className={`btn ${contest.is_open ? 'btn-primary' : 'btn-disabled'}`}
                onClick={() => setSelectedContest(contest)}
                disabled={!contest.is_open}
              >
                {contest.is_open ? 'Voir les détails' : 'Inscriptions fermées'}
              </button>
            </div>
          ))
        )}
      </div>

      {selectedContest && (
        <div className="modal-overlay" onClick={() => handleCloseModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => handleCloseModal()}>✕</button>
            
            <h2>{selectedContest.title}</h2>
            
            <div className="modal-status">
              <span className={`status-badge ${selectedContest.status}`}>
                {selectedContest.status === 'open' ? 'Ouvert' : 
                 selectedContest.status === 'upcoming' ? 'À venir' :
                 selectedContest.status === 'closed' ? 'Fermé' : selectedContest.status}
              </span>
            </div>

            <p className="modal-description">{selectedContest.description}</p>

            <div className="modal-details">
              <h4>📋 Détails du concours</h4>
              <div className="details-grid">
                <div className="detail-box">
                  <strong>Date du concours</strong>
                  <p>{formatDate(selectedContest.contest_date)}</p>
                </div>

                <div className="detail-box">
                  <strong>Lieu</strong>
                  <p>{selectedContest.location || 'À définir'}</p>
                </div>

                <div className="detail-box">
                  <strong>Frais d'inscription</strong>
                  <p>{formatCurrency(selectedContest.registration_fee)}</p>
                </div>

                <div className="detail-box">
                  <strong>Participants</strong>
                  <p>{selectedContest.current_participants} {selectedContest.max_participants ? `/ ${selectedContest.max_participants}` : '(illimité)'}</p>
                </div>

                <div className="detail-box">
                  <strong>Début des inscriptions</strong>
                  <p>{formatDate(selectedContest.registration_start_date)}</p>
                </div>

                <div className="detail-box">
                  <strong>Fin des inscriptions</strong>
                  <p>{formatDate(selectedContest.registration_end_date)}</p>
                </div>
              </div>

              {selectedContest.requirements && (
                <div className="info-section">
                  <h4>📌 Conditions requises</h4>
                  <p>{selectedContest.requirements}</p>
                </div>
              )}

              {selectedContest.prizes && (
                <div className="info-section">
                  <h4>🏆 Prix</h4>
                  <p>{selectedContest.prizes}</p>
                </div>
              )}

              <div className="info-section">
                <h4>👤 Informations de l'organisateur</h4>
                <p><strong>Nom:</strong> {selectedContest.organizer}</p>
                {selectedContest.contact_email && (
                  <p><strong>Email:</strong> <a href={`mailto:${selectedContest.contact_email}`}>{selectedContest.contact_email}</a></p>
                )}
                {selectedContest.contact_phone && (
                  <p><strong>Téléphone:</strong> <a href={`tel:${selectedContest.contact_phone}`}>{selectedContest.contact_phone}</a></p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              {!payment ? (
                <>
                  {!isRegistered ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleRegister(selectedContest.id)}
                      disabled={registering || !selectedContest.is_open}
                    >
                      {registering ? 'Inscription en cours...' : '✓ S\'inscrire'}
                    </button>
                  ) : (
                    <div className="payment-form-inline">
                      <h4>💳 Paiement des frais d'inscription</h4>
                      {paymentError && <div className="error-message">{paymentError}</div>}
                      
                      <form onSubmit={handlePayment} className="inline-payment-form">
                        <div className="payment-summary-inline">
                          <span>Montant à payer:</span>
                          <strong>{formatCurrency(selectedContest.registration_fee)}</strong>
                        </div>

                        <div className="form-group-inline">
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
                          className="btn btn-primary"
                          disabled={processing}
                        >
                          {processing ? 'Traitement...' : 'Payer maintenant'}
                        </button>
                      </form>
                    </div>
                  )}
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCloseModal()}
                  >
                    Fermer
                  </button>
                </>
              ) : (
                <div className="payment-success-inline">
                  <h4>✓ Paiement réussi!</h4>
                  <div className="payment-info">
                    <p><strong>ID Transaction:</strong> {payment.transaction_id}</p>
                    <p><strong>Montant:</strong> {formatCurrency(payment.amount)}</p>
                    <p><strong>Statut:</strong> {payment.status === 'pending' ? '⏳ En attente' : '✓ Complété'}</p>
                  </div>

                  {qrCode && (
                    <div className="qr-code-inline">
                      <img src={qrCode} alt="QR Code" />
                      <p>Scannez pour vérifier</p>
                    </div>
                  )}

                  <div className="payment-actions">
                    <button 
                      onClick={downloadReceipt}
                      className="btn btn-primary"
                    >
                      📥 Télécharger le reçu
                    </button>
                    <button 
                      onClick={() => handleCloseModal()}
                      className="btn btn-secondary"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
