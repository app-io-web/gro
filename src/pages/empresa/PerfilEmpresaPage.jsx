import {
  Box, Heading, VStack, Button, Icon, Divider, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter
} from '@chakra-ui/react'
import {
  FiSettings, FiLogOut, FiChevronRight,
  FiClipboard, FiBarChart2, FiPlus, FiFolder
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import { usarVerificacaoLimiteOS } from '../../components/utils/verificarLimiteOS'

export default function PerfilEmpresaPage() {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleNovaOS = usarVerificacaoLimiteOS(navigate, onOpen)

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
        <Button leftIcon={<FiBarChart2 />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={() => navigate('/empresa')}>
          Dashboard
        </Button>

        <Divider my={2} />

        <Button leftIcon={<FiPlus />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={handleNovaOS}>
          Abrir O.S
        </Button>

        <Button leftIcon={<FiFolder />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={() => navigate('/empresa/ordens-abertas')}>
          Em Aberto
        </Button>
        <Button leftIcon={<FiFolder />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={() => navigate('/empresa/ordens-andamento')}>
          Em Andamento
        </Button>
        <Button leftIcon={<FiFolder />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={() => navigate('/empresa/ordens-finalizadas')}>
          Finalizadas
        </Button>
        <Button leftIcon={<FiFolder />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={() => navigate('/empresa/ordens-pendenciadas')}>
          Pendenciadas
        </Button>
        <Button leftIcon={<FiFolder />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={() => navigate('/empresa/ordens-canceladas')}>
          Canceladas
        </Button>

        <Divider my={4} />

        <Button leftIcon={<FiSettings />} rightIcon={<FiChevronRight />} justifyContent="space-between" variant="ghost" onClick={() => navigate('/empresa/config')}>
          Configurações
        </Button>

        <Divider my={4} />

        <Button leftIcon={<FiLogOut />} colorScheme="red" justifyContent="flex-start" variant="outline" onClick={handleLogout}>
          Sair da conta
        </Button>
      </VStack>

      <AdminBottomNav />

      {/* Modal para aviso */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Aviso</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            O limite de ordens de serviço foi atingido. <br />
            Por favor, entre em contato com os administradores para liberar novas O.S.
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
