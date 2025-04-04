import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  VStack,
  ButtonGroup,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'

const motivosPadrao = [
  '1001 - Local Fechado',
  '1002 - Chuva',
  '1003 - CDOE Sem Potência',
  '1004 - Sem Viabilidade Técnica'
]

function BotaoPendenciar({ onConfirmar, ...props }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [motivo, setMotivo] = useState('')
  const toast = useToast()

  const handleConfirmar = () => {
    if (!motivo.trim()) {
      toast({
        title: 'Motivo obrigatório',
        description: 'Por favor, informe o motivo do pendenciamento.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
      return
    }
    onConfirmar(motivo)
    onClose()
    setMotivo('') // limpa após fechar
  }

  const selecionarMotivoPadrao = (texto) => {
    setMotivo(texto)
  }

  return (
    <>
      <Button onClick={onOpen} colorScheme="yellow" {...props}>
        PENDENCIAR O.S
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Informe o motivo do pendenciamento</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Textarea
              placeholder="Digite o motivo..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              mb={4}
            />

            <VStack align="stretch" spacing={2}>
              {motivosPadrao.map((texto, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => selecionarMotivoPadrao(texto)}
                >
                  {texto}
                </Button>
              ))}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="yellow" onClick={handleConfirmar}>
                Confirmar
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default BotaoPendenciar
