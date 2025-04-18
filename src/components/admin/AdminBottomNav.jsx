import {
  Box, Flex, IconButton, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button
} from '@chakra-ui/react'
import {
  FiHome, FiFolder, FiBarChart2, FiUser, FiPlus
} from 'react-icons/fi'
import { ChatIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiGet } from '../../services/api'
import { usarVerificacaoLimiteOS } from '../../components/utils/verificarLimiteOS'

function AdminBottomNav({ abrirChat }) { 
  const navigate = useNavigate()
  const tipoUsuario = localStorage.getItem('tipo')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [limite, setLimite] = useState(0)
  const [restante, setRestante] = useState(0)

  useEffect(() => {
    const carregarLimite = async () => {
      try {
        const UnicID = localStorage.getItem('UnicID')
        const limiteOS = parseInt(localStorage.getItem('Limite_de_Ordem') || '0', 10)
        const agora = new Date()
        const mesAtual = agora.toISOString().slice(0, 7)

        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const registro = res.list.find(item => {
          const raw = item['Ordem de Serviços']
          const json = typeof raw === 'string' ? JSON.parse(raw) : raw
          return json?.empresas?.some(emp => emp.UnicID_Empresa === UnicID)
        })

        if (!registro) return setRestante(0)

        const json = typeof registro['Ordem de Serviços'] === 'string'
          ? JSON.parse(registro['Ordem de Serviços'])
          : registro['Ordem de Serviços']

        const empresa = json.empresas.find(emp => emp.UnicID_Empresa === UnicID)
        if (!empresa) return setRestante(0)

        const ordensDoMes = (empresa.Ordens_de_Servico || []).filter(ordem => {
          if (!ordem.Data_Envio_OS) return false
          const data = new Date(ordem.Data_Envio_OS)
          return (
            data.toISOString().slice(0, 7) === mesAtual &&
            ordem.Status_OS !== 'Cancelado' &&
            ordem.Status_OS !== 'Improdutiva'
          )
        })

        setLimite(limiteOS)
        setRestante(Math.max(0, limiteOS - ordensDoMes.length))
      } catch (err) {
        console.error('Erro ao verificar limite no bottom nav:', err)
        setRestante(0)
      }
    }

    carregarLimite()
    const interval = setInterval(carregarLimite, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleAbrirOS = usarVerificacaoLimiteOS(navigate, onOpen)



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
      <Flex justify="space-around" align="center" position="relative">
        {tipoUsuario === 'admin' && (
          <>
            <IconButton icon={<FiHome />} variant="ghost" onClick={() => navigate('/admin')} aria-label="Dashboard" />
            <IconButton icon={<FiFolder />} variant="ghost" onClick={() => navigate('/admin/todas-ordens')} aria-label="Ordens" />

            {/* Ícone Central (Apenas para Admin) */}
            <IconButton
              icon={<ChatIcon boxSize={7} />}
              colorScheme="blue"
              size="lg"
              isRound
              position="absolute"
              top="-30px"
              left="50%"
              transform="translateX(-50%)"
              shadow="md"
              onClick={abrirChat}  // 👈 aqui chama a função que foi passada
              aria-label="Chat IA"
            />


            <IconButton icon={<FiBarChart2 />} variant="ghost" onClick={() => navigate('/admin/relatorio-dasboard')} aria-label="Métricas" />
            <IconButton icon={<FiUser />} variant="ghost" onClick={() => navigate('/admin/perfil')} aria-label="Perfil" />
          </>
        )}

        {tipoUsuario === 'empresa' && (
          <>
            <IconButton icon={<FiHome />} variant="ghost" onClick={() => navigate('/empresa')} aria-label="Dashboard" />
            <IconButton icon={<FiFolder />} variant="ghost" onClick={() => navigate('/empresa/ordens-abertas')} aria-label="Ordens" />
            <IconButton
              icon={<FiPlus />}
              colorScheme="blue"
              rounded="full"
              size="lg"
              mt="-30px"
              boxShadow="md"
              onClick={handleAbrirOS}
              aria-label="Nova O.S"
            />
            <IconButton icon={<FiBarChart2 />} variant="ghost" onClick={() => navigate('/empresa/metricas')} aria-label="Métricas" />
            <IconButton icon={<FiUser />} variant="ghost" onClick={() => navigate('/empresa/perfil')} aria-label="Perfil" />
          </>
        )}

        {tipoUsuario === 'tecnico' && (
          <>
            <IconButton icon={<FiHome />} variant="ghost" onClick={() => navigate('/tecnico')} aria-label="Dashboard" />
            <IconButton icon={<FiFolder />} variant="ghost" onClick={() => navigate('/tecnico/ordens')} aria-label="Ordens" />
            <IconButton icon={<FiBarChart2 />} variant="ghost" onClick={() => navigate('/tecnico/metricas')} aria-label="Métricas" />
            <IconButton icon={<FiUser />} variant="ghost" onClick={() => navigate('/tecnico/perfil')} aria-label="Perfil" />
          </>
        )}
      </Flex>

      {/* Modal de aviso */}
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

export default AdminBottomNav
