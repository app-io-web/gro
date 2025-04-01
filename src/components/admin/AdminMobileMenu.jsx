// src/components/admin/AdminMobileMenu.jsx
import { IconButton, VStack, Button, Collapse, Box } from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminMobileMenu() {
  const [showOptions, setShowOptions] = useState(false)
  const navigate = useNavigate()

  return (
    <Box position="fixed" bottom="80px" right="20px" zIndex="30">
      <IconButton
        icon={<SettingsIcon />}
        aria-label="Configurações"
        borderRadius="full"
        size="lg"
        bg="gray.200"
        color="gray.600"
        _hover={{ bg: 'gray.300', transform: 'rotate(60deg)', transition: 'all 0.3s ease' }}
        _active={{ transform: 'scale(1.1)' }}
        onClick={() => setShowOptions((prev) => !prev)}
      />

      <Collapse in={showOptions} animateOpacity>
        <VStack
          position="absolute"
          bottom="60px"
          right="0"
          bg="white"
          p={3}
          borderRadius="md"
          boxShadow="xl"
          spacing={2}
          align="stretch"
          mt={2}
        >
          <Button size="sm" onClick={() => navigate('/admin/cadastrar-empresa')}>
            ➕ Cadastrar Empresa
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/empresas')}>
            🏢 Empresas Cadastradas
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/ordens-abertas')}>
            ✔ Ordens em Aberto
          </Button>
        </VStack>
      </Collapse>
    </Box>
  )
}

export default AdminMobileMenu
