import { useEffect, useState } from 'react'
import {
  Box, Heading, Text, VStack, Spinner, Badge, useToast,
  useBreakpointValue, Flex, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Textarea, Input, Select,Tooltip 
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { apiGet, apiPatch } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'

function OrdensEmAbertoEmpresa() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isOpenEdicao,
    onOpen: onOpenEdicao,
    onClose: onCloseEdicao
  } = useDisclosure()
  const {
    isOpen: isOpenConfirmarCancelamento,
    onOpen: onOpenConfirmarCancelamento,
    onClose: onCloseConfirmarCancelamento
  } = useDisclosure()

  const [ordemSelecionada, setOrdemSelecionada] = useState(null)
  const [novaObservacao, setNovaObservacao] = useState('')
  const [telefone1, setTelefone1] = useState('')
  const [telefone2, setTelefone2] = useState('')
  const [tipo, setTipo] = useState('')
  const [endereco, setEndereco] = useState('')
  const UnicID_Empresa_Logada = localStorage.getItem('UnicID')
  const isFinalizada = ordemSelecionada?.Status_OS === 'Finalizado'
  const [shouldRefresh, setShouldRefresh] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrdens()
    }, 10000) // 10 segundos
  
    return () => clearInterval(interval)
  }, [])
  
  



  const fetchOrdens = async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      const ordensFiltradas = res.list.flatMap(item => {
        const rawJson = item['Ordem de Serviços']
        if (!rawJson) return []
  
        const json = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson
        if (!json?.empresas) return []
  
        const statusPermitidos = ['Em Aberto', 'Agendada', 'Reagendada', 'Pendente', 'Atribuido']
  
        return json.empresas
          .filter(emp => emp.UnicID_Empresa === UnicID_Empresa_Logada)
          .flatMap(emp =>
            emp.Ordens_de_Servico
              .filter(os => statusPermitidos.includes(os.Status_OS))
              .map(os => ({
                ...os,
                empresa: emp.empresa,
                UnicID_Empresa: emp.UnicID_Empresa,
                IdRegistro: item.Id
              }))
          )
      })
  
      setOrdens(ordensFiltradas)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao buscar ordens', status: 'error' })
    } finally {
      setLoading(false)
    }
  }
  
  

  const salvarObservacao = async () => {
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
        empresas: json.empresas.map(emp => {
          if (emp.UnicID_Empresa !== UnicID_Empresa_Logada) return emp

          return {
            ...emp,
            Ordens_de_Servico: emp.Ordens_de_Servico.map(os => {
              if (os.UnicID_OS !== ordemSelecionada.UnicID_OS) return os
              return {
                ...os,
                Observacao_Empresa: novaObservacao,
                Telefone1_Cliente: telefone1,
                Telefone2_Cliente: telefone2,
                Tipo_OS: tipo,
                Endereco_Cliente: endereco
              }
            })
          }
        })
      }

      await apiPatch('/api/v2/tables/mtnh21kq153to8h/records', {
        Id: registro.Id,
        'Ordem de Serviços': novaEstrutura
      })

      toast({ title: 'Dados atualizados com sucesso', status: 'success' })
      onCloseEdicao()
      setShouldRefresh(prev => !prev) // <- Adiciona AQUI
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao salvar os dados', status: 'error' })
    }
  }

  const cancelarOrdem = async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      const registro = res.list.find(item => item.Id === ordemSelecionada.IdRegistro)
  
      if (!registro) throw new Error('Registro não encontrado.')
  
      const json = typeof registro['Ordem de Serviços'] === 'string'
        ? JSON.parse(registro['Ordem de Serviços'])
        : registro['Ordem de Serviços']
  
      const novaEstrutura = {
        ...json,
        empresas: json.empresas.map(emp => {
          if (emp.UnicID_Empresa !== UnicID_Empresa_Logada) return emp
  
          return {
            ...emp,
            Ordens_de_Servico: emp.Ordens_de_Servico.map(os => {
              if (os.UnicID_OS !== ordemSelecionada.UnicID_OS) return os
              return {
                ...os,
                Status_OS: 'Cancelado'
              }
            })
          }
        })
      }
  
      await apiPatch('/api/v2/tables/mtnh21kq153to8h/records', {
        Id: ordemSelecionada.IdRegistro,
        'Ordem de Serviços': novaEstrutura
      })
  
      toast({ title: 'Ordem cancelada com sucesso', status: 'success' })
      onCloseConfirmarCancelamento()
      setShouldRefresh(prev => !prev) // <- Adiciona AQUI
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao cancelar a ordem', status: 'error' })
    }
  }
  


  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box w="full" ml={!isMobile ? '250px' : 0} p={6} pb={isMobile ? '60px' : 0}>
        <Heading size="lg" mb={4}>📋 Ordens da sua empresa</Heading>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <VStack spacing={4} align="stretch">
            {ordens.map((os, index) => (
              <Box
                key={index}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                bg="white"
                _hover={{ bg: 'gray.50' }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text><strong>Cliente:</strong> {os.Nome_Cliente}</Text>
                    <Text><strong>Endereço:</strong> {os.Endereco_Cliente}</Text>
                    <Text><strong>Tipo:</strong> {os.Tipo_OS}</Text>
                    <Badge colorScheme="yellow">{os.Status_OS}</Badge>
                  </Box>
                  <Flex gap={2}>
                    <Tooltip label="Ordens com status finalizado não podem ser alteradas." isDisabled={os.Status_OS !== 'Finalizado'}>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => {
                          setOrdemSelecionada(os)
                          setNovaObservacao(os.Observacao_Empresa || '')
                          setTelefone1(os.Telefone1_Cliente || '')
                          setTelefone2(os.Telefone2_Cliente || '')
                          setTipo(os.Tipo_OS || '')
                          setEndereco(os.Endereco_Cliente || '')
                          onOpenEdicao()
                        }}
                        isDisabled={os.Status_OS === 'Finalizado'}
                      >
                        Editar O.S.
                      </Button>
                    </Tooltip>

                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => {
                        setOrdemSelecionada(os)
                        onOpenConfirmarCancelamento()
                      }}
                    >
                      Cancelar Ordem
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="2xl" bg="gray.50">
            <ModalHeader>📄 Ordem de Serviço</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Text mb={2}><strong>Técnico:</strong> {ordemSelecionada?.Tecnico_Responsavel}</Text>
              <Text mb={2}><strong>Tipo:</strong> {ordemSelecionada?.Tipo_OS}</Text>
              <Text mb={2}><strong>Cliente:</strong> {ordemSelecionada?.Nome_Cliente}</Text>
              <Text mb={2}><strong>Endereço:</strong> {ordemSelecionada?.Endereco_Cliente}</Text>
              <Text mb={2}><strong>Data Entrega:</strong> {new Date(ordemSelecionada?.Data_Entrega_OS).toLocaleString('pt-BR')}</Text>
              <Text mb={2}><strong>Observação do Admin:</strong> {typeof ordemSelecionada?.Observacao_Administrador === 'object'
                ? Object.values(ordemSelecionada.Observacao_Administrador).join('\n')
                : ordemSelecionada?.Observacao_Administrador || '-'}</Text>
              <Text mb={2}><strong>Status:</strong> <Badge>{ordemSelecionada?.Status_OS}</Badge></Text>

              {/* ✅ Andamento Técnico */}
              {ordemSelecionada?.Andamento_técnico && (
                <>
                  <Text mt={4} mb={1} fontWeight="semibold">Andamento Técnico:</Text>
                  <Box
                    bg="gray.50"
                    p={2}
                    borderRadius="md"
                    maxHeight="150px"
                    overflowY="auto"
                    border="1px solid #E2E8F0"
                  >
                    {Object.values(ordemSelecionada.Andamento_técnico).map((msg, index) => (
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
                </>
              )}

                <Textarea
                  mt={4}
                  value={novaObservacao}
                  onChange={(e) => setNovaObservacao(e.target.value)}
                  placeholder="Observação da empresa sobre esta O.S."
                  isDisabled={ordemSelecionada?.Status_OS === 'Finalizado'}
                  maxHeight="120px"
                  overflowY="auto"
                  resize="vertical"
                />
            </ModalBody>

            <ModalFooter>
              <Tooltip
                label="Ordens finalizadas não podem ser editadas"
                isDisabled={ordemSelecionada?.Status_OS !== 'Finalizado'}
                shouldWrapChildren
              >
                <Button
                  colorScheme="blue"
                  onClick={salvarObservacao}
                  isDisabled={ordemSelecionada?.Status_OS === 'Finalizado'}
                >
                  Salvar
                </Button>
              </Tooltip>
              <Button variant="ghost" ml={3} onClick={onClose}>Cancelar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>


        <Modal isOpen={isOpenEdicao} onClose={onCloseEdicao} size="md" isCentered>
          <ModalOverlay />
          <ModalContent borderRadius="2xl" bg="gray.50">
                <ModalHeader>✏️ Editar Ordem de Serviço</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Input
                    mb={3}
                    placeholder="Telefone 1"
                    value={telefone1}
                    onChange={(e) => setTelefone1(e.target.value)}
                    isDisabled={isFinalizada}
                    />
                    <Input
                    mb={3}
                    placeholder="Telefone 2"
                    value={telefone2}
                    onChange={(e) => setTelefone2(e.target.value)}
                    isDisabled={isFinalizada}
                    />
                    <Select
                    mb={3}
                    placeholder="Tipo de O.S"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    isDisabled={isFinalizada}
                    >
                    <option value="Instalação">Instalação</option>
                    <option value="Alteração de Endereço">Alteração de Endereço</option>
                    <option value="Rompimento">Rompimento</option>
                    </Select>
                    <Textarea
                    mb={3}
                    placeholder="Endereço"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    isDisabled={isFinalizada}
                    />
                </ModalBody>
                <ModalFooter>
                    <Tooltip
                    label="Ordens finalizadas não podem ser editadas"
                    isDisabled={!isFinalizada}
                    shouldWrapChildren
                    >
                    <Button
                        colorScheme="blue"
                        onClick={salvarObservacao}
                        isDisabled={isFinalizada}
                    >
                        Salvar Alterações
                    </Button>
                    </Tooltip>
                    <Button variant="ghost" ml={3} onClick={onCloseEdicao}>
                    Cancelar
                    </Button>
                </ModalFooter>
                </ModalContent>

        </Modal>


        <Modal isOpen={isOpenConfirmarCancelamento} onClose={onCloseConfirmarCancelamento} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Tem certeza que deseja cancelar esta ordem?</ModalHeader>
            <ModalCloseButton />
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={cancelarOrdem}>Confirmar</Button>
              <Button variant="ghost" onClick={onCloseConfirmarCancelamento}>Voltar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>


      </Box>
    </Box>
  )
}

export default OrdensEmAbertoEmpresa
