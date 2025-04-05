// src/pages/admin/DetalheOrdemFinalizadaAdmin.jsx

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Heading, Text, Spinner, Stack, useBreakpointValue,
  Card, CardBody, Icon, useColorModeValue, Badge, Collapse, Image, SimpleGrid, Button,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody
} from '@chakra-ui/react'

import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react'

import { ArrowBackIcon } from '@chakra-ui/icons'
import { FaUserAlt, FaPhone, FaMapMarkerAlt, FaBuilding } from 'react-icons/fa'
import { apiGet } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import StepperOrdemServico from '../admin/StepperOrdemServico'

const steps = [
  { label: 'Atribuído', key: 'Msg0' },
  { label: 'Em Deslocamento', key: 'Msg1' },
  { label: 'Chegou no Local', key: 'Msg2' },
  { label: 'Execução', key: 'Msg3' },
  { label: 'Finalizado', key: 'Msg4' }
]

export default function DetalheOrdemFinalizadaAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ordem, setOrdem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStep, setSelectedStep] = useState(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [imagemSelecionada, setImagemSelecionada] = useState(null)
  const bgCard = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('green.500', 'green.300')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const todasOrdens = res.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string'
            ? JSON.parse(item['Ordem de Serviços'])
            : item['Ordem de Serviços']

          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: emp.empresa,
              UnicID_Empresa: emp.UnicID_Empresa
            }))
          )
        })

        const ordemSelecionada = todasOrdens.find(os => os.UnicID_OS === id)
        setOrdem(ordemSelecionada)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) return <Spinner size="xl" mt={20} />
  if (!ordem) return <Text>Ordem não encontrada</Text>

  const currentStep = steps.findIndex(step => ordem.Status_OS?.toLowerCase().includes(step.label.toLowerCase()))

  return (
    <Box display="flex" flexDirection="column">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box
          ml={!isMobile ? '250px' : 0}
          p={6}
          minH="100vh"
          pb={isMobile ? '100px' : '0'} // 👈 adiciona paddingBottom no mobile
        >

        <Heading size="lg" textAlign="center" color="blue.600" mb={6}>🔍 Detalhes da Ordem Finalizada</Heading>

        <Button
          leftIcon={<ArrowBackIcon />}
          colorScheme="blue"
          variant="ghost"
          mb={4}
          onClick={() => navigate('/admin/ordens-finalizadas')}
        >
          Voltar
        </Button>

        <Card bg={bgCard} boxShadow="xl" mb={8} rounded="lg">
          <CardBody>
            <Stack spacing={3}>
              <Text><strong>Técnico:</strong> {ordem.Tecnico_Responsavel || 'Não informado'}</Text>
              <Text><Icon as={FaUserAlt} mr={2} /> <strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
              <Text><Icon as={FaPhone} mr={2} /> <strong>Telefone:</strong> {ordem.Telefone1_Cliente}</Text>
              <Text><Icon as={FaMapMarkerAlt} mr={2} /> <strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
              <Text><strong>Tipo:</strong> {ordem.Tipo_OS}</Text>
              <Text><strong>Status:</strong> <Badge colorScheme="green">{ordem.Status_OS}</Badge></Text>
              <Text><Icon as={FaBuilding} mr={2} /> <strong>Empresa:</strong> {ordem.empresa}</Text>
            </Stack>
          </CardBody>
        </Card>

        <Heading size="md" mb={4} color="green.600">📌 Andamento da Ordem</Heading>

        <StepperOrdemServico
          steps={steps}
          activeStep={currentStep === -1 ? 0 : currentStep}
          onStepClick={(index) => setSelectedStep(index === selectedStep ? null : index)}
        />

        <Stack spacing={4} mt={6}>
          {steps.map((step, index) => (
            <Collapse in={selectedStep === index} animateOpacity key={index}>
              <Box
                p={4}
                borderLeft="4px solid"
                borderColor={borderColor}
                bg="white"
                rounded="md"
                boxShadow="md"
              >
                <Text color="gray.600">
                  {ordem?.Andamento_técnico?.[step.key] || 'Nenhuma informação registrada'}
                </Text>
              </Box>
            </Collapse>
          ))}
        </Stack>

                {ordem.Materiais_Utilizados && (
                <Box mt={10}>
                    <Heading size="md" mb={4} color="orange.500">🛠️ Materiais Utilizados</Heading>
                    
                    <Accordion allowToggle>
                    <AccordionItem border="none">
                        <h2>
                        <AccordionButton
                            _expanded={{ bg: 'orange.100', color: 'orange.600' }}
                            borderRadius="md"
                            boxShadow="md"
                        >
                            <Box as="span" flex="1" textAlign="left">
                            Ver Materiais Utilizados
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        </h2>

                        <AccordionPanel pb={4}>
                        <Card bg={bgCard} boxShadow="md" rounded="lg">
                            <CardBody>
                            <Stack spacing={3}>
                                {ordem.Materiais_Utilizados.Drop_Metros !== undefined && (
                                <Text><strong>Drop (metros):</strong> {ordem.Materiais_Utilizados.Drop_Metros}</Text>
                                )}
                                {ordem.Materiais_Utilizados.Esticadores !== undefined && (
                                <Text><strong>Esticadores:</strong> {ordem.Materiais_Utilizados.Esticadores}</Text>
                                )}
                                {ordem.Materiais_Utilizados.Conectores !== undefined && (
                                <Text><strong>Conectores:</strong> {ordem.Materiais_Utilizados.Conectores}</Text>
                                )}
                                {ordem.Materiais_Utilizados.FixaFio !== undefined && (
                                <Text><strong>Fixa Fio:</strong> {ordem.Materiais_Utilizados.FixaFio}</Text>
                                )}
                                {ordem.Materiais_Utilizados.Outros && (
                                <Text><strong>Outros Materiais:</strong> {ordem.Materiais_Utilizados.Outros}</Text>
                                )}
                            </Stack>
                            </CardBody>
                        </Card>
                        </AccordionPanel>
                    </AccordionItem>
                    </Accordion>
                </Box>
                )}



        {/* Evidências */}
        {ordem.Evidencias && (
          <Box mt={10}>
            <Heading size="md" mb={4} color="blue.500">📸 Evidências</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
              {Object.entries(ordem.Evidencias).map(([key, foto], idx) => (
                <Card
                  key={idx}
                  boxShadow="md"
                  cursor="pointer"
                  onClick={() => {
                    setImagemSelecionada(foto)
                    onOpen()
                  }}
                >
                  <Image
                    src={foto.url.startsWith('http') ? foto.url : `/evidencias/${foto.url}`}
                    alt={foto.comentario || `Foto ${key}`}
                    objectFit="cover"
                    roundedTop="md"
                    maxH="200px"
                    w="full"
                  />
                  <CardBody>
                    <Text fontSize="sm" color="gray.600">{foto.comentario}</Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            {/* Modal de imagem */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{imagemSelecionada?.comentario}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {imagemSelecionada && (
                    <Image
                      src={imagemSelecionada.url.startsWith('http')
                        ? imagemSelecionada.url
                        : `/evidencias/${imagemSelecionada.url}`}
                      alt={imagemSelecionada.comentario}
                      w="full"
                      h="auto"
                      borderRadius="md"
                    />
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>
          </Box>
        )}
      </Box>
    </Box>
  )
}
