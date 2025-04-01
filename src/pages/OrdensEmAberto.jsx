import { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Badge,
  useToast,
  useBreakpointValue
} from '@chakra-ui/react'
import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
    ModalBody, ModalFooter, Button, Textarea
  } from '@chakra-ui/react'

import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Tooltip, IconButton, HStack, Link } from '@chakra-ui/react'


import { useDisclosure } from '@chakra-ui/react'
import { Select } from '@chakra-ui/react' // certifique-se de importar
import { Collapse } from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'



import { apiGet, apiPatch  } from '../services/api'
import AdminSidebarDesktop from '../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../components/admin/AdminBottomNav'
import AdminMobileMenu from '../components/admin/AdminMobileMenu'

function OrdensEmAberto() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [ordemSelecionada, setOrdemSelecionada] = useState(null)
  const [mensagemAndamento, setMensagemAndamento] = useState('')
  const [novoStatus, setNovoStatus] = useState('')
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false) // ✅ ADICIONE ISSO

  const { isOpen: isOpenObservacao, onOpen: onOpenObservacao, onClose: onCloseObservacao } = useDisclosure()
  const [novaObservacao, setNovaObservacao] = useState('')

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

        const ordens = res.list.flatMap(item => {
            const rawJson = item['Ordem de Serviços']
          
            if (!rawJson) return []
          
            const json = typeof rawJson === 'string'
              ? JSON.parse(rawJson)
              : rawJson
          
            if (!json?.empresas) return []
          
            return json.empresas.flatMap(empresa =>
              empresa.Ordens_de_Servico.map(os => ({
                ...os,
                empresa: empresa.empresa,
                UnicID_Empresa: empresa.UnicID_Empresa
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
  }, [])

  const salvarAlteracaoNoBanco = async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      const registro = res.list.find(item =>
        JSON.stringify(item['Ordem de Serviços']).includes(ordemSelecionada.UnicID_OS)
      )
  
      if (!registro) throw new Error('Registro não encontrado.')
  
      // Parse do JSON interno
      const jsonOriginal = typeof registro['Ordem de Serviços'] === 'string'
        ? JSON.parse(registro['Ordem de Serviços'])
        : registro['Ordem de Serviços']
  
      // Atualiza a OS dentro da empresa
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
                    Status_OS: novoStatus,
                    Observacao_Administrador: mensagemAndamento
                  }
                : os
            )
          }
        })
      }
  
      // PATCH com a estrutura nova
      await apiPatch('/api/v2/tables/mtnh21kq153to8h/records', {
        Id: registro.Id,
        'Ordem de Serviços': novaEstrutura
      })
  
      toast({
        title: 'Ordem salva no banco!',
        status: 'success',
        duration: 3000
      })
    } catch (err) {
      console.error('Erro ao salvar:', err)
      toast({
        title: 'Erro ao salvar no banco',
        status: 'error',
        duration: 3000
      })
    }
  }

  const salvarNovaObservacao = async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      const registro = res.list.find(item =>
        JSON.stringify(item['Ordem de Serviços']).includes(ordemSelecionada.UnicID_OS)
      )
      if (!registro) throw new Error('Registro não encontrado.')
  
      const json = typeof registro['Ordem de Serviços'] === 'string'
        ? JSON.parse(registro['Ordem de Serviços'])
        : registro['Ordem de Serviços']
  
      const novaEstrutura = {
        ...json,
        empresas: json.empresas.map(empresa => {
          if (empresa.UnicID_Empresa !== ordemSelecionada.UnicID_Empresa) return empresa
  
          return {
            ...empresa,
            Ordens_de_Servico: empresa.Ordens_de_Servico.map(os => {
              if (os.UnicID_OS !== ordemSelecionada.UnicID_OS) return os
  
              const obs = typeof os.Observacao_Administrador === 'object' ? os.Observacao_Administrador : { Msg0: os.Observacao_Administrador }
  
              const nextKey = `Msg${Object.keys(obs).length}`
              return {
                ...os,
                Observacao_Administrador: {
                  ...obs,
                  [nextKey]: novaObservacao
                }
              }
            })
          }
        })
      }
  
      await apiPatch('/api/v2/tables/mtnh21kq153to8h/records', {
        Id: registro.Id,
        'Ordem de Serviços': novaEstrutura
      })
  
      toast({ title: 'Observação adicionada!', status: 'success', duration: 3000 })
      onCloseObservacao()
      setNovaObservacao('')
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao adicionar observação', status: 'error', duration: 3000 })
    }
  }
  


  return (

    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}

      <Box
        p={6}
        ml={!isMobile ? '250px' : 0}
        w="full"
        pb={isMobile ? '60px' : 0}
      >
        {isMobile && <AdminBottomNav />}

        <Heading size="lg" mb={4}>Ordens em Aberto</Heading>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <VStack align="stretch" spacing={4}>
            {ordens.map((os) => (
                <Box
                    key={os.UnicID_OS}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                    boxShadow="sm"
                    position="relative" // IMPORTANTE para o botão seguir esse box
                    transition="all 0.2s"
                    _hover={{ boxShadow: 'md', cursor: 'pointer', bg: 'gray.50' }}
                    onClick={() => {
                        setOrdemSelecionada(os)
                        setMensagemAndamento(os.Observacao_Administrador || '')
                        setNovoStatus(os.Status_OS)
                        onOpen()
                    }}
                    >
                    {/* Botão no canto superior (só desktop) */}
                    {!isMobile && (
                    <Box position="absolute" top={2} right={2} zIndex={1}>
                        <Button
                        size="sm"
                        colorScheme="purple"
                        onClick={(e) => {
                            e.stopPropagation()
                            setOrdemSelecionada(os)
                            onOpenObservacao()
                        }}
                        >
                        Adicionar Observação
                        </Button>
                    </Box>
                    )}
                    


                    {/* Conteúdo da O.S */}
                    <VStack align="start" spacing={2}>
                        <Text fontWeight="bold">Empresa: {os.empresa}</Text>
                        <Text>Tipo: {os.Tipo_OS}</Text>
                        <Text>Cliente: {os.Nome_Cliente}</Text>
                        <Text>Endereço: {os.Endereco_Cliente}</Text>
                        <Text>Data de Entrega: {new Date(os.Data_Entrega_OS).toLocaleString('pt-BR')}</Text>
                        <Badge
                        colorScheme={
                            os.Status_OS === 'Pendente'
                            ? 'yellow'
                            : os.Status_OS === 'Finalizado'
                            ? 'green'
                            : os.Status_OS === 'Execução'
                            ? 'blue'
                            : os.Status_OS === 'Atribuido'
                            ? 'purple'
                            : 'gray'
                        }
                        >
                        {os.Status_OS}
                        </Badge>
                    </VStack>
                    </Box>


            ))}
          </VStack>
        )}



        
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay />



        <ModalContent
                borderRadius="2xl"
                bg="gray.50"
                maxH="90vh" // limite de altura do modal
                overflow="hidden" // evita que o modal inteiro "vaze"
                >
                <ModalHeader
                    fontSize="xl"
                    fontWeight="bold"
                    textAlign="center"
                    borderBottom="1px solid #E2E8F0"
                    pb={2}
                >
                    📝 Ordem de Serviço
                </ModalHeader>
            <ModalCloseButton />

            <ModalBody
                mt={4}
                overflowY="auto"
                maxH="65vh" // o conteúdo interno poderá rolar se passar disso
                px={4}
            >
                {isMobile && (
                <Box mb={4} display="flex" justifyContent="flex-end">
                    <Button
                    size="sm"
                    colorScheme="purple"
                    onClick={() => {
                        onOpenObservacao()
                        onClose() // opcional: fecha o modal atual pra focar no de observação
                    }}
                    >
                    Adicionar Observação
                    </Button>
                </Box>
                )}


            <Text fontSize="sm" color="gray.500" mb={2}>Técnico Responsável</Text>
            <Text fontWeight="semibold" mb={4}>{ordemSelecionada?.Tecnico_Responsavel}</Text>

            <Select
                mb={4}
                value={mostrarDetalhes ? 'ver' : 'ocultar'}
                onChange={() => setMostrarDetalhes(!mostrarDetalhes)}
            >
                <option value="ver">Ver detalhes completos</option>
                <option value="ocultar">Ocultar detalhes</option>
            </Select>

            {mostrarDetalhes && (
                <Box mt={2} bg="gray.100" p={4} borderRadius="md">
                <Text><strong>Nº da O.S.:</strong> {ordemSelecionada?.Numero_OS}</Text>

                <Box display="flex" alignItems="center" gap={2}>
                    <Text><strong>Telefone 1:</strong> {ordemSelecionada?.Telefone1_Cliente}</Text>
                    <Button size="xs" onClick={() => navigator.clipboard.writeText(ordemSelecionada?.Telefone1_Cliente)}>Copiar</Button>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                    <Text><strong>Telefone 2:</strong> {ordemSelecionada?.Telefone2_Cliente}</Text>
                    <Button size="xs" onClick={() => navigator.clipboard.writeText(ordemSelecionada?.Telefone2_Cliente)}>Copiar</Button>
                </Box>

                <Text><strong>Endereço:</strong> {ordemSelecionada?.Endereco_Cliente}</Text>
                <Text><strong>Obs. Empresa:</strong> {ordemSelecionada?.Observacao_Empresa}</Text>
                <Text><strong>Data de Envio:</strong> {new Date(ordemSelecionada?.Data_Envio_OS).toLocaleString('pt-BR')}</Text>
                <Text>
                    <strong>Geolocalização:</strong>{' '}
                    <a
                    href={`https://www.google.com/maps?q=${ordemSelecionada?.Geolocalizacao?.latitude},${ordemSelecionada?.Geolocalizacao?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'blue' }}
                    >
                    Ver no Mapa
                    </a>
                </Text>
                </Box>
            )}

            <Box mt={6}>
                <Text fontSize="sm" color="gray.500">Tipo</Text>
                <Text fontSize="lg" fontWeight="bold">{ordemSelecionada?.Tipo_OS}</Text>
            </Box>

            <Box mt={4}>
                <Text fontSize="sm" color="gray.500">Cliente</Text>
                <Text fontSize="lg" fontWeight="bold">{ordemSelecionada?.Nome_Cliente}</Text>
            </Box>

            <Box mb={4}>
                <Text fontSize="sm" color="gray.600" mb={1}>Andamento Técnico:</Text>

        <Box
            bg="gray.50"
            p={2}
            borderRadius="md"
            maxHeight="150px"  // 🔁 Altura máxima
            overflowY="auto"   // 🔁 Habilita scroll
            border="1px solid #E2E8F0"
        >
            {ordemSelecionada?.Andamento_técnico &&
            Object.values(ordemSelecionada.Andamento_técnico).map((msg, index) => (
                <Box
                key={index}
                bg="gray.100"
                p={3}
                borderRadius="md"
                mb={2}
                fontSize="sm"
                fontFamily="mono"
                whiteSpace="pre-wrap"
                >
                {msg}
                </Box>
            ))}
        </Box>
        </Box>



            <Box mt={4}>
                <Text fontSize="sm" color="gray.600" mb={1}>Status:</Text>
                <Select
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderRadius="lg"
                >
                <option value="Atribuido">Atribuído</option>
                <option value="Enviado">Enviado</option>
                <option value="Execução">Execução</option>
                <option value="Pendente">Pendente</option>
                <option value="Finalizado">Finalizado</option>
                </Select>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={6}>
                <Box>
                <Text fontSize="sm" color="gray.500">Última atualização</Text>
                <Text fontWeight="medium">
                    {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                </Box>
                <Badge
                px={3}
                py={1}
                borderRadius="lg"
                fontWeight="bold"
                colorScheme={
                    novoStatus === 'Finalizado'
                    ? 'green'
                    : novoStatus === 'Execução'
                    ? 'blue'
                    : novoStatus === 'Pendente'
                    ? 'yellow'
                    : 'gray'
                }
                >
                {novoStatus.toUpperCase()}
                </Badge>
            </Box>
            </ModalBody>

            <ModalFooter gap={2}>
            <Button colorScheme="blue" onClick={salvarAlteracaoNoBanco}>
                Salvar
            </Button>
            <Button variant="ghost" onClick={onClose}>
                Cancelar
            </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>

        <Modal isOpen={isOpenObservacao} onClose={onCloseObservacao} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Nova Observação</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <Textarea
                placeholder="Escreva a nova observação..."
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
            />
            </ModalBody>
            <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={salvarNovaObservacao}>
                Salvar
            </Button>
            <Button variant="ghost" onClick={onCloseObservacao}>Cancelar</Button>
            </ModalFooter>
        </ModalContent>
        </Modal>




      </Box>
    </Box>
  )
}

export default OrdensEmAberto
