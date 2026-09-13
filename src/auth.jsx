import { createContext, useContext, useMemo, useState } from 'react'
import { ADMIN_PASSWORD, fetchData } from './storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('dl_student') || 'null')
    } catch {
      return null
    }
  })
  const [admin, setAdmin] = useState(() => sessionStorage.getItem('dl_admin') === '1')

  const value = useMemo(
    () => ({
      student,
      admin,
      async loginStudent(code, password) {
        const data = await fetchData()
        const found = data.students.find(
          (s) =>
            s.active !== false &&
            s.code.trim().toUpperCase() === code.trim().toUpperCase() &&
            s.password === password
        )
        if (!found) return false
        const session = { id: found.id, name: found.name, code: found.code }
        setStudent(session)
        sessionStorage.setItem('dl_student', JSON.stringify(session))
        return true
      },
      logoutStudent() {
        setStudent(null)
        sessionStorage.removeItem('dl_student')
      },
      loginAdmin(password) {
        if (password !== ADMIN_PASSWORD) return false
        setAdmin(true)
        sessionStorage.setItem('dl_admin', '1')
        return true
      },
      logoutAdmin() {
        setAdmin(false)
        sessionStorage.removeItem('dl_admin')
      },
    }),
    [student, admin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
