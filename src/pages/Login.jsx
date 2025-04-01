import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // 👈 aqui
import { apiGet } from '../services/api'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Heading,
  useToast
} from '@chakra-ui/react'

function Login({ setAuth }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const toast = useToast()
  const navigate = useNavigate() // 👈 aqui

  const handleLogin = async (e) => {
    e.preventDefault()
  
    const emailLimpo = email.trim().toLowerCase()
    const senhaLimpa = senha.trim()
  
    if (!emailLimpo || !senhaLimpa) {
      toast({ title: 'Preencha todos os campos.', status: 'error', duration: 2000 })
      return
    }
  
    try {
      // Sem aspas no where!
      const where = `(Email,eq,${emailLimpo})~and(password,eq,${senhaLimpa})`
      const query = encodeURIComponent(where)
      const res = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records?where=${query}`)
  
  
      if (res.list && res.list.length > 0) {
        const user = res.list[0]
        const tipoUsuario = user.tipo?.toLowerCase()
  
        // Salva no localStorage
        localStorage.setItem('token', 'empresa-logada')
        localStorage.setItem('empresa_id', user.Id)
        localStorage.setItem('empresa_nome', user.empresa_nome || '')
        localStorage.setItem('email', user.Email)
        localStorage.setItem('tipo', tipoUsuario)
        localStorage.setItem('nome', user.nome || '')
        localStorage.setItem('foto_perfil', user.picture_perfil || '')
        localStorage.setItem('telefone', user.telefone || '')
        localStorage.setItem('UnicID', user.UnicID || '')

  
        if (tipoUsuario === 'admin') {
          window.location.replace('/ordens-servico-app/#/admin')
        } else {
          window.location.replace('/ordens-servico-app/#/empresa')
        }
        
      } else {
        toast({ title: 'E-mail ou senha inválidos.', status: 'error', duration: 2000 })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao conectar com o servidor.', status: 'error', duration: 2000 })
    }
  }
  
  
  
  
  
  
  
  
  
  
  

  return (
    <Flex minH="100vh" align="center" justify="center" bgGradient="linear(to-br, blue.500, indigo.700)">
      <Box bg="white" p={8} rounded="xl" shadow="lg" w="full" maxW="md">
        <Heading size="lg" textAlign="center" mb={6}>Login - Sistema O.S</Heading>
        <form onSubmit={handleLogin}>
          <FormControl mb={4}>
            <FormLabel>E-mail</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Senha</FormLabel>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </FormControl>
          <Button colorScheme="blue" type="submit" w="full">Entrar</Button>
        </form>
      </Box>
    </Flex>
  )
}

export default Login
