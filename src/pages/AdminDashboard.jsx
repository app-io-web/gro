import { useEffect, useState } from 'react'
import {
  Box,
  VStack,
  Flex,
  useBreakpointValue,
  Text,
  Button,
  Heading
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../services/api'

import EstatisticasResumo from '../components/admin/EstatisticasResumo'
import ListaOrdensServico from '../components/admin/ListaOrdensServico'
import BotaoCriarOrdem from '../components/admin/BotaoCriarOrdem'
import AdminSidebarDesktop from '../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../components/admin/AdminBottomNav'
import AdminMobileMenu from '../components/admin/AdminMobileMenu'
import ResumoEstatisticas from '../components/admin/ResumoEstatisticas'
import ListaOrdensExecucao from '../components/admin/ListaOrdensExecucao'
import UltimasOrdens from '../components/admin/UltimasOrdens'



// ✅ recebe setAuth como prop
function AdminDashboard({ setAuth }) {
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [admin, setAdmin] = useState(null)


  const navigate = useNavigate()

  useEffect(() => {
    const fetchAdmin = async () => {
      const id = localStorage.getItem('empresa_id')
      try {
        const res = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records/${id}`)
        setAdmin(res)
      } catch (err) {
        console.error('Erro ao carregar administrador:', err)
      }
    }

    fetchAdmin()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    setAuth(false)
  
    // 🔁 Redireciona sem deixar histórico
    window.location.replace('/ordens-servico-app/#/login')
  }
  

  return (
    <Flex>
      {!isMobile && <AdminSidebarDesktop />}

      <Box p={6} ml={!isMobile ? '250px' : 0} w="full" pb={isMobile ? '60px' : 0} position="relative">
        {/* Bottom nav só no mobile */}
        {isMobile && <AdminBottomNav />}

        {/* Header só no desktop */}
        {!isMobile && (
            <Box mb={6}>
                <Heading size="lg">Painel Administrativo</Heading>
                <Text>Olá, {admin?.Email}</Text>
            </Box>
        )}
        {isMobile && <AdminMobileMenu />}



        <VStack spacing={6}>
        <ResumoEstatisticas />
        <ListaOrdensExecucao />
        <UltimasOrdens />
        </VStack>
      </Box>
    </Flex>
  )
}

export default AdminDashboard
