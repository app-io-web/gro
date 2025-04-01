import { Flex, Heading, Spacer, Text, Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../services/api'

function DashboardHeader() {
  const [admin, setAdmin] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const id = localStorage.getItem('empresa_id')
        const res = await apiGet(`/api/v2/tables/mga2sghx95o3ssp/records/${id}`)
        setAdmin(res)
      } catch (err) {
        console.error('Erro ao carregar dados do administrador:', err)
      }
    }

    fetchAdmin()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <Flex align="center">
      <Heading size="lg">Painel Administrativo</Heading>
      <Spacer />
      <Flex align="center" gap={4}>
        <Text fontWeight="medium">
          Olá, {admin ? admin.Email : 'Carregando...'}
        </Text>
        <Button size="sm" colorScheme="red" onClick={handleLogout}>
          Sair
        </Button>
      </Flex>
    </Flex>
  )
}

export default DashboardHeader
