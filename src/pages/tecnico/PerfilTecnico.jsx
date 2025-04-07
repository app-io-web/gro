import {
    Box, Heading, VStack, Button, Icon, Divider
  } from '@chakra-ui/react'
  import {
    FiSettings, FiLogOut, FiChevronRight,
    FiClipboard, FiBarChart2
  } from 'react-icons/fi'
  import { useNavigate } from 'react-router-dom'

  import TecnicoBottomNav from '../../components/tecnico/TecnicoBottomNav';
  
  export default function PerfilTecnico() {
    const navigate = useNavigate()
  
    const handleLogout = () => {
      localStorage.clear()
      navigate('/login')
    }
  
    return (
      <Box p={6} maxW="480px" mx="auto" mt={8}>
        <Heading size="lg" mb={6} textAlign="center" color="blue.600">
          🧑‍🔧 Perfil do Técnico
        </Heading>
  
        <VStack spacing={4} align="stretch">
          <Button
            leftIcon={<FiBarChart2 />} rightIcon={<FiChevronRight />}
            justifyContent="space-between"
            variant="ghost"
            onClick={() => navigate('/tecnico/dashboard')}
          >
            Minhas Ordens
          </Button>
  
          <Button
            leftIcon={<FiClipboard />} rightIcon={<FiChevronRight />}
            justifyContent="space-between"
            variant="ghost"
            onClick={() => navigate('/tecnico/historico')}
          >
            Histórico
          </Button>
  
          <Button
            leftIcon={<FiSettings />} rightIcon={<FiChevronRight />}
            justifyContent="space-between"
            variant="ghost"
            onClick={() => navigate('/tecnico/config/integracao')}
          >
            Configurações de Integração
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
        <TecnicoBottomNav />
      </Box>
    )
  }