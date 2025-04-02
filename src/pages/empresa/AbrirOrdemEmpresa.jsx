import {
  Box, Button, FormControl, FormLabel, Input, Select, Textarea, useToast,
  Heading, useBreakpointValue, VStack, Text, Icon, Flex
} from '@chakra-ui/react'

import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react'


import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { apiGet, apiPatch } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import UploadArquivoPDF from './UploadArquivoPDF'
import { FiSend } from 'react-icons/fi'

function AbrirOrdemEmpresa() {
  const [form, setForm] = useState({
    Nome_Cliente: '',
    Telefone1_Cliente: '',
    Telefone2_Cliente: '',
    Rua: '',
    Numero: '',
    Bairro: '',
    Cidade: '',
    Estado: '',
    Tipo_OS: '',
    Observacao_Empresa: ''
  })
  const [linkPdf, setLinkPdf] = useState('')
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const UnicID_Empresa = localStorage.getItem('UnicID')
  const NomeEmpresa = localStorage.getItem('empresa')
  const dataAtual = new Date().toLocaleString('pt-BR')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { Nome_Cliente, Telefone1_Cliente, Rua, Numero, Bairro, Cidade, Estado, Tipo_OS } = form
    if (!Nome_Cliente || !Telefone1_Cliente || !Rua || !Numero || !Bairro || !Cidade || !Estado || !Tipo_OS) {
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

      toast({ title: 'Ordem aberta com sucesso!', status: 'success' })
      setForm({
        Nome_Cliente: '', Telefone1_Cliente: '', Telefone2_Cliente: '',
        Rua: '', Numero: '', Bairro: '', Cidade: '', Estado: '',
        Tipo_OS: '', Observacao_Empresa: ''
      })
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao abrir ordem', status: 'error' })
    }
  }

  return (
<Box display="flex">
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
                <Box flex="1" textAlign="left">📍 Endereço do Cliente</Box>
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
      >
        Abrir Ordem
      </Button>
    </VStack>
  </Box>
</Box>
  )
}

export default AbrirOrdemEmpresa
