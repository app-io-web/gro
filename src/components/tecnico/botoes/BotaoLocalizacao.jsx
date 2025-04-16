import { Button, useToast } from '@chakra-ui/react'

function BotaoLocalizacao({ link, fallbackEndereco, ...props }) {
  const toast = useToast()

  const abrirMaps = () => {
    if (link) {
      // 🌐 Abrir link direto (LinkLocalizacao ou link gerado por coordenadas)
      window.open(link, '_blank')
    } else if (fallbackEndereco) {
      // 📍 Fallback com endereço
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackEndereco)}`
      window.open(url, '_blank')
      toast({
        title: 'Localização aproximada',
        description: 'Endereço aproximado usado para buscar no mapa.',
        status: 'info',
        duration: 4000,
        isClosable: true
      })
    } else {
      // 🚫 Sem localização
      toast({
        title: 'Localização indisponível',
        description: 'Nenhuma informação de localização foi fornecida.',
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
