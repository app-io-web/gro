import {
  Box, Button, FormControl, FormLabel, Input, Select, Textarea, useToast,
  Heading, useBreakpointValue, VStack, Text, Icon, Flex
} from '@chakra-ui/react'
import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { apiGet, apiPatch } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import UploadArquivoPDF from './UploadArquivoPDF'
import { FiSend } from 'react-icons/fi'
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure
} from '@chakra-ui/react'
import { usarVerificacaoLimiteOS } from '../../components/utils/verificarLimiteOS'



function AbrirOrdemEmpresa() {
  const [form, setForm] = useState({
    Nome_Cliente: '', Telefone1_Cliente: '', Telefone2_Cliente: '',
    Rua: '', Numero: '', Bairro: '', Cidade: '', Estado: '',
    Tipo_OS: '', Observacao_Empresa: '',
    TipoCliente: '', // Novo
    Coordenadas: ''  // Novo
  })
  const [linkPdf, setLinkPdf] = useState('')
  const [limiteAtingido, setLimiteAtingido] = useState(false)

  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const UnicID_Empresa = localStorage.getItem('UnicID')
  const limitePermitido = parseInt(localStorage.getItem('Limite_de_Ordem') || '0', 10)
  const dataAtual = new Date().toLocaleString('pt-BR')

  const { isOpen, onOpen, onClose } = useDisclosure()


  // Verificação do limite de ordens no carregamento do componente
  useEffect(() => {
    const verificar = usarVerificacaoLimiteOS(
      (atingiuLimite) => {
        setLimiteAtingido(atingiuLimite)
        if (atingiuLimite) onOpen()
      },
      () => {
        setLimiteAtingido(true)
        onOpen()
      },
      true // somenteVerificar
    )
  
    verificar()
  }, [])
  

  

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { Nome_Cliente, Telefone1_Cliente, Rua, Numero, Bairro, Cidade, Estado, Tipo_OS, TipoCliente, Coordenadas } = form

    if (!Nome_Cliente || !Telefone1_Cliente || !Rua || !Numero || !Bairro || !Cidade || !Estado || !Tipo_OS || !TipoCliente ) {
      toast({ title: 'Preencha todos os campos obrigatórios', status: 'warning' })
      return
    }

    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      const registro = res.list.find(item => {
        const raw = item['Ordem de Serviços']
        const json = typeof raw === 'string' ? JSON.parse(raw) : raw
        return json?.empresas?.some(emp => emp.UnicID_Empresa === UnicID_Empresa)
      })

      if (!registro) throw new Error('Registro da empresa não encontrado')

      const json = typeof registro['Ordem de Serviços'] === 'string'
        ? JSON.parse(registro['Ordem de Serviços'])
        : registro['Ordem de Serviços']

      const enderecoCompleto = `${form.Rua}, nº ${form.Numero}, ${form.Bairro}, ${form.Cidade} - ${form.Estado}`

      const novaOrdem = {
        Nome_Cliente: form.Nome_Cliente,
        Telefone1_Cliente: form.Telefone1_Cliente,
        Telefone2_Cliente: form.Telefone2_Cliente,
        Endereco_Cliente: enderecoCompleto,
        Tipo_OS: form.Tipo_OS,
        Observacao_Empresa: form.Observacao_Empresa,
        TipoCliente: form.TipoCliente,
        Coordenadas: form.Coordenadas,
        UnicID_OS: uuidv4(),
        Status_OS: 'Em Aberto',
        Numero_OS: Date.now(),
        Data_Envio_OS: new Date().toISOString(),
        Link_Ordem_PDF: linkPdf || ''
      }

      const novaEstrutura = {
        ...json,
        empresas: json.empresas.map(emp => {
          if (emp.UnicID_Empresa !== UnicID_Empresa) return emp
          return {
            ...emp,
            Ordens_de_Servico: [...(emp.Ordens_de_Servico || []), novaOrdem]
          }
        })
      }

      await apiPatch('/api/v2/tables/mtnh21kq153to8h/records', {
        Id: registro.Id,
        'Ordem de Serviços': novaEstrutura
      })

      

      const NomeEmpresa = localStorage.getItem('empresa_nome') || 'Empresa não informada';

      await fetch('https://webhook.nexusnerds.com.br/webhook/novaordem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: `🛠️ Nova Ordem aberta para o cliente ${form.Nome_Cliente} (${form.Tipo_OS}) pela empresa ${NomeEmpresa}`,
          cliente: form.Nome_Cliente,
          telefone: form.Telefone1_Cliente,
          endereco: `${form.Rua}, nº ${form.Numero}, ${form.Bairro}, ${form.Cidade} - ${form.Estado}`,
          tipo_ordem: form.Tipo_OS,
          tipo_cliente: form.TipoCliente,
          coordenadas: form.Coordenadas,
          data_envio: new Date().toISOString(),
          empresa: NomeEmpresa,
          numero_ordem: novaOrdem.Numero_OS   // Adicionando numero de Ordem Antes de Enviar ao banco de dados
        }),
      });
      
      

      toast({ title: 'Ordem aberta com sucesso!', status: 'success' })
      setForm({
        Nome_Cliente: '', Telefone1_Cliente: '', Telefone2_Cliente: '',
        Rua: '', Numero: '', Bairro: '', Cidade: '', Estado: '',
        Tipo_OS: '', Observacao_Empresa: '', TipoCliente: '', Coordenadas: ''
      })



      
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao abrir ordem', status: 'error' })
    }
  }

  if (limiteAtingido) {
    return (
      <Box p={6} textAlign="center" maxW="lg" mx="auto">
        <Heading color="red.500" size="lg">❌ Limite de O.S Atingido</Heading>
        <Text mt={4}>Você atingiu o limite de ordens de serviço para este mês.</Text>
        <Text mt={2} fontSize="sm" color="gray.500">📅 {dataAtual}</Text>
        <Text mt={4}>Entre em contato com os administradores para liberar mais ordens.</Text>
      </Box>
    )
  }


  return (
<Box display="flex">
<Box as="style" dangerouslySetInnerHTML={{ __html: `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.6; }
    100% { transform: scale(1); opacity: 1; }
  }
` }} />

  {!isMobile && <AdminSidebarDesktop />}
  {isMobile && <AdminMobileMenu />}
  {isMobile && <AdminBottomNav />}

  <Box w="full" ml={!isMobile ? '250px' : 0} p={6} pb={isMobile ? '60px' : 0}>
    <Heading size="lg" mb={6}>📬 Abrir Nova Ordem de Serviço</Heading>

    <VStack spacing={4} align="stretch" bg="white" p={6} borderRadius="lg" boxShadow="md">
  <Text fontSize="sm" color="gray.500">
    📅 Data e Hora atual: <strong>{dataAtual}</strong>
  </Text>

  <FormControl isRequired>
    <FormLabel>Nome do Cliente</FormLabel>
    <Input name="Nome_Cliente" value={form.Nome_Cliente} onChange={handleChange} />
  </FormControl>

  <FormControl isRequired>
    <FormLabel>Telefone 1</FormLabel>
    <Input name="Telefone1_Cliente" value={form.Telefone1_Cliente} onChange={handleChange} />
  </FormControl>

  <FormControl>
    <FormLabel>Telefone 2</FormLabel>
    <Input name="Telefone2_Cliente" value={form.Telefone2_Cliente} onChange={handleChange} />
  </FormControl>

  {/* Endereço adaptado por device */}
  {isMobile ? (
    <Accordion allowToggle border="1px solid #E2E8F0" borderRadius="md" mb={2}>
      <AccordionItem>
        <h2>
        <AccordionButton>
          <Box flex="1" textAlign="left" display="flex" alignItems="center" gap={2}>
            📍 Endereço do Cliente
            {isMobile && (
              (!form.Rua || !form.Numero || !form.Bairro || !form.Cidade || !form.Estado) && (
                <Box
                  w="10px"
                  h="10px"
                  bg="red.500"
                  borderRadius="full"
                  animation="pulse 1s infinite"
                />
              )
            )}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <FormControl isRequired>
            <FormLabel>Rua</FormLabel>
            <Input name="Rua" value={form.Rua} onChange={handleChange} />
          </FormControl>

          <FormControl isRequired mt={3}>
            <FormLabel>Número</FormLabel>
            <Input name="Numero" value={form.Numero} onChange={handleChange} />
          </FormControl>

          <FormControl isRequired mt={3}>
            <FormLabel>Bairro</FormLabel>
            <Input name="Bairro" value={form.Bairro} onChange={handleChange} />
          </FormControl>

          <FormControl isRequired mt={3}>
            <FormLabel>Cidade</FormLabel>
            <Input name="Cidade" value={form.Cidade} onChange={handleChange} />
          </FormControl>

          <FormControl isRequired mt={3}>
            <FormLabel>Estado</FormLabel>
            <Input name="Estado" value={form.Estado} onChange={handleChange} />
          </FormControl>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ) : (
    <>
      <Flex gap={4}>
        <FormControl isRequired flex="2">
          <FormLabel>Rua</FormLabel>
          <Input name="Rua" value={form.Rua} onChange={handleChange} />
        </FormControl>
        <FormControl isRequired flex="1">
          <FormLabel>Número</FormLabel>
          <Input name="Numero" value={form.Numero} onChange={handleChange} />
        </FormControl>
      </Flex>

      <Flex gap={4}>
        <FormControl isRequired flex="1">
          <FormLabel>Bairro</FormLabel>
          <Input name="Bairro" value={form.Bairro} onChange={handleChange} />
        </FormControl>
        <FormControl isRequired flex="1">
          <FormLabel>Cidade</FormLabel>
          <Input name="Cidade" value={form.Cidade} onChange={handleChange} />
        </FormControl>
        <FormControl isRequired flex="1">
          <FormLabel>Estado</FormLabel>
          <Input name="Estado" value={form.Estado} onChange={handleChange} />
        </FormControl>
      </Flex>
    </>
  )}

  {/* NOVOS CAMPOS ADICIONADOS */}
  <FormControl isRequired>
    <FormLabel>Tipo da Ordem</FormLabel>
    <Select name="TipoCliente" value={form.TipoCliente} onChange={handleChange} placeholder="Selecione">
      <option value="Empresarial">Empresarial</option>
      <option value="Residencial">Residencial</option>
    </Select>
  </FormControl>

  <FormControl isRequired>
    <FormLabel>Coordenadas (Latitude, Longitude)</FormLabel>
    <Input
      name="Coordenadas"
      value={form.Coordenadas}
      onChange={handleChange}
      placeholder="Ex: -20.3155, -40.3128"
    />
  </FormControl>

  <FormControl isRequired>
    <FormLabel>Tipo de O.S.</FormLabel>
    <Select name="Tipo_OS" value={form.Tipo_OS} onChange={handleChange}>
      <option value="">Selecione</option>
      <option value="Instalação">Instalação</option>
      <option value="Manutenção">Manutenção</option>
      <option value="Alteração de Endereço">Alteração de Endereço</option>
      <option value="Rompimento">Rompimento</option>
    </Select>
  </FormControl>

  <FormControl>
    <FormLabel>Observações</FormLabel>
    <Textarea name="Observacao_Empresa" value={form.Observacao_Empresa} onChange={handleChange} />
  </FormControl>

  <UploadArquivoPDF onUpload={setLinkPdf} />

  <Button
    colorScheme="blue"
    leftIcon={<Icon as={FiSend} />}
    size="lg"
    onClick={handleSubmit}
    isDisabled={limiteAtingido}
  >
    Abrir Ordem
  </Button>
</VStack>


    <Modal isOpen={isOpen} onClose={onClose} isCentered>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>❌ Limite de Ordens Atingido</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      Você atingiu o limite de ordens de serviço permitidas para este mês. <br />
      Entre em contato com os administradores para liberar mais ordens.
    </ModalBody>

    <ModalFooter>
      <Button colorScheme="blue" onClick={onClose}>Entendi</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

  </Box>
</Box>
  )
}

export default AbrirOrdemEmpresa
