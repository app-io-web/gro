import { useEffect, useState } from 'react'
import { apiGet } from '../services/api'
import {
  Box, Heading, Text, Button, Flex, Spinner
} from '@chakra-ui/react'

function EmpresaDashboard() {
  const [empresa, setEmpresa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmpresa = async () => {
      const empresaId = localStorage.getItem('empresa_id')

      if (!empresaId) {
        console.warn('ID da empresa não encontrado no localStorage.')
        setLoading(false)
        return
      }

      try {
        const res = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records/${empresaId}`)

        if (res && res.Id) {
          setEmpresa(res)
        } else {
          console.warn('Empresa não encontrada.')
        }
      } catch (err) {
        console.error('Erro ao buscar empresa:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmpresa()
  }, [])

  if (loading) return <div>Carregando empresa...</div>
  if (!empresa) return <div>Empresa não encontrada.</div>
  
  return (
    <Box p={8}>
      <Heading size="lg" mb={4}>Bem-vindo, {empresa?.Email}</Heading>

      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="xl">Suas Ordens de Serviço</Text>
        <Button colorScheme="blue">Criar nova O.S.</Button>
      </Flex>

      <Box bg="gray.50" p={4} borderRadius="md" shadow="sm">
        <Text>Ainda não há ordens de serviço cadastradas.</Text>
      </Box>
    </Box>
  )
}

export default EmpresaDashboard
