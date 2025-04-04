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
  Flex,
  IconButton
} from '@chakra-ui/react'
import { Phone } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'

function BotaoChamarCliente({ telefone1, telefone2, ...props }) {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const ligar = (numero) => {
    window.location.href = `tel:${numero}`
  }

  const whatsapp = (numero) => {
    const formatado = numero.replace(/\D/g, '') // remove tudo que não é número
    window.open(`https://wa.me/${formatado}`, '_blank')
  }

  return (
    <>
      <Button onClick={onOpen} colorScheme="gray" {...props}>
        Chamar cliente
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contatar Cliente</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Flex direction="column" gap={4}>
              {telefone1 && (
                <Flex align="center" gap={3}>
                  <Button leftIcon={<Phone size={18} />} onClick={() => ligar(telefone1)} flex="1">
                    Ligar: {telefone1}
                  </Button>
                  <IconButton
                    icon={<FontAwesomeIcon icon={faWhatsapp} />}
                    aria-label="WhatsApp 1"
                    onClick={() => whatsapp(telefone1)}
                    colorScheme="whatsapp"
                  />
                </Flex>
              )}

              {telefone2 && (
                <Flex align="center" gap={3}>
                  <Button leftIcon={<Phone size={18} />} onClick={() => ligar(telefone2)} flex="1">
                    Ligar: {telefone2}
                  </Button>
                  <IconButton
                    icon={<FontAwesomeIcon icon={faWhatsapp} />}
                    aria-label="WhatsApp 2"
                    onClick={() => whatsapp(telefone2)}
                    colorScheme="whatsapp"
                  />
                </Flex>
              )}
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default BotaoChamarCliente
