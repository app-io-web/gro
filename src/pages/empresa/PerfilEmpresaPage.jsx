import {
    Box, Heading, VStack, Button, Icon, Divider
  } from '@chakra-ui/react'
  import {
    FiSettings, FiLogOut, FiChevronRight,
    FiClipboard, FiBarChart2
  } from 'react-icons/fi'
  import { useNavigate } from 'react-router-dom'
  import AdminBottomNav from '../../components/admin/AdminBottomNav'
  
  export default function PerfilEmpresaPage() {
    const navigate = useNavigate()
  
    const handleLogout = () => {
      localStorage.clear()
      navigate('/login')
    }
  
    return (
      <Box p={6} maxW="480px" mx="auto" mt={8} mb={20}>
        <Heading size="lg" mb={6} textAlign="center" color="blue.600">
          🏢 Perfil da Empresa
        </Heading>
  
        <VStack spacing={4} align="stretch">
          <Button
            leftIcon={<FiBarChart2 />} rightIcon={<FiChevronRight />}
            justifyContent="space-between"
            variant="ghost"
            onClick={() => navigate('/empresa/dashboard')}
          >
            Dashboard
          </Button>
  
          <Button
            leftIcon={<FiClipboard />} rightIcon={<FiChevronRight />}
            justifyContent="space-between"
            variant="ghost"
            onClick={() => navigate('/empresa/ordens')}
          >
            Minhas Ordens
          </Button>
  
          <Button
            leftIcon={<FiSettings />} rightIcon={<FiChevronRight />}
            justifyContent="space-between"
            variant="ghost"
            onClick={() => navigate('/empresa/config')}
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
  