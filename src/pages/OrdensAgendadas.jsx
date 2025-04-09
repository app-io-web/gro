// src/pages/OrdensAgendadas.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom' // 👈 importa o useNavigate!
import { Select } from '@chakra-ui/react' // 👈 importa lá em cima também
import {
  Box, Heading, Text, VStack, Spinner, Badge, useToast, useBreakpointValue, Flex
} from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, Button as ButtonChakra, useDisclosure } from '@chakra-ui/react'
import { apiPatch } from '../services/api' // 👈 já que você usa apiPatch pra salvar
import { apiGet } from '../services/api'
import AdminSidebarDesktop from '../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../components/admin/AdminBottomNav'
import AdminMobileMenu from '../components/admin/AdminMobileMenu'

function OrdensAgendadas() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const [tecnicos, setTecnicos] = useState([]) // 👈 ADICIONA ESSA LINHA AQUI

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('')
  const [ordemSelecionada, setOrdemSelecionada] = useState(null)
  const [loadingSalvar, setLoadingSalvar] = useState(false)

  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate()
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')



  const abrirModalTrocarTecnico = (ordem) => {
    setOrdemSelecionada(ordem)
    setTecnicoSelecionado(ordem.Tecnico_Responsavel || '')
    onOpen()
  }
  
  const salvarNovoTecnico = async () => {
    if (!ordemSelecionada || !tecnicoSelecionado) return
  
    try {
      setLoadingSalvar(true)
  
      console.log('🔵 Ordem selecionada:', ordemSelecionada)
  
      const res = await apiGet(`/api/v2/tables/mtnh21kq153to8h/records/${ordemSelecionada.registroId}`)
      const registro = res
  
      console.log('🟢 Registro original do NocoDB:', registro)
  
      const jsonOriginal = typeof registro['Ordem de Serviços'] === 'string'
        ? JSON.parse(registro['Ordem de Serviços'])
        : registro['Ordem de Serviços']
  
      console.log('🟠 JSON original da ordem:', jsonOriginal)
  
      const novaEstrutura = {
        ...jsonOriginal,
        empresas: jsonOriginal.empresas.map(empresa => {
          if (empresa.UnicID_Empresa !== ordemSelecionada.UnicID_Empresa) return empresa
  
          return {
            ...empresa,
            Ordens_de_Servico: empresa.Ordens_de_Servico.map(os =>
              os.UnicID_OS === ordemSelecionada.UnicID_OS
                ? { 
                    ...os,
                    Tecnico_Responsavel: tecnicoSelecionado.nome,  // agora certo
                    ID_Tecnico_Responsavel: tecnicoSelecionado.id, // agora certo
                    Data_Agendamento_OS: os.Data_Agendamento_OS,    // mantém data antiga
                    Horario_Agendamento_OS: os.Horario_Agendamento_OS // mantém horário antigo
                  }
                : os
            )
          }
        })
      }
  
      console.log('🟡 Nova estrutura pronta para salvar:', novaEstrutura)
  
      await apiPatch(`/api/v2/tables/mtnh21kq153to8h/records`, {
        Id: ordemSelecionada.registroId,
        'Ordem de Serviços': JSON.stringify(novaEstrutura)
      })
  
      console.log('✅ PATCH enviado com sucesso!')
  
      toast({
        title: 'Técnico alterado com sucesso!',
        status: 'success',
        duration: 3000
      })
  
      onClose()
    } catch (err) {
      console.error('❌ Erro ao salvar técnico:', err)
      toast({
        title: 'Erro ao salvar técnico',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoadingSalvar(false)
    }
  }
  
  
  
  

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const ordens = res.list.flatMap(item => {
          const rawJson = item['Ordem de Serviços']
          if (!rawJson) return []
          const json = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson
          if (!json?.empresas) return []
          return json.empresas.flatMap(empresa =>
            empresa.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: empresa.empresa,
              UnicID_Empresa: empresa.UnicID_Empresa,
              registroId: item.Id // 👈 ADICIONA ISSO
            }))
          )
        })
        

        setOrdens(ordens)
      } catch (err) {
        console.error('Erro ao buscar ordens:', err)
        toast({
          title: 'Erro ao buscar ordens',
          status: 'error',
          duration: 3000
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()
    const interval = setInterval(fetchOrdens, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const res = await apiGet('/api/v2/tables/mpyestriqe5a1kc/records')
        setTecnicos(res.list || [])
      } catch (err) {
        console.error('Erro ao buscar técnicos:', err)
      }
    }
    fetchTecnicos()
  }, [])
  

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
  
      <Box p={6} ml={!isMobile ? '250px' : 0} w="full" pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}
        
        <Heading size="lg" mb={4}>Ordens Agendadas</Heading>
  
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <>
            {/* Filtro de datas */}
            <Flex mb={4} gap={4} align="center" flexWrap="wrap">
              <Box>
                <Text fontSize="sm" mb={1}>Data Inicial</Text>
                <input
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </Box>
  
              <Box>
                <Text fontSize="sm" mb={1}>Data Final</Text>
                <input
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
              </Box>
            </Flex>
  
            {/* Listagem de ordens */}
            <VStack align="stretch" spacing={4}>
              {ordens
                .filter((os) => os.Status_OS === 'Agendada')
                .filter((os) => {
                  if (!dataInicial && !dataFinal) return true
                  const dataEnvio = new Date(os.Data_Envio_OS)
                  const inicio = dataInicial ? new Date(dataInicial + 'T00:00:00') : null
                  const fim = dataFinal ? new Date(dataFinal + 'T23:59:59') : null
  
                  if (inicio && fim) {
                    return dataEnvio >= inicio && dataEnvio <= fim
                  } else if (inicio) {
                    return dataEnvio >= inicio
                  } else if (fim) {
                    return dataEnvio <= fim
                  }
                  return true
                })
                .map((os) => (
                  <Box
                    key={os.UnicID_OS}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                    boxShadow="sm"
                    position="relative"
                    transition="all 0.2s"
                    _hover={{ boxShadow: 'md', cursor: 'pointer', bg: 'gray.50' }}
                    onClick={() => navigate(`/admin/ordem-execucao/${os.UnicID_OS}`)}
                  >
                  <VStack align="stretch" spacing={2}>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontWeight="bold">Empresa: {os.empresa}</Text>

                        {/* NOVO FLEX para agrupar os badges */}
                        <Flex align="center" gap={2} mt={2} flexWrap="wrap">
                          <Badge
                            colorScheme="pink"
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontSize="xs"
                          >
                            AGENDADA
                          </Badge>

                          <Badge
                            colorScheme={
                              os.TipoCliente === 'Empresarial' ? 'blue'
                              : os.TipoCliente === 'Residencial' ? 'green'
                              : 'gray'
                            }
                            fontSize="0.7em"
                            p={1}
                            rounded="md"
                          >
                            {os.TipoCliente || 'Tipo não informado'}
                          </Badge>
                        </Flex>
                      </Box>

                      {/* Botão mudar técnico */}
                      <ButtonChakra
                        size="sm"
                        colorScheme="blue"
                        onClick={(e) => {
                          e.stopPropagation()
                          abrirModalTrocarTecnico(os)
                        }}
                      >
                        Mudar de Técnico
                      </ButtonChakra>
                    </Flex>

                    <Text>Tipo: {os.Tipo_OS}</Text>
                    <Text>Cliente: {os.Nome_Cliente}</Text>
                    <Text><strong>Técnico:</strong> {os.Tecnico_Responsavel || 'Sem Técnico'}</Text>
                    <Text>Endereço: {os.Endereco_Cliente}</Text>
                    <Text>
                      {`Data de Envio: ${new Date(os.Data_Envio_OS).toLocaleString('pt-BR')}`}
                    </Text>
                  </VStack>

                  </Box>
                ))}
            </VStack>
          </>
        )}
  
        {/* Modal de mudar técnico */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Mudar Técnico</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <Select
                  placeholder="Selecione o novo técnico"
                  value={tecnicoSelecionado?.id || ''}
                  onChange={(e) => {
                    const idSelecionado = e.target.value
                    const tecnico = tecnicos.find(t => t.ID_Tecnico_Responsavel === idSelecionado)
                    if (tecnico) {
                      setTecnicoSelecionado({
                        id: tecnico.ID_Tecnico_Responsavel,
                        nome: tecnico.Tecnico_Responsavel
                      })
                    }
                  }}
                >
                  {tecnicos
                    .filter((tecnico) => tecnico.Tecnico_Responsavel && tecnico.Tecnico_Responsavel.toLowerCase() !== 'sem técnico')
                    .map((tecnico) => (
                      <option
                        key={tecnico.ID_Tecnico_Responsavel}
                        value={tecnico.ID_Tecnico_Responsavel}
                      >
                        {tecnico.Tecnico_Responsavel}
                      </option>
                    ))
                  }
                </Select>


            </ModalBody>
  
            <ModalFooter>
              <ButtonChakra variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </ButtonChakra>
              <ButtonChakra colorScheme="blue" onClick={salvarNovoTecnico} isLoading={loadingSalvar}>
                Salvar
              </ButtonChakra>
            </ModalFooter>
          </ModalContent>
        </Modal>
  
      </Box>
    </Box>
  )
  
  
}

export default OrdensAgendadas
