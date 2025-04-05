// src/pages/empresa/OrdensImprodutivasEmpresa.jsx

import { useEffect, useState } from 'react'
import { Box, Heading, Text, Spinner, Flex } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../../services/api'
import AdminSidebarDesktop from '../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../components/admin/AdminMobileMenu'
import { useBreakpointValue } from '@chakra-ui/react'

function OrdensImprodutivasEmpresa() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrdens = async () => {
      try {
        const unicID = localStorage.getItem('UnicID')
        const ordensRes = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')

        const todasOrdens = ordensRes.list.flatMap(item => {
          const json = typeof item['Ordem de Serviços'] === 'string'
            ? JSON.parse(item['Ordem de Serviços'])
            : item['Ordem de Serviços']

          return json.empresas.flatMap(emp =>
            emp.Ordens_de_Servico.map(os => ({
              ...os,
              empresa: emp.empresa,
              UnicID_Empresa: emp.UnicID_Empresa
            }))
          )
        })

        const minhasImprodutivas = todasOrdens.filter(os =>
          os.UnicID_Empresa === unicID &&
          os.Status_OS?.toLowerCase().includes('improdutivo')
        )

        setOrdens(minhasImprodutivas)
      } catch (error) {
        console.error('Erro ao buscar ordens improdutivas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()
  }, [])

  if (loading) return <Spinner size="xl" mt={20} />
  if (!ordens.length) return <Text mt={10} textAlign="center">Nenhuma ordem improdutiva encontrada.</Text>

  return (
    <Box display="flex">
      {!isMobile && <AdminSidebarDesktop />}
      {isMobile && <AdminMobileMenu />}
      {isMobile && <AdminBottomNav />}

      <Box
            ml={!isMobile ? '250px' : 0}
            p={6}
            minH="100vh"
            pb={isMobile ? '100px' : '0'} // 👈 adiciona paddingBottom no mobile
          >
        <Heading size="lg" mb={6}>Ordens Improdutivas</Heading>

        <Flex direction="column" gap={4}>
          {ordens.map((os, i) => (
            <Box
              key={i}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              shadow="sm"
              cursor="pointer"
              transition="all 0.3s"
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              onClick={() => navigate(`/empresa/ordens-andamento/${os.UnicID_OS}`)}
            >
              <Text fontWeight="bold">{os.Nome_Cliente}</Text>
              <Text fontSize="sm">Tipo: {os.Tipo_OS}</Text>
              <Text fontSize="sm">Status: {os.Status_OS}</Text>
              <Text fontSize="sm">Data de Envio: {new Date(os.Data_Envio_OS).toLocaleDateString()}</Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  )
}

export default OrdensImprodutivasEmpresa
