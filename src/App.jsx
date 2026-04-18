import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import EnrollmentSidebar from './components/EnrollmentSidebar'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Enrollment from './pages/Enrollment'
import Contests from './pages/Contests'
import ContestsSelection from './pages/ContestsSelection'
import ContestPayment from './pages/ContestPayment'
import PaymentReceipt from './pages/PaymentReceipt'
import PaymentVerification from './pages/PaymentVerification'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import CandidateManagement from './pages/CandidateManagement'
import ManagerManagement from './pages/ManagerManagement'
import AdminManagement from './pages/AdminManagement'
import UserManagement from './pages/UserManagement'
import DepartmentManagement from './pages/DepartmentManagement'
import FiliereManagement from './pages/FiliereManagement'
import ContestManagement from './pages/ContestManagement'
import ExamCenterManagement from './pages/ExamCenterManagement'
import DepositCenterManagement from './pages/DepositCenterManagement'
import EnrollmentManagement from './pages/EnrollmentManagement'
import ContestsAdmin from './pages/ContestsAdmin'
import PaymentsAdmin from './pages/PaymentsAdmin'
import EnrollmentReview from './pages/EnrollmentReview'
import CertificateView from './pages/CertificateView'
import Profile from './pages/Profile'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')
  return token && (userRole === 'contest_manager' || userRole === 'admin') ? children : <Navigate to="/admin-login" />
}

export default function App() {
  const userRole = localStorage.getItem('userRole')
  const showNavbar = userRole === 'candidate' || !userRole

  return (
    <Router>
      {showNavbar && <Navbar />}
      {userRole === 'candidate' && <EnrollmentSidebar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment"
          element={
            <ProtectedRoute>
              <Enrollment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contests"
          element={
            <ProtectedRoute>
              <Contests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contests-selection"
          element={
            <ProtectedRoute>
              <ContestsSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-receipt"
          element={
            <ProtectedRoute>
              <PaymentReceipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-verification"
          element={<PaymentVerification />}
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <ContestPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminProtectedRoute>
              <Profile />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <UserManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <AdminProtectedRoute>
              <CandidateManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/managers"
          element={
            <AdminProtectedRoute>
              <ManagerManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <AdminProtectedRoute>
              <AdminManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/contests"
          element={
            <AdminProtectedRoute>
              <ContestsAdmin />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminProtectedRoute>
              <PaymentsAdmin />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/inscriptions"
          element={
            <AdminProtectedRoute>
              <EnrollmentReview />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/certificate"
          element={
            <ProtectedRoute>
              <CertificateView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/profile"
          element={
            <AdminProtectedRoute>
              <Profile />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager/dashboard"
          element={
            <AdminProtectedRoute>
              <ManagerDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager/departments"
          element={
            <AdminProtectedRoute>
              <DepartmentManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager/filieres"
          element={
            <AdminProtectedRoute>
              <FiliereManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager/contests"
          element={
            <AdminProtectedRoute>
              <ContestManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager/exam-centers"
          element={
            <AdminProtectedRoute>
              <ExamCenterManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager/deposit-centers"
          element={
            <AdminProtectedRoute>
              <DepositCenterManagement />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/manager/enrollments"
          element={
            <AdminProtectedRoute>
              <EnrollmentManagement />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}
