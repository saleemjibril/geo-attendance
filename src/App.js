import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminUserDetailPage from './pages/admin/AdminUserDetailPage'
import CheckInPage from './pages/CheckInPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <AdminRoute>
                <AdminUserDetailPage />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Navigate to="/check-in" replace />} />
          <Route path="*" element={<Navigate to="/check-in" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
