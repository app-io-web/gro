// src/pages/empresa/DetalheOrdemPendenciadaEmpresa.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Heading, Text, Spinner, Stack, useBreakpointValue,
  Card, CardBody, Icon, useColorModeValue, Button, Collapse,
} from '@chakra-ui/react'
import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react'
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
  { label: 'Pendenciada', key: 'Msg4' }
]

export default function DetalheOrdemPendenciadaEmpresa() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ordem, setOrdem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStep, setSelectedStep] = useState(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const borderColor = useColorModeValue('purple.500', 'purple.300')

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

  function renderMensagensRecursivamente(obj, level = 0, parentKey = '', renderedSet = new Set()) {
    return Object.entries(obj).flatMap(([key, value], index) => {
      const currentKey = `${parentKey}.${key}`
  
      if (typeof value === 'object' && value !== null) {
        return renderMensagensRecursivamente(value, level + 1, currentKey, renderedSet)
      }
  
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed === '' || renderedSet.has(trimmed)) return []
  
        renderedSet.add(trimmed)
  
        return (
          <Box
            key={`${currentKey}-${index}`}
            p={2}
            bg="gray.50"
            borderRadius="md"
            border="1px solid #eee"
            ml={level * 2}
          >
            <Text fontSize="sm" color="gray.700">
              <strong>Administrador:</strong> {trimmed}
            </Text>
          </Box>
        )
      }
  
      return []
    })
  }
  



  return (
    <Box display="flex" flexDirection="column">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box ml={!isMobile ? '250px' : 0} p={6} minH="100vh">
        <Heading size="lg" textAlign="center" color="purple.600" mb={6}>📌 Detalhes da Ordem Pendenciada</Heading>

        <Button
          leftIcon={<ArrowBackIcon />}
          colorScheme="purple"
          variant="ghost"
          mb={4}
          onClick={() => navigate('/empresa/ordens-pendenciadas')}
        >
          Voltar
        </Button>

        <Card bg="gray.50" boxShadow="xl" mb={8} rounded="lg">
          <CardBody>
            <Stack spacing={3}>
              <Text><strong>Técnico:</strong> {ordem.Tecnico_Responsavel || 'Não informado'}</Text>
              <Text><Icon as={FaUserAlt} mr={2} /> <strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
              <Text><Icon as={FaPhone} mr={2} /> <strong>Telefone:</strong> {ordem.Telefone1_Cliente}</Text>
              <Text><Icon as={FaMapMarkerAlt} mr={2} /> <strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
              <Text><strong>Tipo:</strong> {ordem.Tipo_OS}</Text>
              <Text><strong>Status:</strong> {ordem.Status_OS}</Text>
              <Text><Icon as={FaBuilding} mr={2} /> <strong>Empresa:</strong> {ordem.empresa}</Text>
            </Stack>
          </CardBody>
        </Card>

        {ordem.Motivo_Pendenciamento && (
          <Accordion defaultIndex={[0]} allowToggle mb={6}>
            <AccordionItem>
              <h2>
                <AccordionButton bg="purple.50" borderRadius="lg">
                  <Box flex="1" textAlign="left" fontWeight="bold" color="purple.600">
                    ⚠️ Motivo do Pendenciamento
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} bg="white" borderRadius="md">
                <Text fontSize="sm" color="gray.700">{ordem.Motivo_Pendenciamento}</Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}

        

        <Heading size="md" mb={4} color="purple.600">🔄 Andamento da Ordem</Heading>

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
      </Box>
    </Box>
  )
}
