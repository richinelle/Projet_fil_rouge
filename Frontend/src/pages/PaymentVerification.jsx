import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { downloadReceiptAsPDF, downloadReceiptAsExcel, printReceipt } from '../services/receiptExporter'
import '../styles/PaymentVerification.css'

export default function PaymentVerification() {
  const [searchParams] = useSearchParams()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')

  const transactionId = searchParams.get('transaction_id')

  useEffect(() => {
    if (!transactionId) {
      setError('ID de transaction non trouvé')
      setLoading(false)
      return
    }

    fetchPaymentDetails()
  }, [transactionId])

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/payment/verify/${transactionId}`
      )
      setPayment(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du paiement')
      setLoading(false)
    }
  }

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true)
      
      if (!payment) {
        alert('Données du paiement non disponibles')
        return
      }

      // Créer les données du reçu
      const receiptData = {
        transaction_id: payment.payment.transaction_id,
        date: new Date(payment.payment.created_at).toLocaleDateString('fr-FR') + ' ' + 
              new Date(payment.payment.created_at).toLocaleTimeString('fr-FR'),
        candidate_name: `${payment.candidate.first_name} ${payment.candidate.last_name}`,
        candidate_email: payment.candidate.email,
        contest_title: payment.contest.title,
        amount: payment.payment.amount,
        payment_method: payment.payment.payment_method === 'card' ? 'Carte Bancaire' : 
                       payment.payment.payment_method === 'om' ? 'Orange Money' : 'MTN Money',
      }

      let result
      if (exportFormat === 'pdf') {
        result = downloadReceiptAsPDF(receiptData, null)
      } else if (exportFormat === 'excel') {
        result = downloadReceiptAsExcel(receiptData)
      }

      if (!result.success) {
        alert(result.message)
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors du téléchargement du reçu')
    } finally {
      setDownloading(false)
    }
  }

  const generateVerificationCode = (transactionId) => {
    const hash = transactionId.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0)
    }, 0)
    const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 8)
    return code.padEnd(8, '0')
  }

  if (loading) {
    return (
      <div className="payment-verification-page">
        <div className="loading">Chargement du paiement...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-verification-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <div className="error-message">{error}</div>
          <p className="error-hint">Veuillez vérifier l'ID de transaction et réessayer</p>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="payment-verification-page">
        <div className="error-container">
          <div className="error-message">Paiement non trouvé</div>
        </div>
      </div>
    )
  }

  const verificationCode = generateVerificationCode(payment.payment.transaction_id)

  return (
    <div className="payment-verification-page">
      <div className="verification-header">
        <h1>✓ Paiement Vérifié</h1>
        <p>Votre paiement a été confirmé avec succès</p>
      </div>

      <div className="verification-container">
        {/* Verification Card */}
        <div className="verification-card">
          <div className="card-header">
            <div className="status-icon">✓</div>
            <h2>Paiement Confirmé</h2>
          </div>

          <div className="card-content">
            {/* Transaction Info */}
            <div className="info-section">
              <h3>Informations de Transaction</h3>
              <div className="info-row">
                <span className="label">ID Transaction:</span>
                <span className="value">{payment.payment.transaction_id}</span>
              </div>
              <div className="info-row">
                <span className="label">Date:</span>
                <span className="value">
                  {new Date(payment.payment.created_at).toLocaleDateString('fr-FR')} 
                  {' '}
                  {new Date(payment.payment.created_at).toLocaleTimeString('fr-FR')}
                </span>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="info-section">
              <h3>Candidat</h3>
              <div className="info-row">
                <span className="label">Nom:</span>
                <span className="value">{payment.candidate.first_name} {payment.candidate.last_name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{payment.candidate.email}</span>
              </div>
            </div>

            {/* Contest Info */}
            <div className="info-section">
              <h3>Concours</h3>
              <div className="info-row">
                <span className="label">Titre:</span>
                <span className="value">{payment.contest.title}</span>
              </div>
              <div className="info-row">
                <span className="label">Montant:</span>
                <span className="value amount">{payment.payment.amount} FCFA</span>
              </div>
              <div className="info-row">
                <span className="label">Méthode:</span>
                <span className="value">
                  {payment.payment.payment_method === 'card' ? 'Carte Bancaire' : 
                   payment.payment.payment_method === 'om' ? 'Orange Money' : 
                   'MTN Money'}
                </span>
              </div>
            </div>

            {/* Verification Code */}
            <div className="verification-code-section">
              <h3>Code de Vérification Unique</h3>
              <div className="code-display">
                <div className="code-value">{verificationCode}</div>
                <p className="code-hint">Ce code est unique pour ce paiement</p>
              </div>
            </div>
          </div>

          <div className="card-footer">
            <div className="export-group">
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value)}
                className="export-select"
              >
                <option value="pdf">📄 PDF</option>
                <option value="excel">📊 Excel</option>
              </select>
              <button 
                className="btn btn-primary"
                onClick={handleDownloadReceipt}
                disabled={downloading}
              >
                {downloading ? '⏳ Téléchargement...' : '⬇️ Télécharger le Reçu'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="verification-footer">
        <p>✓ Paiement vérifié et confirmé</p>
        <p className="footer-hint">Conservez ce code pour votre dossier d'inscription</p>
      </div>
    </div>
  )
}
