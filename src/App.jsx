import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import OrdemServico from './pages/OrdemServico.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import EmpresaDashboard from './pages/empresa/EmpresaDashboard.jsx'
import CadastroEmpresa from './pages/CadastroEmpresa'
import EmpresasCadastradas from './pages/EmpresasCadastradas'
import OrdensEmAberto from './pages/OrdensEmAberto'
import CadastroTecnico from './pages/admin/CadastroTecnico.jsx'
import TecnicosList from './pages/admin/TecnicosList.jsx'
import PaginaMetricaTecnico from './pages/admin/PaginaMetricaTecnico.jsx'
import OrdensEmExecucao from './pages/OrdensExecucao.jsx'
import DetalheOrdemExecucao from './pages/admin/DetalheOrdemExecucao.jsx'
import PerfilAdmin from './pages/admin/PerfilAdmin'
import PerfilEmpresaPage from './pages/empresa/PerfilEmpresaPage'
import PerfilTecnico from './pages/tecnico/PerfilTecnico.jsx'
import OrdensEmAbertoEmpresa from './pages/empresa/OrdensEmAbertoEmpresa'
import OrdensFinalizadasEmpresa from './pages/empresa/OrdensFinalizadasEmpresa.jsx'
import DetalheOrdemFinalizadaEmpresa from './pages/empresa/DetalheOrdemFinalizadaEmpresa'
import AbrirOrdemEmpresa from './pages/empresa/AbrirOrdemEmpresa'
import MetricasEmpresa from './pages/empresa/MetricasEmpresa'
import OrdensExecucaoEmpresa from './pages/empresa/OrdensExecucaoEmpresa'
import DetalheOrdemExecucaoEmpresa from './pages/empresa/DetalheOrdemExecucaoEmpresa' // depois vamos criar
import OrdensCanceladasEmpresa from './pages/empresa/OrdensCanceladasEmpresa'

import DetalheOrdemCanceladaEmpresa from './pages/empresa/DetalheOrdemCanceladaEmpresa.jsx'
import OrdensPendenciadasEmpresa from './pages/empresa/OrdensPendenciadasEmpresa.jsx'
import DetalheOrdemPendenciadaEmpresa from './pages/empresa/DetalheOrdemPendenciadaEmpresa.jsx'

import TecnicoDashboard from './pages/tecnico/TecnicoDashboard.jsx'
import OrdensAtribuidasTecnico from './pages/tecnico/OrdensAtribuidasTecnico'
import DetalheOrdemTecnico from './pages/tecnico/DetalheOrdemTecnico'
import FinalizarOS from './pages/tecnico/FinalizarOS.jsx'



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
    const autoLogin = async () => {
      const savedEmail = localStorage.getItem('savedEmail')
      const savedSenha = localStorage.getItem('savedSenha')
  
      if (savedEmail && savedSenha && !localStorage.getItem('token')) {
        try {
          const queryEmpresa = encodeURIComponent(`(Email,eq,${savedEmail})~and(password,eq,${savedSenha})`)
          const resEmpresa = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records?where=${queryEmpresa}`)
  
          if (resEmpresa.list && resEmpresa.list.length > 0) {
            const user = resEmpresa.list[0]
            const tipoUsuario = user.tipo?.toLowerCase()
  
            localStorage.setItem('token', 'empresa-logada')
            localStorage.setItem('empresa_id', user.Id)
            localStorage.setItem('email', user.Email)
            localStorage.setItem('tipo', tipoUsuario)
            setAuth(true)
            setTipo(tipoUsuario)
            return
          }
  
          const queryTecnico = encodeURIComponent(`(email_tecnico,eq,${savedEmail})~and(senha,eq,${savedSenha})`)
          const resTecnico = await apiGet(`/api/v2/tables/mpyestriqe5a1kc/records?where=${queryTecnico}`)
  
          if (resTecnico.list && resTecnico.list.length > 0) {
            const tecnico = resTecnico.list[0]
  
            localStorage.setItem('token', 'tecnico-logado')
            localStorage.setItem('tecnico_id', tecnico.Id)
            localStorage.setItem('email', tecnico.email_tecnico)
            localStorage.setItem('tipo', 'tecnico')
            setAuth(true)
            setTipo('tecnico')
          }
        } catch (err) {
          console.error('Erro no auto login:', err)
        }
      }
    }
  
    autoLogin()
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
    localStorage.removeItem('savedEmail')
    localStorage.removeItem('savedSenha')
  
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
          <Route
            path="/admin/ordens-abertas"
            element={
              auth && tipo === 'admin' ? (
                <OrdensEmAberto />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/admin/cadastrar-tecnico" element={<CadastroTecnico />} />
          <Route path="/admin/tecnicos" element={<TecnicosList />} />
          <Route path="/admin/tecnico/:id" element={<PaginaMetricaTecnico />} />
          <Route path="/admin/ordens-andamento" element={<OrdensEmExecucao />} />
          <Route path="/admin/ordem-execucao/:id" element={<DetalheOrdemExecucao />} />

          <Route path="/admin/perfil" element={<PerfilAdmin />} />
          <Route path="/empresa/perfil" element={<PerfilEmpresaPage />} />
          <Route path="/tecnico/perfil" element={<PerfilTecnico />} />

          <Route
            path="/empresa/ordens-abertas"
            element={auth && tipo === 'empresa' ? <OrdensEmAbertoEmpresa /> : <Navigate to="/login" />}
          />
          <Route path="/empresa/ordens-finalizadas" element={<OrdensFinalizadasEmpresa />} />
          <Route path="/empresa/ordem-finalizada/:id" element={<DetalheOrdemFinalizadaEmpresa />} />
          <Route path="/empresa/abrir-ordem" element={<AbrirOrdemEmpresa />} />
          <Route path="/empresa/metricas" element={<MetricasEmpresa />} />
          <Route path="/empresa/ordens-andamento" element={<OrdensExecucaoEmpresa />} />
          <Route path="/empresa/ordens-andamento/:id" element={<DetalheOrdemExecucaoEmpresa />} />
          <Route path="/empresa/ordens-canceladas" element={<OrdensCanceladasEmpresa />} />
          <Route path="/empresa/ordens-canceladas/:id" element={<DetalheOrdemCanceladaEmpresa />} />

          <Route path="/empresa/ordens-pendenciadas" element={<OrdensPendenciadasEmpresa />} />
          <Route path="/empresa/ordens-pendenciadas/:id" element={<DetalheOrdemPendenciadaEmpresa />} />


          <Route path="/tecnico" element={<TecnicoDashboard />} />
          <Route path="/tecnico/ordens" element={<OrdensAtribuidasTecnico />} />
          <Route path="/tecnico/ordem/:id" element={<DetalheOrdemTecnico />} />
          <Route path="/tecnico/finalizar-os/:id" element={<FinalizarOS />} />









      </Routes>
    </Router>
  )
}


export default App
