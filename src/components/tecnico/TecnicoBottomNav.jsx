// src/components/tecnico/TecnicoBottomNav.jsx
import { Box, Flex, IconButton } from '@chakra-ui/react'
import { FiHome, FiTool, FiBell, FiList, FiSettings } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

function TecnicoBottomNav() {
  const navigate = useNavigate()

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
      display={{ base: 'flex', md: 'none' }}
    >
      <Flex justify="space-between" align="center" w="100%">
        <IconButton icon={<FiHome />} variant="ghost" onClick={() => navigate('/tecnico')} aria-label="Agenda" />
        <IconButton icon={<FiTool />} variant="ghost" onClick={() => navigate('/tecnico/materiais')} aria-label="Materiais" />
        <IconButton icon={<FiBell />} variant="ghost" onClick={() => navigate('/tecnico/notificacoes')} aria-label="Notificações" />
        <IconButton icon={<FiList />} variant="ghost" onClick={() => navigate('/tecnico/tarefas')} aria-label="Tarefas" />
        <IconButton icon={<FiSettings />} variant="ghost" onClick={() => navigate('/tecnico/perfil')} aria-label="Configurações" />
      </Flex>
    </Box>
  )
}

export default TecnicoBottomNav
