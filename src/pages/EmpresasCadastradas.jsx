import { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  useToast,
  Icon,
  Button,
  useBreakpointValue,
  FormControl,
  FormLabel,
  Input,
  VStack
} from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { CheckCircleIcon, NotAllowedIcon, EditIcon } from '@chakra-ui/icons'
import { apiGet, apiPatch } from '../services/api'
import AdminSidebarDesktop from '../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../components/admin/AdminBottomNav'
import AdminMobileMenu from '../components/admin/AdminMobileMenu'


import { v4 as uuidv4 } from 'uuid'
import { InputGroup, InputRightElement } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { IconButton } from '@chakra-ui/react'


function EmpresasCadastradas() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null)
  const [formEdit, setFormEdit] = useState({ empresa_nome: '', nome: '', Email: '', UnicID: '', telefone: '', password: ''  })
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })


  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await apiGet('/api/v2/tables/mga2sghx95o3ssp/records')
  
        const apenasEmpresas = (res.list || [])
          .filter((e) => e.tipo === 'empresa')
          .map((e) => ({
            ...e,
            recordId: e.Id || e.id // 💡 garantido que recordId esteja presente
          }))
  
        setEmpresas(apenasEmpresas)
      } catch (err) {
        console.error(err)
        toast({ title: 'Erro ao carregar empresas.', status: 'error', duration: 3000 })
      } finally {
        setLoading(false)
      }
    }
  
    fetchEmpresas()
  }, [])
  console.log('✅ recordId encontrado:', empresaSelecionada?.recordId)
  const abrirModalEditar = (empresa) => {
    console.log('🟢 Empresa selecionada:', empresa)
    setEmpresaSelecionada(empresa) // ✅ já vem com recordId
    setFormEdit({
        empresa_nome: empresa.empresa_nome || '',
        nome: empresa.nome || '',
        Email: empresa.Email || '',
        telefone: empresa.telefone || '',
        UnicID: empresa.UnicID || '',
        password: empresa.password || ''
      })
      
    onOpen()
  }


  const handleChangeEdit = (e) => {
    const { name, value } = e.target
    setFormEdit((prev) => ({ ...prev, [name]: value }))
  }
  
  const salvarEdicao = async () => {
    const payload = {
      Id: empresaSelecionada.Id, // ou recordId, se estiver vindo de lá
      empresa_nome: formEdit.empresa_nome,
      nome: formEdit.nome,
      Email: formEdit.Email,
      password: formEdit.password,
      telefone: formEdit.telefone,
      UnicID: formEdit.UnicID
    }
  
    console.log('✅ recordId encontrado:', empresaSelecionada.Id)
    console.log('🔄 Enviando PATCH com payload:', payload)
  
    try {
      await apiPatch(`/api/v2/tables/mga2sghx95o3ssp/records`, payload)
  
      // Atualiza localmente
      setEmpresas((prev) =>
        prev.map((emp) =>
          emp.Id === empresaSelecionada.Id ? { ...emp, ...payload } : emp
        )
      )
  
      toast({ title: 'Empresa atualizada!', status: 'success', duration: 3000 })
      onClose()
    } catch (err) {
      console.error('❌ Erro ao salvar empresa:', err)
      toast({ title: 'Erro ao salvar.', status: 'error', duration: 3000 })
    }
  }
  
  
  
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose
  } = useDisclosure()
  const [novoStatus, setNovoStatus] = useState('')
  
  const confirmarAlteracaoStatus = (statusDesejado) => {
    setNovoStatus(statusDesejado)
    onConfirmOpen()
  }
  
  
  

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}

      <Box p={6} ml={!isMobile ? '250px' : 0} w="full" pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}

        <Heading size="lg" mb={6}>Empresas Cadastradas</Heading>

        {loading ? (
  <Spinner size="lg" />
            ) : empresas.length === 0 ? (
            <Text>Nenhuma empresa cadastrada.</Text>
            ) : isMobile ? (
            <VStack spacing={4} align="stretch">
                {empresas.map((empresa) => (
                <Box
                    key={empresa.Id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    onClick={() => abrirModalEditar(empresa)}
                    _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                >
                    <Text fontWeight="bold">{empresa.empresa_nome}</Text>
                    <Text fontSize="sm" color="gray.600">Responsável: {empresa.nome}</Text>
                    <Text fontSize="sm" color="gray.500">Email: {empresa.Email}</Text>
                    <Text fontSize="sm" color={empresa.status === 'ativo' ? 'green.500' : 'red.500'}>
                    Status: {empresa.status}
                    </Text>
                </Box>
                ))}
            </VStack>
            ) : (
            <Table variant="simple">
                <Thead>
                <Tr>
                    <Th>Empresa</Th>
                    <Th>Responsável</Th>
                    <Th>Email</Th>
                    <Th>telefone</Th>
                    <Th>Status</Th>
                    <Th>Ações</Th>
                </Tr>
                </Thead>
                <Tbody>
                {empresas.map((empresa) => (
                    <Tr key={empresa.Id}>
                    <Td>{empresa.empresa_nome}</Td>
                    <Td>{empresa.nome}</Td>
                    <Td>{empresa.Email}</Td>
                    <Td>{empresa.telefone}</Td>
                    <Td>
                        {empresa.status === 'ativo' ? (
                        <Icon as={CheckCircleIcon} color="green.400" />
                        ) : (
                        <Icon as={NotAllowedIcon} color="red.400" />
                        )}
                    </Td>
                    <Td>
                        <Button
                        size="sm"
                        leftIcon={<EditIcon />}
                        colorScheme="blue"
                        onClick={() => abrirModalEditar(empresa)}
                        >
                        Editar
                        </Button>
                    </Td>
                    <Td>
                    <IconButton
                      size="sm"
                      colorScheme="green"
                      icon={<ExternalLinkIcon />}
                      aria-label="Compartilhar dados da empresa"
                      onClick={() => {
                        const texto = `
                    🔗 Acesso à Plataforma:\n
https://maxfibra.com.br/login

📧 Email: ${empresa.Email}
🔑 Senha: ${empresa.password || '[senha não definida]'}
                        `.trim()

                        navigator.clipboard.writeText(texto)
                        toast({
                          title: 'Dados copiados!',
                          description: 'As informações da empresa foram copiadas para a área de transferência.',
                          status: 'success',
                          duration: 3000
                        })
                      }}
                    />
                    </Td>

                    </Tr>
                ))}
                </Tbody>
            </Table>
            )}



        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Empresa</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <Input name="empresa_nome" value={formEdit.empresa_nome} onChange={handleChangeEdit} />
                </FormControl>
                <FormControl>
                  <FormLabel>Responsável</FormLabel>
                  <Input name="nome" value={formEdit.nome} onChange={handleChangeEdit} />
                </FormControl>
                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Input name="telefone" value={formEdit.telefone} onChange={handleChangeEdit} />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input name="Email" value={formEdit.Email} onChange={handleChangeEdit} />
                </FormControl>

                <FormControl>
                <FormLabel>Senha</FormLabel>
                <Input
                    name="password"
                    type="password"
                    value={formEdit.password || ''}
                    onChange={handleChangeEdit}
                />
                </FormControl>

                <FormControl>
                    <FormLabel>UnicID</FormLabel>
                    <InputGroup>
                        <Input
                        name="UnicID"
                        value={formEdit.UnicID}
                        isReadOnly
                        placeholder="Clique no botão para gerar"
                        />
                        {!formEdit.UnicID && (
                        <InputRightElement width="5rem">
                            <Button
                            h="1.75rem"
                            size="sm"
                            onClick={() =>
                                setFormEdit((prev) => ({ ...prev, UnicID: uuidv4() }))
                            }
                            colorScheme="teal"
                            >
                            Gerar
                            </Button>
                        </InputRightElement>
                        )}
                    </InputGroup>
                </FormControl>

              </VStack>
            </ModalBody>
            <ModalFooter flexDirection="column" alignItems="flex-start" gap={4}>
            <Button
                    colorScheme={empresaSelecionada?.status === 'ativo' ? 'red' : 'green'}
                    variant="outline"
                    width="100%"
                    onClick={() =>
                        confirmarAlteracaoStatus(
                        empresaSelecionada?.status === 'ativo' ? 'inativo' : 'ativo'
                        )
                    }
                    >
                    {empresaSelecionada?.status === 'ativo' ? 'Desativar Empresa' : 'Ativar Empresa'}
            </Button>


            {isMobile ? (
  <Box display="flex" gap={2} width="100%" justifyContent="space-between">
    <Button
      leftIcon={<ExternalLinkIcon />}
      colorScheme="green"
      flex="1"
      onClick={() => {
        const texto = `
🔗 Acesso à Plataforma:
https://maxfibra.com.br/login

📧 Email: ${formEdit.Email}
🔑 Senha: ${formEdit.password || '[senha não definida]'}
        `.trim()

        navigator.clipboard.writeText(texto)
        toast({
          title: 'Dados copiados!',
          description: 'As informações da empresa foram copiadas para a área de transferência.',
          status: 'success',
          duration: 3000,
        })
      }}
    >
    </Button>

    <Button colorScheme="blue" flex="1" onClick={salvarEdicao}>
      Salvar
    </Button>

    <Button flex="1" onClick={onClose}>
      Cancelar
    </Button>
  </Box>
) : (
  <Box display="flex" gap={3} width="100%" justifyContent="flex-end">
    <Button colorScheme="blue" onClick={salvarEdicao}>
      Salvar
    </Button>
    <Button onClick={onClose}>Cancelar</Button>
  </Box>
)}

          </ModalFooter>

          </ModalContent>
        </Modal>
        <Modal isOpen={isConfirmOpen} onClose={onConfirmClose} isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Confirmar ação</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <Text>
                    Tem certeza que deseja {novoStatus === 'ativo' ? 'ativar' : 'desativar'} esta empresa?
                </Text>
                </ModalBody>
                <ModalFooter>
                <Button
                    colorScheme="blue"
                    mr={3}
                    onClick={async () => {
                    try {
                        await apiPatch(`/api/v2/tables/mga2sghx95o3ssp/records`, {
                        recordId: empresaSelecionada.recordId,
                        status: novoStatus
                        })

                        toast({
                        title: `Empresa ${novoStatus === 'ativo' ? 'ativada' : 'desativada'}!`,
                        status: 'info',
                        duration: 3000
                        })

                        onConfirmClose()
                        onClose()

                        setEmpresas((prev) =>
                        prev.map((emp) =>
                            emp.recordId === empresaSelecionada.recordId
                            ? { ...emp, status: novoStatus }
                            : emp
                        )
                        )
                    } catch (err) {
                        console.error(err)
                        toast({ title: 'Erro ao atualizar status.', status: 'error', duration: 3000 })
                    }
                    }}
                >
                    Confirmar
                </Button>
                <Button variant="ghost" onClick={onConfirmClose}>
                    Cancelar
                </Button>
                </ModalFooter>


            </ModalContent>

        </Modal>

      </Box>
    </Box>
  )
}

export default EmpresasCadastradas