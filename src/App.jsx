import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import StudentLogin from './pages/StudentLogin.jsx'
import StudentArea from './pages/StudentArea.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import { AuthProvider, useAuth } from './auth.jsx'
import { BrandProvider } from './brand.jsx'

function ProtectedStudent({ children }) {
  const { student } = useAuth()
  if (!student) return <Navigate to="/aluno" replace />
  return children
}

function ProtectedAdmin({ children }) {
  const { admin } = useAuth()
  if (!admin) return <Navigate to="/personal" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrandProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/aluno" element={<StudentLogin />} />
        <Route
          path="/aluno/treinos"
          element={
            <ProtectedStudent>
              <StudentArea />
            </ProtectedStudent>
          }
        />
        <Route path="/personal" element={<AdminLogin />} />
        <Route
          path="/personal/painel"
          element={
            <ProtectedAdmin>
              <AdminPanel />
            </ProtectedAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrandProvider>
    </AuthProvider>
  )
}
