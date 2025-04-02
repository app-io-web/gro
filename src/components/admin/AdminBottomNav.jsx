// src/components/admin/AdminBottomNav.jsx
import { Box, Flex, IconButton } from '@chakra-ui/react'
import {
  FiHome,
  FiFolder,
  FiBarChart2,
  FiUser,
  FiPlus
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function AdminBottomNav() {
  const navigate = useNavigate()

  const tipoUsuario = localStorage.getItem('tipo') // pega o tipo do usuário

  const irParaPerfil = () => {
    if (tipoUsuario === 'admin') {
      navigate('/admin/perfil')
    } else {
      navigate('/empresa/perfil')
    }
  }

  return (
    <Box
      pos="fixed"
      bottom="0"
      left="0"
      w="100%"
      bg="white"
      boxShadow="0 -1px 5px rgba(0, 0, 0, 0.1)"
      zIndex="999"
      px={4}
      py={2}
    >
      <Flex justify="space-between" align="center">
        <IconButton
          icon={<FiHome />}
          variant="ghost"
          onClick={() => navigate('/admin')}
          aria-label="Dashboard"
        />
        <IconButton
          icon={<FiFolder />}
          variant="ghost"
          onClick={() => navigate('/admin/ordens')}
          aria-label="Ordens"
        />

        <IconButton
          icon={<FiPlus />}
          colorScheme="blue"
          rounded="full"
          size="lg"
          mt="-30px"
          boxShadow="md"
          onClick={() => navigate('/admin/criar')}
          aria-label="Nova O.S"
        />

        <IconButton
          icon={<FiBarChart2 />}
          variant="ghost"
          onClick={() => navigate('/admin/metricas')}
          aria-label="Métricas"
        />
        <IconButton
          icon={<FiUser />}
          variant="ghost"
          onClick={irParaPerfil}
          aria-label="Perfil"
        />
      </Flex>
    </Box>
  )
}

export default AdminBottomNav
