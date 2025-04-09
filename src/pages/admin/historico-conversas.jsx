import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack, Spinner, Flex, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'
import { useBreakpointValue } from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'

import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'

export default function HistoricoConversas() {
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [conversasSelecionadas, setConversasSelecionadas] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        const res = await fetch('https://inte.groia.nexusnerds.com.br/historico-conversas')
        const data = await res.json()
        setHistorico(data)
      } catch (error) {
        console.error('Erro ao buscar histórico:', error)
      } finally {
        setLoading(false)
      }
    }

    buscarHistorico()
  }, [])

  const abrirConversasDoDia = (conversas, data) => {
    setConversasSelecionadas(conversas)
    setDataSelecionada(data)
    onOpen()
  }

  return (
    <Box display="flex" minH="100vh" bg="gray.100">
      <AdminSidebarDesktop />

      <Box ml={{ base: 0, md: '250px' }} p={6} w="full" pb={{ base: '60px', md: 0 }}>
        {isMobile && <AdminMobileMenu />}
        
        <Heading size="lg" mb={6} color="gray.800">Histórico de Conversas da IA 🤖</Heading>

        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <VStack spacing={6} align="stretch">
            {historico.length === 0 ? (
              <Text color="gray.600">Nenhuma conversa encontrada.</Text>
            ) : (
              historico.map((item, idx) => (
                <Box
                  key={idx}
                  p={5}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="white"
                  boxShadow="md"
                  _hover={{ boxShadow: 'lg', bg: 'gray.50' }}
                  transition="0.3s"
                  cursor="pointer"
                  onClick={() => abrirConversasDoDia(item.conversas, item.data)}
                >
                  <Text fontSize="md" fontWeight="bold" color="gray.700">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {item.conversas.length} conversa(s)
                  </Text>
                </Box>
              ))
            )}
          </VStack>
        )}

        {isMobile && <AdminBottomNav />}
      </Box>

      {/* Modal para mostrar conversas do dia */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Conversas de {new Date(dataSelecionada).toLocaleDateString('pt-BR')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {conversasSelecionadas.map((conv, idx) => (
                <Box
                  key={idx}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="gray.50"
                  boxShadow="sm"
                >
                  <Box bg="blue.50" p={3} borderRadius="md" mb={3}>
                    <Badge colorScheme="blue" mb={1}>PERGUNTA</Badge>
                    <ReactMarkdown>{conv.pergunta}</ReactMarkdown>
                  </Box>

                  <Box bg="green.50" p={3} borderRadius="md">
                    <Badge colorScheme="green" mb={1}>RESPOSTA</Badge>
                    <ReactMarkdown>{conv.resposta}</ReactMarkdown>
                  </Box>

                  <Text mt={2} fontSize="xs" color="gray.500">
                    Feito em: {new Date(conv.dataHora).toLocaleString('pt-BR')}
                  </Text>
                </Box>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
