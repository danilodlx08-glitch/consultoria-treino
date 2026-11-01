import { createContext, useContext, useMemo, useState } from 'react'
import { ADMIN_PASSWORD, checkStudentVersion, fetchSingleStudentData } from './storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const raw = sessionStorage.getItem('dl_student')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [admin, setAdmin] = useState(() => sessionStorage.getItem('dl_admin') === '1')

  const value = useMemo(
    () => ({
      studentSession: student ? { student } : null,
      admin,
      async loginStudent(code, password) {
        try {
          // Executa a checagem leve de versão e credenciais
          const result = await checkStudentVersion(code, password)
          
          let studentData = null

          if (result.status === 'OFFLINE_CACHE' || result.status === 'UP_TO_DATE' || result.status === 'UPDATE_AVAILABLE') {
            // Reaproveita o cache local do aparelho para economizar leituras na nuvem
            studentData = result.localCache
          }

          // Se for o primeiro acesso ou se o cache local estiver ausente por algum motivo, baixa os dados completos
          if (!studentData && result.status === 'FIRST_ACCESS') {
            studentData = await fetchSingleStudentData(result.studentId, code)
          }

          if (!studentData) {
            throw new Error('Não foi possível carregar os dados do aluno.')
          }

          // Se houver uma atualização disponível na nuvem mas o aluno entrou com o cache,
          // podemos marcar uma flag interna na sessão para a StudentArea exibir o aviso de atualização
          if (result.status === 'UPDATE_AVAILABLE') {
            studentData._hasRemoteUpdate = true
            // Opcionalmente podemos buscar os dados novos em background ou deixar para o botão de atualização.
            // Aqui garantimos que ele entra com o cache e sabe que há update.
          }

          setStudent(studentData)
          sessionStorage.setItem('dl_student', JSON.stringify(studentData))
          return true
        } catch (err) {
          console.error('Erro no login do aluno:', err)
          throw err
        }
      },
      updateStudentSession(newSession) {
        if (newSession && newSession.student) {
          setStudent(newSession.student)
          sessionStorage.setItem('dl_student', JSON.stringify(newSession.student))
        }
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
