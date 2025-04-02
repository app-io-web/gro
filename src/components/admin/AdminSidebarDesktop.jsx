import { Box, VStack, Text, Button, Collapse } from '@chakra-ui/react'
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiFileText,
  FiUserPlus,
  FiUsers,
  FiClipboard,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { FiUser } from 'react-icons/fi' // certifique-se de importar esse ícone


function SidebarAdminDesktop() {
  const navigate = useNavigate()
  const [openCadastro, setOpenCadastro] = useState(false)
  const [openOrdens, setOpenOrdens] = useState(false)

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
          leftIcon={openOrdens ? <FiChevronUp color="white" /> : <FiChevronDown color="white" />}
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => setOpenOrdens(!openOrdens)}
        >
          Ordens de Serviço
        </Button>


        <Collapse in={openOrdens} animateOpacity>
          <VStack align="stretch" pl={6} spacing={2}>
            <Button
              color="white"
              variant="ghost"
              justifyContent="start"
              onClick={() => navigate('/admin/ordens-abertas')}
              _hover={{ bg: 'blue.600', color: 'white' }}
            >
              Em Aberto
            </Button>
            <Button
              color="white"
              variant="ghost"
              justifyContent="start"
              onClick={() => navigate('/admin/ordens-andamento')}
              _hover={{ bg: 'blue.600', color: 'white' }}
            >
              Em Andamento
            </Button>
            <Button
              color="white"
              variant="ghost"
              justifyContent="start"
              onClick={() => navigate('/admin/ordens-finalizadas')}
              _hover={{ bg: 'blue.600', color: 'white' }}
            >
              Finalizadas
            </Button>
            <Button
              color="white"
              variant="ghost"
              justifyContent="start"
              onClick={() => navigate('/admin/evidencias')}
              _hover={{ bg: 'blue.600', color: 'white' }}
            >
              Evidências
            </Button>
          </VStack>
        </Collapse>

        <Button
          leftIcon={openCadastro ? <FiChevronUp color="white" /> : <FiChevronDown color="white" />}
          color="white"
          justifyContent="start"
          variant="ghost"
          _hover={{ bg: 'blue.600' }}
          onClick={() => setOpenCadastro(!openCadastro)}
        >
          Cadastros
        </Button>

        
        <Collapse in={openCadastro} animateOpacity>
          <VStack align="stretch" pl={6} spacing={2}>
            <Button
              color="white"
              variant="ghost"
              justifyContent="start"
              onClick={() => navigate('/admin/cadastrar-empresa')}
              _hover={{ bg: 'blue.600', color: 'white' }}
            >
              Cadastrar Empresa
            </Button>
            <Button
              color="white"
              variant="ghost"
              justifyContent="start"
              onClick={() => navigate('/admin/cadastrar-tecnico')}
              _hover={{ bg: 'blue.600', color: 'white' }}
            >
              Cadastrar Técnico
            </Button>
          </VStack>
        </Collapse>

        

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
          leftIcon={<FiUser color="white" />}
          variant="ghost"
          color="white"
          justifyContent="start"
          _hover={{ bg: 'blue.600' }}
          onClick={() => navigate('/admin/tecnicos')}
        >
          Técnicos
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
