import { Button, useToast } from '@chakra-ui/react'

function BotaoLocalizacao({ endereco, latitude, longitude, ...props }) {
  const toast = useToast()

  const abrirMaps = () => {
    if (latitude && longitude) {
      // 🎯 Latitude e longitude disponíveis
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      window.open(url, '_blank')
    } else if (endereco) {
      // 📍 Usando endereço aproximado
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
      window.open(url, '_blank')
      toast({
        title: 'Localização aproximada',
        description: 'Estamos usando o endereço informado para localizar o cliente.',
        status: 'info',
        duration: 4000,
        isClosable: true
      })
    } else {
      // 🚫 Sem localização disponível
      toast({
        title: 'Localização indisponível',
        description: 'Não foi possível abrir a localização. Dados ausentes.',
        status: 'warning',
        duration: 4000,
        isClosable: true
      })
    }
  }

  return (
    <Button
      onClick={abrirMaps}
      flex="1"
      minW="130px"
      colorScheme="gray"
      {...props}
    >
      Mostrar localização
    </Button>
  )
}

export default BotaoLocalizacao
