import { useState } from 'react'
import { Image, Card, CardBody, Text } from '@chakra-ui/react'
import semImagem from '../../assets/sem imagem.webp'

function ImagemEvidencia({ foto, onClick, keyText }) {
  const [imgSrc, setImgSrc] = useState(
    foto.url?.startsWith('http') ? foto.url : `/evidencias/${foto.url}`
  )

  return (
    <Card boxShadow="md" cursor="pointer" onClick={onClick}>
      <Image
        src={imgSrc}
        alt={foto.comentario || `Foto ${keyText}`}
        objectFit="cover"
        roundedTop="md"
        maxH="200px"
        w="full"
        onError={() => setImgSrc(semImagem)}
      />
      <CardBody>
        <Text fontSize="sm" color="gray.600">{foto.comentario}</Text>
      </CardBody>
    </Card>
  )
}

export default ImagemEvidencia
