import { useNavigate } from 'react-router-dom'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Input,
  useToast,
  Flex
} from '@chakra-ui/react'
import { useState } from 'react'
import { apiGet, apiPatch } from '../../../services/api'

function BotaoReagendar({ ordem, ...props }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [motivo, setMotivo] = useState('')
  const [novaData, setNovaData] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  const handleReagendar = async () => {
    if (!motivo.trim() || !novaData) {
      toast({
        title: 'Preencha todos os campos.',
        description: 'Motivo e nova data são obrigatórios.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      })
      return
    }
  
    if (!navigator.onLine) {
      const reagendamentosPendentes = JSON.parse(localStorage.getItem('reagendamentos_pendentes')) || []
    
      reagendamentosPendentes.push({
        ordem,
        motivo,
        novaData
      })
    
      localStorage.setItem('reagendamentos_pendentes', JSON.stringify(reagendamentosPendentes))
    
      toast({
        title: 'Sem conexão',
        description: 'Reagendamento salvo offline. Será enviado quando voltar à internet.',
        status: 'info',
        duration: 5000,
        isClosable: true
      })
    
      onClose()
      navigate('/tecnico') // já navega de volta
      return
    }
    
  
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      let registroEncontrado = null
      let recordId = null
      let novaListaEmpresas = []
  
      for (const registro of res.list) {
        const raw = registro['Ordem de Serviços']
        const json = typeof raw === 'string' ? JSON.parse(raw) : raw
  
        const empresasAtualizadas = json.empresas.map(emp => {
          const ordensAtualizadas = emp.Ordens_de_Servico?.map(os => {
            if (os.UnicID_OS === ordem.UnicID_OS && os.Numero_OS === ordem.Numero_OS) {
              recordId = registro.id || registro.Id
              registroEncontrado = registro
  
              return {
                ...os,
                Status_OS: 'Reagendada',
                Reagendamento: novaData,
                Motivo_Reagendamento: motivo
              }
            }
            return os
          })
  
          return {
            ...emp,
            Ordens_de_Servico: ordensAtualizadas
          }
        })
  
        if (recordId) {
          novaListaEmpresas = empresasAtualizadas
          break
        }
      }
  
      if (!recordId || !registroEncontrado) {
        toast({
          title: 'Erro',
          description: 'Registro da O.S não encontrado para reagendar.',
          status: 'error',
          duration: 4000,
          isClosable: true
        })
        return
      }
  
      const payload = [
        {
          Id: registroEncontrado.Id,
          'Ordem de Serviços': JSON.stringify({ empresas: novaListaEmpresas })
        }
      ]
  
      console.log('📤 Enviando PATCH Reagendar:', payload)
  
      await apiPatch(`/api/v2/tables/mtnh21kq153to8h/records`, payload)
  
      toast({
        title: '✅ Ordem reagendada!',
        description: `Reagendada para ${new Date(novaData).toLocaleString('pt-BR')}`,
        status: 'success',
        duration: 2500,
        isClosable: true,
        onCloseComplete: () => {
          navigate('/tecnico')
        }
      })
  
      onClose()
  
    } catch (error) {
      console.error('❌ Erro ao reagendar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível reagendar a O.S.',
        status: 'error',
        duration: 4000,
        isClosable: true
      })
    }
  }
  

  return (
    <>
      <Button onClick={onOpen} flex="1" minW="130px" {...props}>
        Reagendar
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reagendar Ordem</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction="column" gap={4}>
              <Textarea
                placeholder="Motivo do reagendamento"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                minH="100px"
              />
              <Input
                type="datetime-local"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
              />
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleReagendar}
              isDisabled={!motivo.trim() || !novaData}
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default BotaoReagendar
