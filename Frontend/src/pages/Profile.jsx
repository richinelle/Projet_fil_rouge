import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import client from '../api/client'
import '../styles/Dashboard.css'
import '../styles/Profile.css'
import Navbar from '../components/Navbar'

export default function Profile() {
    const navigate = useNavigate()
    const location = useLocation()

    // Determine if we are in admin/manager context or candidate context
    const isAdminContext = location.pathname.includes('/admin/') || location.pathname.includes('/manager/')
    const userRole = localStorage.getItem('userRole')
    const isCandidate = userRole === 'candidate' || !userRole

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [userData, setUserData] = useState({})

    // Password change state
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    })

    // Form fields state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        name: '',
        phone: '',
        organization: '',
        bio: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            if (isAdminContext) {
                // Admin/Manager fetch
                const response = await client.get('/admin/profile')
                const user = response.data.user
                setUserData(user)
                setFormData({
                    name: user.name || '',
                    phone: user.phone || '',
                    organization: user.organization || '',
                    bio: user.bio || ''
                })
            } else {
                // Candidate fetch
                const candidate = JSON.parse(localStorage.getItem('candidate') || '{}')
                setUserData(candidate)
                setFormData({
                    first_name: candidate.first_name || '',
                    last_name: candidate.last_name || '',
                    phone: candidate.phone || ''
                })
            }
        } catch (err) {
            console.error('Erreur chargement profil:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (isAdminContext) {
                const response = await client.put('/admin/profile', {
                    name: formData.name,
                    phone: formData.phone,
                    organization: formData.organization,
                    bio: formData.bio
                })
                const updatedUser = response.data.user
                setUserData(updatedUser)
                // Update local storage user object to keep UI in sync
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }))
                alert('Profil mis à jour avec succès')
            } else {
                const token = localStorage.getItem('token')
                const response = await axios.put('http://localhost:8000/api/auth/profile', {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const updatedCandidate = response.data.candidate
                setUserData(updatedCandidate)
                localStorage.setItem('candidate', JSON.stringify(updatedCandidate))
                alert('Profil mis à jour avec succès')
            }
        } catch (err) {
            console.error('Erreur mise à jour:', err)
            alert(err.response?.data?.message || 'Erreur lors de la mise à jour')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (passwords.new_password !== passwords.new_password_confirmation) {
            alert('Les nouveaux mots de passe ne correspondent pas')
            return
        }

        setSaving(true)
        try {
            const payload = {
                current_password: passwords.current_password,
                new_password: passwords.new_password,
                new_password_confirmation: passwords.new_password_confirmation
            }

            if (isAdminContext) {
                await client.put('/admin/password', payload)
            } else {
                const token = localStorage.getItem('token')
                await axios.put('http://localhost:8000/api/auth/password', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }

            alert('Mot de passe modifié avec succès')
            setPasswords({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            })
        } catch (err) {
            console.error('Erreur changement mot de passe:', err)
            alert(err.response?.data?.message || 'Erreur lors du changement de mot de passe')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="loading">Chargement...</div>

    return (
        <div className={isAdminContext ? "admin-dashboard-layout" : "candidate-dashboard-layout"}>
            {!isAdminContext && <div className="candidate-top-nav" style={{ justifyContent: 'center' }}>
            </div>}
            {!isAdminContext && <Navbar />}

            <div className="admin-main-content">
                <div className="profile-container">
                    <div className="content-header">
                        <button className="back-btn" onClick={() => navigate(-1)}>
                            ← Retour
                        </button>
                        <h1>Mon Profil</h1>
                        <p>Gérez vos informations personnelles et votre sécurité</p>
                    </div>

                    <div className="profile-grid">
                        {/* Information Update Form */}
                        <section className="profile-card">
                            <h2>Informations Personnelles</h2>
                            <form onSubmit={handleUpdateProfile}>

                                {isAdminContext ? (
                                    <>
                                        <div className="form-group">
                                            <label>Nom complet</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Téléphone</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Organisation</label>
                                            <input
                                                type="text"
                                                value={formData.organization}
                                                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Bio</label>
                                            <textarea
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                rows="3"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Prénom</label>
                                                <input
                                                    type="text"
                                                    value={formData.first_name}
                                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Nom</label>
                                                <input
                                                    type="text"
                                                    value={formData.last_name}
                                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Téléphone</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>Email (Non modifiable)</label>
                                    <input
                                        type="email"
                                        value={userData.email || ''}
                                        disabled
                                        style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                                    />
                                </div>

                                <button type="submit" className="btn-primary btn-submit" disabled={saving}>
                                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                </button>
                            </form>
                        </section>

                        {/* Password Change Form */}
                        <section className="profile-card">
                            <h2>Sécurité</h2>
                            <form onSubmit={handleChangePassword}>
                                <div className="form-group">
                                    <label>Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        value={passwords.current_password}
                                        onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={passwords.new_password}
                                        onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirmer le nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        value={passwords.new_password_confirmation}
                                        onChange={(e) => setPasswords({ ...passwords, new_password_confirmation: e.target.value })}
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn-warning btn-submit" disabled={saving}>
                                    {saving ? 'Traitement...' : 'Changer le mot de passe'}
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
