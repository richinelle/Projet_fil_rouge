import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { downloadReceiptAsPDF } from '../services/receiptExporter'
import '../styles/PaymentReceipt.css'

export default function PaymentReceipt() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = localStorage.getItem('token')

  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  const transactionId = searchParams.get('transaction')

  useEffect(() => {
    if (!transactionId) {
      setError('Transaction ID not found')
      setLoading(false)
      return
    }

    fetchPaymentReceipt()
  }, [transactionId])

  const fetchPaymentReceipt = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/payment/receipt/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setPayment(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du reçu')
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true)
      
      if (!payment?.receipt_data) {
        alert('Données du reçu non disponibles')
        return
      }

      const result = downloadReceiptAsPDF(payment.receipt_data, payment.qr_code_url)

      if (!result.success) {
        alert(result.message)
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      alert('Erreur lors du téléchargement du reçu')
    } finally {
      setDownloading(false)
    }
  }

  const handleContinueEnrollment = () => {
    if (payment?.payment?.contest_id) {
      navigate(`/enrollment?contest=${payment.payment.contest_id}`)
    }
  }

  const handleReturnToDashboard = () => {
    // Trigger a refresh by navigating with a state flag
    navigate('/dashboard', { replace: true, state: { refresh: true } })
  }

  if (loading) {
    return (
      <div className="payment-receipt-page">
        <div className="loading">Chargement du reçu...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-receipt-page">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={handleReturnToDashboard}>
            Retour au Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="payment-receipt-page">
        <div className="error-container">
          <div className="error-message">Reçu non trouvé</div>
          <button className="btn btn-primary" onClick={handleReturnToDashboard}>
            Retour au Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { payment: paymentData, qr_code_url, receipt_data } = payment

  return (
    <div className="payment-receipt-page">
      <div className="receipt-header">
        <h1>✓ Paiement Effectué avec Succès</h1>
        <p>Votre reçu de paiement est prêt</p>
      </div>

      <div className="receipt-container">
        {/* Receipt */}
        <div className="receipt">
          {/* Header */}
          <div className="receipt-header-section">
            <div className="receipt-logo">SGEE</div>
            <div className="receipt-title">REÇU DE PAIEMENT</div>
            <div className="receipt-subtitle">Concours</div>
          </div>

          {/* Transaction Info */}
          <div className="receipt-section">
            <div className="section-title">Informations de Transaction</div>
            <div className="receipt-row">
              <span className="label">ID Transaction:</span>
              <span className="value">{receipt_data.transaction_id}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Date:</span>
              <span className="value">{receipt_data.date}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Statut:</span>
              <span className="value status-badge">{receipt_data.status}</span>
            </div>
          </div>

          {/* Candidate Info */}
          <div className="receipt-section">
            <div className="section-title">Informations du Candidat</div>
            <div className="receipt-row">
              <span className="label">Nom:</span>
              <span className="value">{receipt_data.candidate_name}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Email:</span>
              <span className="value">{receipt_data.candidate_email}</span>
            </div>
          </div>

          {/* Contest Info */}
          <div className="receipt-section">
            <div className="section-title">Informations du Concours</div>
            <div className="receipt-row">
              <span className="label">Concours:</span>
              <span className="value">{receipt_data.contest_title}</span>
            </div>
            <div className="receipt-row">
              <span className="label">Montant:</span>
              <span className="value amount">{receipt_data.amount} FCFA</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="receipt-section">
            <div className="section-title">Méthode de Paiement</div>
            <div className="receipt-row">
              <span className="label">Méthode:</span>
              <span className="value">{receipt_data.payment_method}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="receipt-section qr-section">
            <div className="section-title">Code de Vérification</div>
            <div className="qr-code-container">
              {qr_code_url && (
                <img src={qr_code_url} alt="QR Code" className="qr-code" />
              )}
              <p className="qr-text">Scannez ce code pour vérifier votre paiement</p>
            </div>
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <p>Merci d'avoir participé à SGEE</p>
            <p className="footer-note">Conservez ce reçu pour votre dossier d'inscription</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="receipt-actions">
        <button 
          className="btn btn-primary" 
          onClick={handleDownloadPDF}
          disabled={downloading}
        >
          {downloading ? '⏳ Téléchargement...' : '📥 Exporter en PDF'}
        </button>

        <button className="btn btn-primary" onClick={handleContinueEnrollment}>
          ➜ Continuer l'Inscription
        </button>
        <button className="btn btn-outline" onClick={handleReturnToDashboard}>
          Retour au Dashboard
        </button>
      </div>
    </div>
  )
}
