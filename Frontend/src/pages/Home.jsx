import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AIChat from '../components/AIChat'
import '../styles/Home.css'

export default function Home() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('candidate')
    localStorage.removeItem('candidate_id')
    window.location.reload()
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="hero-logo">🎓</div>
          <div className="hero-badge">🎓 SGEE - Système de Gestion d'Enrôlement des Étudiants</div>
          <h1>Plateforme d'Enrôlement Académique</h1>
          <p>Simplifiez votre inscription, gérez vos paiements et participez à des concours en toute sécurité</p>
          
          {!token ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                <span className="btn-icon">📝</span> S'inscrire (Candidat)
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                <span className="btn-icon">🔐</span> Se connecter (Candidat)
              </Link>
              <Link to="/admin-login" className="btn btn-tertiary btn-lg">
                <span className="btn-icon">👨‍💼</span> Espace Admin/Manager
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              {userRole === 'candidate' && (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-primary btn-lg"
                  >
                    <span className="btn-icon">📊</span> Mon Tableau de Bord
                  </button>
                  <button 
                    onClick={() => navigate('/contests')}
                    className="btn btn-secondary btn-lg"
                  >
                    <span className="btn-icon">🏆</span> Voir les Concours
                  </button>
                </>
              )}
              {userRole === 'admin' && (
                <button 
                  onClick={() => navigate('/admin/dashboard')}
                  className="btn btn-primary btn-lg"
                >
                  <span className="btn-icon">⚙️</span> Tableau de Bord Admin
                </button>
              )}
              {userRole === 'contest_manager' && (
                <button 
                  onClick={() => navigate('/manager/dashboard')}
                  className="btn btn-primary btn-lg"
                >
                  <span className="btn-icon">🎯</span> Tableau de Bord Manager
                </button>
              )}
              {userRole === 'department_head' && (
                <button 
                  onClick={() => navigate('/department-head/dashboard')}
                  className="btn btn-primary btn-lg"
                >
                  <span className="btn-icon">🏢</span> Tableau de Bord Responsable
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="btn btn-danger btn-lg"
              >
                <span className="btn-icon">🚪</span> Déconnexion
              </button>
            </div>
          )}
        </div>
        <div className="hero-background">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Nos Fonctionnalités</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Inscription Facile</h3>
            <p>Processus d'inscription simplifié avec vérification par email automatique</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Sécurité Garantie</h3>
            <p>Authentification JWT sécurisée et chiffrement des données sensibles</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Paiement Sécurisé</h3>
            <p>Multiples méthodes de paiement (Carte, OM, MTN Money) avec QR codes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Gestion des Concours</h3>
            <p>Participez à des concours académiques et suivez votre progression</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Enrôlement Multi-Étapes</h3>
            <p>Formulaire d'enrôlement en 7 étapes avec sauvegarde automatique</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Tableaux de Bord</h3>
            <p>Suivi en temps réel de votre statut et de vos documents</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Gestion Académique</h3>
            <p>Gestion des départements et filières par les responsables</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Gestion des Utilisateurs</h3>
            <p>Administration complète des utilisateurs et des candidats</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📧</div>
            <h3>Notifications Email</h3>
            <p>Notifications automatiques pour les événements importants</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">Comment Ça Marche</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Inscription</h3>
            <p>Créez votre compte avec votre email et vérifiez-le</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Enrôlement</h3>
            <p>Complétez votre formulaire d'enrôlement en 7 étapes</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Concours</h3>
            <p>Consultez et inscrivez-vous aux concours disponibles</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Paiement</h3>
            <p>Effectuez votre paiement de manière sécurisée</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <div className="stat-number">100%</div>
          <p>Sécurisé</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <p>Disponible</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">3+</div>
          <p>Méthodes de Paiement</p>
        </div>
        <div className="stat-item">
          <div className="stat-number">7</div>
          <p>Étapes d'Enrôlement</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Prêt à Commencer?</h2>
        <p>Rejoignez notre plateforme et simplifiez votre processus d'enrôlement</p>
        {!token && (
          <Link to="/register" className="btn btn-primary btn-lg">
            S'inscrire Maintenant
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>À Propos</h4>
            <p>SGEE est une plateforme moderne de gestion d'enrôlement des étudiants conçue pour simplifier les processus académiques.</p>
          </div>
          <div className="footer-section">
            <h4>Liens Rapides</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/register">S'inscrire</Link></li>
              <li><Link to="/login">Se connecter</Link></li>
              <li><Link to="/admin-login">Admin</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Fonctionnalités</h4>
            <ul>
              <li><a href="#features">Inscription</a></li>
              <li><a href="#features">Paiement Sécurisé</a></li>
              <li><a href="#features">Gestion des Concours</a></li>
              <li><a href="#features">Enrôlement</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: richinellelaurence@gmail.com</p>
            <p>Téléphone: +237 696482594</p>
            <p>Adresse: Cameroun</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SGEE - Système de Gestion d'Enrôlement des Étudiants. Tous droits réservés.</p>
          <div className="footer-links">
            <a href="#privacy">Politique de Confidentialité</a>
            <a href="#terms">Conditions d'Utilisation</a>
            <a href="#contact">Nous Contacter</a>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChat />
    </div>
  )
}
