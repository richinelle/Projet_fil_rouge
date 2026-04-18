import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/ContestsSelection.css'

export default function ContestsSelection() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const candidate = JSON.parse(localStorage.getItem('candidate') || '{}')

  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContest, setSelectedContest] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paidContests, setPaidContests] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchContests()
    fetchPaidContests()
  }, [])

  const fetchContests = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/contests')
      setContests(response.data.contests || [])
      setLoading(false)
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors du chargement des concours')
      setLoading(false)
    }
  }

  const fetchPaidContests = async () => {
    try {
      if (!token) return
      
      const response = await axios.get('http://localhost:8000/api/my-contests', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const paidIds = response.data.contests
        ?.filter(c => {
          // Check if there's a completed payment for this contest
          return c.contest?.id
        })
        ?.map(c => c.contest?.id || c.id) || []
      setPaidContests(paidIds)
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handlePayment = async () => {
    if (!selectedContest) return

    try {
      setProcessingPayment(true)
      setError('')

      // Initiate payment (which also registers for contest)
      const paymentResponse = await axios.post(
        'http://localhost:8000/api/payment/initiate',
        {
          contest_id: selectedContest.id,
          payment_method: paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      // Mark as paid
      setPaidContests([...paidContests, selectedContest.id])
      setSelectedContest(null)

      // Redirect to payment receipt page
      navigate(`/payment-receipt?transaction=${paymentResponse.data.payment.transaction_id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du paiement')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleContinueEnrollment = (contestId) => {
    navigate(`/enrollment?contest=${contestId}`)
  }

  if (loading) {
    return <div className="contests-selection"><p>Chargement...</p></div>
  }

  return (
    <div className="contests-selection">
      <div className="contests-header">
        <h1>🏆 Sélection des Concours</h1>
        <p>Sélectionnez un concours, effectuez le paiement et continuez votre inscription</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="contests-container">
        <div className="contests-list">
          <h2>Concours Disponibles</h2>
          
          {contests.length === 0 ? (
            <div className="no-contests">
              <p>Aucun concours disponible pour le moment.</p>
            </div>
          ) : (
            <div className="contests-grid">
              {contests.map((contest) => {
                const isPaid = paidContests.includes(contest.id)
                
                return (
                  <div
                    key={contest.id}
                    className={`contest-item ${isPaid ? 'paid' : ''} ${selectedContest?.id === contest.id ? 'selected' : ''}`}
                    onClick={() => !isPaid && setSelectedContest(contest)}
                  >
                    <div className="contest-item-header">
                      <h3>{contest.title}</h3>
                      {isPaid && <span className="paid-badge">✓ Payé</span>}
                    </div>

                    <p className="contest-description">{contest.description}</p>

                    <div className="contest-item-details">
                      <div className="detail">
                        <span className="label">📅 Date:</span>
                        <span className="value">
                          {new Date(contest.contest_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="detail">
                        <span className="label">📍 Lieu:</span>
                        <span className="value">{contest.location || 'À définir'}</span>
                      </div>
                      <div className="detail fee">
                        <span className="label">💰 Frais:</span>
                        <span className="value">{contest.registration_fee} FCFA</span>
                      </div>
                    </div>

                    {isPaid ? (
                      <button
                        className="btn btn-success"
                        onClick={() => handleContinueEnrollment(contest.id)}
                      >
                        ➜ Continuer l'inscription
                      </button>
                    ) : (
                      <button
                        className={`btn btn-primary ${selectedContest?.id === contest.id ? 'active' : ''}`}
                        onClick={() => setSelectedContest(contest)}
                      >
                        💳 Sélectionner pour payer
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Payment Section */}
        {selectedContest && !paidContests.includes(selectedContest.id) && (
          <div className="payment-section">
            <div className="payment-card">
              <h2>Paiement du Concours</h2>

              <div className="payment-details">
                <div className="detail-row">
                  <span className="label">Concours:</span>
                  <span className="value">{selectedContest.title}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Montant:</span>
                  <span className="value amount">{selectedContest.registration_fee} FCFA</span>
                </div>
              </div>

              <div className="payment-methods">
                <h3>Méthode de paiement</h3>
                <div className="methods-grid">
                  <label className="method-option">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">💳</span>
                    <span className="method-label">Carte Bancaire</span>
                  </label>
                  <label className="method-option">
                    <input
                      type="radio"
                      value="om"
                      checked={paymentMethod === 'om'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">📱</span>
                    <span className="method-label">Orange Money</span>
                  </label>
                  <label className="method-option">
                    <input
                      type="radio"
                      value="mtn_money"
                      checked={paymentMethod === 'mtn_money'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">📱</span>
                    <span className="method-label">MTN Money</span>
                  </label>
                </div>
              </div>

              <button
                className="btn btn-pay"
                onClick={handlePayment}
                disabled={processingPayment}
              >
                {processingPayment ? 'Traitement...' : '✓ Effectuer le paiement'}
              </button>

              <p className="payment-note">
                ⚠️ Le paiement est obligatoire pour continuer votre inscription au concours.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
