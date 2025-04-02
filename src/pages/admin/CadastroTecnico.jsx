import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  useToast,
  useBreakpointValue
} from '@chakra-ui/react'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import { apiPost } from '../../services/api'

function CadastroTecnico() {
  const isMobile = useBreakpointValue({ base: true, md: false })

  const [form, setForm] = useState({
    Tecnico_Responsavel: '',
    email_tecnico: '',
    senha: '',
    telefone: ''
  })

  const toast = useToast()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const tecnicoComID = {
        ...form,
        ID_Tecnico_Responsavel: uuidv4()
      }

      await apiPost('/api/v2/tables/mpyestriqe5a1kc/records', tecnicoComID)

      toast({
        title: 'Técnico cadastrado com sucesso!',
        status: 'success',
        duration: 3000
      })

      setForm({
        Tecnico_Responsavel: '',
        email_tecnico: '',
        senha: '',
        telefone: ''
      })
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar técnico.',
        description: error.message,
        status: 'error',
        duration: 4000
      })
    }
  }

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}

      <Box w="full" ml={!isMobile ? '250px' : 0} pb={isMobile ? '60px' : 0}>
        {isMobile && <AdminBottomNav />}

        <Box p={6} maxW="500px" mx="auto">
          <Heading size="lg" mb={6}>Cadastrar Técnico</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Nome</FormLabel>
              <Input name="Tecnico_Responsavel" value={form.Tecnico_Responsavel} onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" name="email_tecnico" value={form.email_tecnico} onChange={handleChange} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Senha</FormLabel>
              <Input type="password" name="senha" value={form.senha} onChange={handleChange} />
            </FormControl>

            <FormControl>
              <FormLabel>Telefone</FormLabel>
              <Input name="telefone" value={form.telefone} onChange={handleChange} />
            </FormControl>

            <Button colorScheme="purple" onClick={handleSubmit}>Salvar Técnico</Button>
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}

export default CadastroTecnico
