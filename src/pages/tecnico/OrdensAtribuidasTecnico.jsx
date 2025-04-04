// src/pages/tecnico/OrdensAtribuidasTecnico.jsx

import { useEffect, useState } from 'react'
import {
  Box, Heading, Spinner, Text, Stack, Badge
} from '@chakra-ui/react'
import { apiGet } from '../../services/api'

function OrdensAtribuidasTecnico() {
  const [ordens, setOrdens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrdens = async () => {
      const tecnicoID = localStorage.getItem('ID_Tecnico_Responsavel')
      if (!tecnicoID) return setLoading(false)

      try {
        const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
        const lista = []

        res.list.forEach(registro => {
          const json = typeof registro['Ordem de Serviços'] === 'string'
            ? JSON.parse(registro['Ordem de Serviços'])
            : registro['Ordem de Serviços']

          json.empresas.forEach(empresa => {
            empresa.Ordens_de_Servico?.forEach(ordem => {
              if (ordem.ID_Tecnico_Responsavel === tecnicoID && ordem.Status_OS === 'Atribuído') {
                lista.push({ ...ordem, empresa: empresa.empresa })
              }
            })
          })
        })

        setOrdens(lista)
      } catch (err) {
        console.error('Erro ao buscar ordens:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrdens()
  }, [])

  if (loading) return <Spinner mt={10} />
  if (ordens.length === 0) return <Text mt={4}>Nenhuma ordem atribuída a você.</Text>

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Ordens Atribuídas</Heading>
      <Stack spacing={4}>
        {ordens.map((ordem, idx) => (
          <Box key={idx} borderWidth="1px" borderRadius="md" p={4}>
            <Text><strong>Cliente:</strong> {ordem.Nome_Cliente}</Text>
            <Text><strong>Endereço:</strong> {ordem.Endereco_Cliente}</Text>
            <Text><strong>Empresa:</strong> {ordem.empresa}</Text>
            <Badge colorScheme="yellow">{ordem.Status_OS}</Badge>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

export default OrdensAtribuidasTecnico
