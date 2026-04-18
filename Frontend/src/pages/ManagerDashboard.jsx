import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import NotificationBell from '../components/NotificationBell'
import '../styles/AdminDashboard.css'

export default function ManagerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [stats, setStats] = useState({
    totalContests: 0,
    totalParticipants: 0,
    totalDepartments: 0,
    totalFilieres: 0,
    totalExamCenters: 0,
    totalDepositCenters: 0,
    totalEnrollments: 0,
    totalNotifications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const contestsRes = await client.get('/manager/contests')
      const deptsRes = await client.get('/manager/departments')
      const filieresRes = await client.get('/manager/filieres')
      const examCentersRes = await client.get('/manager/exam-centers')
      const depositCentersRes = await client.get('/manager/deposit-centers')
      const enrollmentsRes = await client.get('/manager/enrollments')

      setStats({
        totalContests: contestsRes.data.contests?.length || 0,
        totalParticipants: contestsRes.data.contests?.reduce((sum, c) => sum + (c.participants || 0), 0) || 0,
        totalDepartments: deptsRes.data.departments?.length || 0,
        totalFilieres: filieresRes.data.filieres?.length || 0,
        totalExamCenters: examCentersRes.data.exam_centers?.length || 0,
        totalDepositCenters: depositCentersRes.data.deposit_centers?.length || 0,
        totalEnrollments: enrollmentsRes.data.total || 0,
        totalNotifications: 0,
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
    { icon: '📊', label: 'Tableau de bord', path: '/manager/dashboard', count: null },
    { icon: '👤', label: 'Mon Profil', path: '/manager/profile', count: null },
    { icon: '🏆', label: 'Mes Concours', path: '/manager/contests', count: stats.totalContests },
    { icon: '🏢', label: 'Départements', path: '/manager/departments', count: stats.totalDepartments },
    { icon: '📚', label: 'Filières', path: '/manager/filieres', count: stats.totalFilieres },
    { icon: '🏛️', label: 'Centres d\'examen', path: '/manager/exam-centers', count: stats.totalExamCenters },
    { icon: '📦', label: 'Centres de dépôt', path: '/manager/deposit-centers', count: stats.totalDepositCenters },
    { icon: '👥', label: 'Participants', path: '#', count: stats.totalParticipants },
    { icon: '📋', label: 'Inscriptions', path: '/manager/enrollments', count: stats.totalEnrollments },
  ]

  return (
    <div className="admin-dashboard-layout">
      <div className="admin-dashboard-wrapper">
        {/* Sidebar Vertical */}
        <aside className="admin-sidebar-vertical">
          <div className="sidebar-role-badge">
            <div className="role-badge role-badge-manager">🎯 Responsable Concours</div>
          </div>

          <nav className="sidebar-vertical-menu">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.path}
                className={`vertical-menu-item ${item.path === '/manager/dashboard' ? 'active' : ''}`}
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
              <h1>📊 Tableau de bord</h1>
              <div className="header-right">
                <NotificationBell />
                <span className="user-info">{user.name}</span>
              </div>
            </div>
            <p>Vue d'ensemble de vos concours et départements</p>
          </div>

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              {/* Contests Section */}
              <section className="stats-section">
                <h2>Concours</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalContests}</div>
                      <div className="stat-label">Total</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalParticipants}</div>
                      <div className="stat-label">Participants</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalEnrollments}</div>
                      <div className="stat-label">Inscriptions</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Organization Section */}
              <section className="stats-section">
                <h2>Organisation</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalDepartments}</div>
                      <div className="stat-label">Départements</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalFilieres}</div>
                      <div className="stat-label">Filières</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🔔</div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalNotifications}</div>
                      <div className="stat-label">Notifications</div>
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
                    onClick={() => navigate('/manager/contests')}
                  >
                    <span className="action-icon">🏆</span>
                    <span className="action-label">Gérer les concours</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => navigate('/manager/departments')}
                  >
                    <span className="action-icon">🏢</span>
                    <span className="action-label">Gérer les départements</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => navigate('/manager/filieres')}
                  >
                    <span className="action-icon">📚</span>
                    <span className="action-label">Gérer les filières</span>
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => navigate('/manager/exam-centers')}
                  >
                    <span className="action-icon">🏛️</span>
                    <span className="action-label">Gérer les centres d'examen</span>
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
