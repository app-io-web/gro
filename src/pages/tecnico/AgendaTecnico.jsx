import {
  Box, Heading, Text, Flex, Button, Stack, Badge, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Spinner, IconButton
} from '@chakra-ui/react'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiGet } from '../../services/api'
import TecnicoBottomNav from '../../components/tecnico/TecnicoBottomNav'
import { useOfflineData } from '../../hooks/useOfflineData'

function AgendaTecnico() {
  const [ordens, setOrdens] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const navigate = useNavigate()

  const tecnicoID = localStorage.getItem('ID_Tecnico_Responsavel')

  const { data: registros, loading, offline } = useOfflineData({
    url: '/api/v2/tables/mtnh21kq153to8h/records',
    localKey: `ordens_tecnico_${tecnicoID}`
  })

  const formatarDataCabecalho = (data) => {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  }

  const formatarDataCompleta = (data) => {
    return data.toLocaleDateString('pt-BR')
  }

  const irParaAnterior = () => {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() - 1)
    setDataSelecionada(novaData)
  }

  const irParaProximo = () => {
    const novaData = new Date(dataSelecionada)
    novaData.setDate(novaData.getDate() + 1)
    setDataSelecionada(novaData)
  }

  const getCorStatus = (status) => {
    switch (status) {
      case 'Atribuída': return 'blue';
      case 'Pendente': return 'yellow';
      case 'Execução': return 'orange';
      case 'Finalizada': return 'green';
      case 'Cancelado': return 'red';
      case 'Reagendada': return 'purple';
      case 'Improdutiva': return 'gray';
      default: return 'gray';
    }
  }

  const irParaDetalhes = (ordem) => {
    if (ordem.UnicID_OS) {
      navigate(`/tecnico/ordem/${ordem.UnicID_OS}`, { state: { ordem } }) // 👈🔥 aqui passa a ordem inteira
    }
  }
  

  useEffect(() => {
    if (!registros) return
  
    const hoje = dataSelecionada.toISOString().slice(0, 10)
    const lista = []
  
    registros.list.forEach(registro => {
      const raw = registro['Ordem de Serviços']
      const json = typeof raw === 'string' ? JSON.parse(raw) : raw
  
      json.empresas.forEach(emp => {
        emp.Ordens_de_Servico?.forEach(ordem => {
          if (ordem.ID_Tecnico_Responsavel !== tecnicoID) return
  
          const isFinalizada = ordem.Status_OS?.toLowerCase() === 'finalizado'
          
          const dataReferencia = isFinalizada
            ? ordem?.Data_Entrega_OS?.slice(0, 10) // 👉 usa a Data_Entrega_OS se for Finalizada
            : (ordem.Status_OS === 'Reagendada'
                ? ordem?.Reagendamento?.slice(0, 10)
                : ordem?.Data_Envio_OS?.slice(0, 10))
  
          if (dataReferencia === hoje) {
            lista.push({ ...ordem, empresa: emp.empresa })
          }
        })
      })
    })
  
    setOrdens(lista)
  }, [registros, dataSelecionada])
  

  if (loading) return <Spinner mt={10} />

  const ordensAbertas = ordens.filter(o => o.Status_OS?.toLowerCase() !== 'finalizado')
  const ordensFinalizadas = ordens.filter(o => o.Status_OS?.toLowerCase() === 'finalizado')
  

  return (
    <Box pb="70px">
      {/* Topo agenda */}
      <Flex align="center" justify="center" p={4} bg="green.600" color="white">
        <Heading size="md">Minha agenda</Heading>
      </Flex>

      {/* Navegação de datas */}
      <Flex justify="center" align="center" gap={4} mt={4}>
        <IconButton
          icon={<ChevronLeft size={20} />}
          aria-label="Dia anterior"
          size="sm"
          onClick={irParaAnterior}
          variant="ghost"
          colorScheme="blue"
        />
        <Text fontWeight="bold">{formatarDataCabecalho(dataSelecionada)}</Text>
        <IconButton
          icon={<ChevronRight size={20} />}
          aria-label="Próximo dia"
          size="sm"
          onClick={irParaProximo}
          variant="ghost"
          colorScheme="blue"
        />
      </Flex>

      {/* Ordens abertas */}
      {ordensAbertas.length > 0 && (
        <Box mt={4} px={4}>
          <Text fontSize="sm" color="gray.600" mb={2}>Ordens em andamento</Text>
          <Stack spacing={4}>
            {ordensAbertas.map((ordem, idx) => (
              <Box
                key={idx}
                p={4}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                cursor="pointer"
                onClick={() => irParaDetalhes(ordem)}
              >
                <Text><strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
                <Text><strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
                <Badge colorScheme={getCorStatus(ordem.Status_OS)}>{ordem.Status_OS}</Badge>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Ordens finalizadas em acordeon */}
      <Box mt={4} px={4}>
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {formatarDataCompleta(dataSelecionada)} - FINALIZADAS
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              {ordensFinalizadas.length > 0 ? (
                <Stack spacing={4}>
                  {ordensFinalizadas.map((ordem, idx) => (
                    <Box
                      key={idx}
                      p={4}
                      shadow="md"
                      borderWidth="1px"
                      borderRadius="lg"
                      cursor="pointer"
                      onClick={() => irParaDetalhes(ordem)}
                    >
                      <Text><strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
                      <Text><strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
                      <Badge colorScheme={getCorStatus(ordem.Status_OS)}>{ordem.Status_OS}</Badge>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text fontSize="sm" color="gray.500">Nenhuma ordem finalizada.</Text>
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>

      <TecnicoBottomNav />
    </Box>
  )
}

export default AgendaTecnico
