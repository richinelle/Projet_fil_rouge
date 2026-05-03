import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import '../styles/UserManagement.css'

export default function PaymentsAdmin() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalAmount, setTotalAmount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/admin/dashboard')
    }
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await client.get('/admin/payments')
      setPayments(response.data.payments || [])
      // Convertir en nombre et arrondir à 2 décimales
      const total = parseFloat(response.data.total_amount) || 0
      setTotalAmount(Math.round(total * 100) / 100)
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des paiements:', err.response?.data || err.message)
      setError('Erreur lors du chargement des paiements')
      setLoading(false)
    }
  }

  const getFilteredPayments = () => {
    return payments.filter(payment => {
      const matchesSearch = payment.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.contest_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transaction_id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter

      const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter

      return matchesSearch && matchesStatus && matchesMethod
    })
  }

  const getUniqueMethods = () => {
    const methods = payments
      .map(p => p.payment_method)
      .filter((method, index, self) => method && self.indexOf(method) === index)
    return methods.sort()
  }

  const getUniqueStatuses = () => {
    const statuses = payments
      .map(p => p.status)
      .filter((status, index, self) => status && self.indexOf(status) === index)
    return statuses.sort()
  }

  const getTotalFilteredAmount = () => {
    const total = getFilteredPayments().reduce((sum, payment) => {
      const amount = parseFloat(payment.amount) || 0
      return sum + amount
    }, 0)
    return Math.round(total * 100) / 100
  }

  if (loading) {
    return <div className="user-management"><p>Chargement...</p></div>
  }

  return (
    <div className="user-management">
      <header className="management-header">
        <h1>Gestion des Paiements</h1>
        <p>Consultez tous les paiements effectués</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="management-content">
        <div className="section-header">
          <h2>Tous les Paiements ({getFilteredPayments().length})</h2>
          <div className="payment-stats">
            <div className="stat-card">
              <span className="stat-label">Montant Total</span>
              <span className="stat-value">{totalAmount.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} FCFA</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="🔍 Rechercher par candidat, email, concours ou transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>Statut:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les statuts</option>
                {getUniqueStatuses().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Méthode de paiement:</label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">Toutes les méthodes</option>
                {getUniqueMethods().map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="filter-reset-btn"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setMethodFilter('all')
              }}
            >
              ↻ Réinitialiser
            </button>
          </div>
        </div>

        <div className="payments-list">
          {getFilteredPayments().length === 0 ? (
            <div className="no-results">
              <p>Aucun paiement trouvé</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Transaction</th>
                  <th>Candidat</th>
                  <th>Email</th>
                  <th>Concours</th>
                  <th>Montant (FCFA)</th>
                  <th>Méthode</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredPayments().map((payment) => (
                  <tr key={payment.id}>
                    <td><code>{payment.transaction_id}</code></td>
                    <td>{payment.candidate_name}</td>
                    <td>{payment.candidate_email}</td>
                    <td>{payment.contest_title}</td>
                    <td className="amount">{payment.amount.toLocaleString('fr-FR')}</td>
                    <td>{payment.payment_method}</td>
                    <td>
                      <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .payment-stats {
          display: flex;
          gap: 20px;
          margin-top: 20px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 200px;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .amount {
          font-weight: 600;
          color: #2e7d32;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-complété {
          background-color: #e8f5e9;
          color: #388e3c;
        }

        .status-en attente {
          background-color: #fff3e0;
          color: #f57c00;
        }

        .status-échoué {
          background-color: #ffebee;
          color: #d32f2f;
        }

        code {
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}
