import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import OrdemServico from './pages/OrdemServico.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import EmpresaDashboard from './pages/EmpresaDashboard.jsx'
import CadastroEmpresa from './pages/CadastroEmpresa'
import EmpresasCadastradas from './pages/EmpresasCadastradas'



function App() {
  const [auth, setAuth] = useState(false)
  const [tipo, setTipo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const tipoUsuario = localStorage.getItem('tipo')
  
      setAuth(!!token)
      setTipo(tipoUsuario)
      setLoading(false)
    }
  
    checkAuth()
  
    // 🔥 NÃO FUNCIONA COM REDIRECT NA MESMA ABA
    // window.addEventListener('storage', checkAuth)
  
    // 🛠️ Em vez disso, atualiza sempre que a URL muda (rota muda)
    window.addEventListener('hashchange', checkAuth)
  
    return () => {
      window.removeEventListener('hashchange', checkAuth)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token')
      const tipoUsuario = localStorage.getItem('tipo')
  
      setAuth(!!token)
      setTipo(tipoUsuario)
    }, 100)
  
    return () => clearInterval(interval)
  }, [])
  
  
  

  // ✅ nova função para logout global
  const handleLogoutGlobal = () => {
    localStorage.clear()
    sessionStorage.clear()
    setAuth(false)
    setTipo(null)
  
    // Redirecionamento total, evitando cache e histórico
    window.location.replace('/ordens-servico-app/#/login')
  }
  
  
  

  if (loading) return <div>Carregando...</div>

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />

        <Route
          path="/"
          element={
            auth ? (
              tipo === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/empresa" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/ordem/:id" element={auth ? <OrdemServico /> : <Navigate to="/login" />} />
        <Route
          path="/admin"
          element={
            auth && tipo === 'admin' ? (
              <AdminDashboard setAuth={setAuth} onLogout={handleLogoutGlobal} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/empresa"
          element={
            auth && tipo === 'empresa' ? (
              <EmpresaDashboard setAuth={setAuth} onLogout={handleLogoutGlobal} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/admin/cadastrar-empresa" element={<CadastroEmpresa />} />
        <Route
            path="/admin/empresas"
            element={
              auth && tipo === 'admin' ? (
                <EmpresasCadastradas />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
      </Routes>
    </Router>
  )
}


export default App
