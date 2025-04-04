import { VStack, Box, Text } from '@chakra-ui/react'
import ItemAgendamento from './ItemAgendamento'

function ListaAgendamentos({ ordens }) {
  if (!ordens.length) {
    return <Text>Nenhum agendamento disponível.</Text>
  }

  return (
    <VStack spacing={4}>
      {ordens.map((ordem) => (
        <ItemAgendamento key={ordem.UnicID_OS} ordem={ordem} />
      ))}
    </VStack>
  )
}

export default ListaAgendamentos
