// src/pages/CadastroEmpresa.jsx
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    useToast,
    useBreakpointValue,
    Flex
  } from '@chakra-ui/react'
  import { useState } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { apiPost } from '../services/api'
  import { v4 as uuidv4 } from 'uuid'
  
  import AdminSidebarDesktop from '../components/admin/AdminSidebarDesktop'
  import AdminBottomNav from '../components/admin/AdminBottomNav'
  import AdminMobileMenu from '../components/admin/AdminMobileMenu'
  
  function CadastroEmpresa() {
    const [form, setForm] = useState({
      email: '',
      senha: '',
      nome: '',
      empresa: ''
    })
  
    const toast = useToast()
    const navigate = useNavigate()
    const isMobile = useBreakpointValue({ base: true, md: false })
  
    const handleChange = (e) => {
      const { name, value } = e.target
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  
    const handleSubmit = async (e) => {
      e.preventDefault()
  
      const { email, senha, nome, empresa } = form
      if (!email || !senha || !nome || !empresa) {
        toast({ title: 'Preencha todos os campos.', status: 'error', duration: 3000 })
        return
      }
  
      const payload = {
        Email: email.trim().toLowerCase(),
        password: senha.trim(),
        nome: nome.trim(),
        empresa_nome: empresa.trim(),
        tipo: 'empresa',
        UnicID: uuidv4()
      }
  
      try {
        await apiPost('/api/v2/tables/mga2sghx95o3ssp/records', payload)
        toast({ title: 'Empresa cadastrada com sucesso!', status: 'success', duration: 3000 })
        navigate('/login')
      } catch (err) {
        console.error(err)
        toast({ title: 'Erro ao cadastrar empresa.', status: 'error', duration: 3000 })
      }
    }
  
    return (
      <Flex>
        {!isMobile && <AdminSidebarDesktop />}
        {isMobile && <AdminMobileMenu />}
  
        <Box
          p={6}
          ml={!isMobile ? '250px' : 0}
          w="full"
          pb={isMobile ? '60px' : 0}
          position="relative"
        >
          {isMobile && <AdminBottomNav />}
  
          <Box maxW="md" mx="auto" mt={10} p={6} bg="white" borderRadius="md" shadow="md">
            <Heading mb={6} size="lg" textAlign="center">Cadastro de Empresa</Heading>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Nome do Responsável</FormLabel>
                  <Input name="nome" value={form.nome} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <Input name="empresa" value={form.empresa} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>E-mail</FormLabel>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Senha</FormLabel>
                  <Input name="senha" type="password" value={form.senha} onChange={handleChange} />
                </FormControl>
                <Button type="submit" colorScheme="blue" width="full">Cadastrar</Button>
              </VStack>
            </form>
          </Box>
        </Box>
      </Flex>
    )
  }
  
  export default CadastroEmpresa
  