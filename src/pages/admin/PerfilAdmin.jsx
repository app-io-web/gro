import {
  Box, Heading, VStack, Button, Icon, Divider
} from '@chakra-ui/react'
import {
  FiSettings, FiLogOut, FiChevronRight,
  FiUser, FiUsers, FiClipboard, FiBarChart2,
  FiChevronDown, FiChevronUp
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AdminBottomNav from '../../components/admin/AdminBottomNav'

export default function PerfilAdminPage() {
  const navigate = useNavigate()
  const [openCadastro, setOpenCadastro] = useState(false)
  const [openOrdens, setOpenOrdens] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <Box pb={20} px={4} maxW="480px" mx="auto" mt={8}>
      <Heading size="lg" mb={6} textAlign="center" color="blue.600">
        👤 Perfil do Administrador
      </Heading>

      <VStack spacing={4} align="stretch">
        <Button
          leftIcon={<FiBarChart2 />} rightIcon={<FiChevronRight />}
          justifyContent="space-between"
          variant="ghost"
          onClick={() => navigate('/admin')}
        >
          Dashboard Geral
        </Button>

        <Button
          leftIcon={openOrdens ? <FiChevronUp /> : <FiChevronDown />}
          justifyContent="space-between"
          variant="ghost"
          onClick={() => setOpenOrdens(!openOrdens)}
        >
          Ordens de Serviço
        </Button>

        {openOrdens && (
          <VStack align="stretch" pl={4} spacing={2}>
            <Button variant="ghost" onClick={() => navigate('/admin/ordens-abertas')}>Em Aberto</Button>
            <Button variant="ghost" onClick={() => navigate('/admin/ordens-andamento')}>Em Andamento</Button>
            <Button variant="ghost" onClick={() => navigate('/admin/ordens-finalizadas')}>Finalizadas</Button>
            <Button variant="ghost" onClick={() => navigate('/admin/evidencias')}>Evidências</Button>
          </VStack>
        )}

        <Button
          leftIcon={openCadastro ? <FiChevronUp /> : <FiChevronDown />}
          justifyContent="space-between"
          variant="ghost"
          onClick={() => setOpenCadastro(!openCadastro)}
        >
          Cadastros
        </Button>

        {openCadastro && (
          <VStack align="stretch" pl={4} spacing={2}>
            <Button variant="ghost" onClick={() => navigate('/admin/cadastrar-empresa')}>Cadastrar Empresa</Button>
            <Button variant="ghost" onClick={() => navigate('/admin/cadastrar-tecnico')}>Cadastrar Técnico</Button>
          </VStack>
        )}

        <Button
          leftIcon={<FiUsers />} rightIcon={<FiChevronRight />}
          justifyContent="space-between"
          variant="ghost"
          onClick={() => navigate('/admin/empresas')}
        >
          Empresas
        </Button>

        <Button
          leftIcon={<FiUser />} rightIcon={<FiChevronRight />}
          justifyContent="space-between"
          variant="ghost"
          onClick={() => navigate('/admin/tecnicos')}
        >
          Técnicos
        </Button>

        <Button
          leftIcon={<FiSettings />} rightIcon={<FiChevronRight />}
          justifyContent="space-between"
          variant="ghost"
          onClick={() => navigate('/admin/config')}
        >
          Configurações
        </Button>

        <Divider my={4} />

        <Button
          leftIcon={<FiLogOut />} colorScheme="red"
          justifyContent="flex-start"
          variant="outline"
          onClick={handleLogout}
        >
          Sair da conta
        </Button>
      </VStack>

      <AdminBottomNav />
    </Box>
  )
}