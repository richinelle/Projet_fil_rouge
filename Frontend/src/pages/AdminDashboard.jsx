import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import NotificationBell from '../components/NotificationBell'
import '../styles/AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalManagers: 0,
    totalAdmins: 0,
    totalContests: 0,
    totalEnrollments: 0,
    totalPayments: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const usersRes = await client.get('/admin/statistics/users')
      const contestsRes = await client.get('/contests')
      const paymentsRes = await client.get('/admin/payments')
      const enrollmentsRes = await client.get('/admin/inscriptions')

      const userStats = usersRes.data.statistics || {}

      setStats({
        totalCandidates: userStats.total_candidates || 0,
        totalManagers: userStats.total_managers || 0,
        totalAdmins: userStats.total_admins || 0,
        totalContests: contestsRes.data.contests?.length || 0,
        totalEnrollments: enrollmentsRes.data.total || 0,
        totalPayments: paymentsRes.data.payments?.length || 0,
        totalUsers: (userStats.total_candidates || 0) + (userStats.total_managers || 0) + (userStats.total_admins || 0),
      })
      setLoading(false)
    } catch (err) {
      console.error('Erreur:', err)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    navigate('/admin-login')
  }

  const menuItems = [
    { icon: '📊', label: 'Tableau de bord', path: '/admin/dashboard', count: null },
    { icon: '👤', label: 'Mon Profil', path: '/admin/profile', count: null },
    { icon: '👥', label: 'Utilisateurs', path: '/admin/users', count: stats.totalUsers },
    { icon: '🎯', label: 'Concours', path: '/admin/contests', count: stats.totalContests },
    { icon: '🎓', label: 'Candidats', path: '/admin/candidates', count: stats.totalCandidates },
    { icon: '📝', label: 'Candidatures', path: '/admin/inscriptions', count: stats.totalEnrollments },
    { icon: '💳', label: 'Paiements', path: '/admin/payments', count: stats.totalPayments },
  ]

  return (
    <div className="admin-dashboard-layout">
      <div className="admin-dashboard-wrapper">
        {/* Sidebar Vertical */}
        <aside className="admin-sidebar-vertical">
          <div className="sidebar-role-badge">
            <div className="role-badge role-badge-admin">🛡️ Administrateur</div>
          </div>

          <nav className="sidebar-vertical-menu">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.path}
                className={`vertical-menu-item ${item.path === '/admin/dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  if (item.path.startsWith('/')) {
                    e.preventDefault()
                    navigate(item.path)
                  }
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span className="menu-count">{item.count}</span>
                )}
              </a>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              className="logout-btn-sidebar"
              onClick={handleLogout}
              title="Déconnexion"
            >
              🚪 Déconnexion
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main-content">
          <div className="content-header">
            <div className="header-top">
              <h1>Tableau de bord</h1>
              <div className="header-right">
                <NotificationBell />
                <span className="user-info">{user.name}</span>
              </div>
            </div>
            <p>Vue d'ensemble du système SGEE</p>
          </div>

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              {/* Users Statistics Section */}
              <section className="stats-section">
                <h2>Utilisateurs</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🎓</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalCandidates}</div>
                      <div className="stat-label">Candidats</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalManagers}</div>
                      <div className="stat-label">Managers</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🔐</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalAdmins}</div>
                      <div className="stat-label">Admins</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* System Statistics Section */}
              <section className="stats-section">
                <h2>Système</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalContests}</div>
                      <div className="stat-label">Concours</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalEnrollments}</div>
                      <div className="stat-label">Inscriptions</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalPayments}</div>
                      <div className="stat-label">Paiements</div>
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
                    onClick={() => navigate('/admin/users')}
                  >
                    <span className="action-icon">👥</span>
                    <span className="action-label">Gérer les utilisateurs</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => navigate('/admin/candidates')}
                  >
                    <span className="action-icon">🎓</span>
                    <span className="action-label">Gérer les candidats</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => navigate('/admin/managers')}
                  >
                    <span className="action-icon">🎯</span>
                    <span className="action-label">Gérer les managers</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => navigate('/admin/admins')}
                  >
                    <span className="action-icon">🔐</span>
                    <span className="action-label">Gérer les admins</span>
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
