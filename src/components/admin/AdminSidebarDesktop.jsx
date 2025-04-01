import { Box, VStack, Text, Button } from '@chakra-ui/react'
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiFileText,
  FiUserPlus,
  FiUsers,
  FiClipboard // 👈 importado para ordens em aberto
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function SidebarAdminDesktop() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <Box
      w="250px"
      h="100vh"
      bg="gray.800"
      color="white"
      p={5}
      position="fixed"
      top={0}
      left={0}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={8}>
        Painel Admin
      </Text>

      <VStack align="stretch" spacing={4}>
        <Button
          leftIcon={<FiHome color="white" />}
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => navigate('/admin')}
        >
          Dashboard
        </Button>

        <Button
          leftIcon={<FiFileText color="white" />}
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => navigate('/admin/ordens')}
        >
          Ordens de Serviço
        </Button>

        <Button
          leftIcon={<FiClipboard color="white" />} // 👈 novo botão aqui
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => navigate('/admin/ordens-abertas')}
        >
          Ordens em Aberto
        </Button>

        <Button
          leftIcon={<FiUserPlus color="white" />}
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => navigate('/admin/cadastrar-empresa')}
        >
          Cadastrar Empresa
        </Button>

        <Button
          leftIcon={<FiUsers color="white" />}
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => navigate('/admin/empresas')}
        >
          Empresas
        </Button>

        <Button
          leftIcon={<FiSettings color="white" />}
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => navigate('/admin/config')}
        >
          Configurações
        </Button>

        <Button
          mt={10}
          leftIcon={<FiLogOut color="red" />}
          color="red.400"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'red.600', color: 'white' }}
          onClick={handleLogout}
        >
          Sair
        </Button>
      </VStack>
    </Box>
  )
}

export default SidebarAdminDesktop
