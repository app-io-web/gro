import { useState, useEffect } from 'react'
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
  const [email, setEmail] = useState(() => sessionStorage.getItem('temp_email') || '')
  const [senha, setSenha] = useState(() => sessionStorage.getItem('temp_senha') || '')


  
  
  const toast = useToast()
  const navigate = useNavigate() // 👈 aqui
  const [carregandoLogin, setCarregandoLogin] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('temp_email', email)
    sessionStorage.setItem('temp_senha', senha)
  }, [email, senha])
  

  const handleLogin = async (e) => {
    e.preventDefault()
    setCarregandoLogin(true)


    

    const emailLimpo = email.trim().toLowerCase()
    const senhaLimpa = senha.trim()
  
    if (!emailLimpo || !senhaLimpa) {
      toast({ title: 'Preencha todos os campos.', status: 'error', duration: 2000 })
      setCarregandoLogin(false)
      return
    }

      
    try {
      const emailLimpo = email.trim().toLowerCase()
      const senhaLimpa = senha.trim()
    
      // 1. Primeiro tenta login como empresa/admin
      const whereEmpresa = `(Email,eq,${emailLimpo})~and(password,eq,${senhaLimpa})`
      const queryEmpresa = encodeURIComponent(whereEmpresa)

      const resEmpresa = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records?where=${queryEmpresa}`)
    
      if (resEmpresa.list && resEmpresa.list.length > 0) {
        const user = resEmpresa.list[0]
        const tipoUsuario = user.tipo?.toLowerCase()
        
    
        localStorage.setItem('token', 'empresa-logada')
        localStorage.setItem('empresa_id', user.Id)
        localStorage.setItem('empresa_nome', user.empresa_nome || '')
        localStorage.setItem('email', user.Email)
        localStorage.setItem('tipo', tipoUsuario)
        localStorage.setItem('nome', user.nome || '')
        localStorage.setItem('foto_perfil', user.picture_perfil || '')
        localStorage.setItem('telefone', user.telefone || '')
        localStorage.setItem('UnicID', user.UnicID || '')
        localStorage.setItem('Limite_de_Ordem', user.Limite_de_Ordem || '')
    


        localStorage.setItem('savedEmail', emailLimpo)
        localStorage.setItem('savedSenha', senhaLimpa)


        setAuth(true)
        setTimeout(() => {
          navigate(tipoUsuario === 'admin' ? '/admin' : '/empresa')
        }, 50)

        return // <-- aqui evita execução do resto
      }
    
      // 2. Tenta login como técnico
      const whereTecnico = `(email_tecnico,eq,${emailLimpo})~and(senha,eq,${senhaLimpa})`
      const queryTecnico = encodeURIComponent(whereTecnico)
      const resTecnico = await apiGet(`/api/v2/tables/mpyestriqe5a1kc/records?where=${queryTecnico}`)


      if (resTecnico.list && resTecnico.list.length > 0) {
        const tecnico = resTecnico.list[0]
    
        localStorage.setItem('token', 'tecnico-logado')
        localStorage.setItem('tecnico_id', tecnico.Id)
        localStorage.setItem('email', tecnico.email_tecnico)
        localStorage.setItem('nome', tecnico.Tecnico_Responsavel || '')
        localStorage.setItem('telefone', tecnico.telefone || '')
        localStorage.setItem('ID_Tecnico_Responsavel', tecnico.ID_Tecnico_Responsavel || '')
        localStorage.setItem('tipo', 'tecnico')


        localStorage.setItem('savedEmail', emailLimpo)
        localStorage.setItem('savedSenha', senhaLimpa)

    
        setAuth(true)
        setTimeout(() => {
          navigate('/tecnico')
        }, 50)


        return // <-- aqui também evita execução do resto
      }
    
      // 3. Se não achou em nenhum
      toast({ title: 'E-mail ou senha inválidos.', status: 'error', duration: 3000 })
    
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao conectar com o servidor.', status: 'error', duration: 3000 })
    } finally {
      setCarregandoLogin(false) // sempre desativa
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
          <Button colorScheme="blue" type="submit" w="full" isLoading={carregandoLogin}>Entrar</Button>
        </form>
      </Box>
    </Flex>
  )
}

export default Login
