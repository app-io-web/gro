import {
  Box,
  Button,
  Icon,
  Input,
  Text,
  Image,
  Textarea,
  SimpleGrid,
  useToast
} from '@chakra-ui/react'
import { FiUploadCloud } from 'react-icons/fi'
import { useRef, useEffect } from 'react'
import axios from 'axios'
import { tentarReenviarFotosOffline } from '../../utils/reenvioOffline'

function UploadFotosEvidencias({ evidencias, setEvidencias }) {
  const inputRef = useRef()
  const toast = useToast()

  useEffect(() => {
    const tentarReenviar = async () => {
      if (navigator.onLine) {
        await tentarReenviarFotosOffline()
      }
    }

    // Tenta reenviar ao abrir e quando voltar a conexão
    window.addEventListener('online', tentarReenviar)
    tentarReenviar()

    return () => window.removeEventListener('online', tentarReenviar)
  }, [])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (Object.keys(evidencias).length + files.length > 4) {
      toast({
        title: 'Máximo de 4 fotos permitidas.',
        status: 'warning'
      })
      return
    }

    let fotoIndex = Object.keys(evidencias).length

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Envie apenas arquivos de imagem.', status: 'warning' })
        continue
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_NOCODB_URL}/api/v2/storage/upload`,
          formData,
          {
            headers: {
              'xc-token': import.meta.env.VITE_NOCODB_TOKEN,
              'Content-Type': 'multipart/form-data'
            }
          }
        )

        const filePath = res?.data?.[0]?.path
        if (!filePath) throw new Error('Erro ao obter caminho da imagem')

        const fullUrl = `${import.meta.env.VITE_NOCODB_URL.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`

        fotoIndex++

        setEvidencias(prev => ({
          ...prev,
          [`Foto${fotoIndex}`]: {
            url: fullUrl,
            comentario: ''
          }
        }))

      } catch (err) {
        const salvarOffline = (file) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = reader.result
            const pendentes = JSON.parse(localStorage.getItem('fotos_pendentes_upload') || '[]')
            pendentes.push({ base64 })
            localStorage.setItem('fotos_pendentes_upload', JSON.stringify(pendentes))
          }
          reader.readAsDataURL(file)
        }

        console.error('❌ Erro upload imagem:', err)
        toast({ title: 'Erro ao enviar imagem. Salva offline.', status: 'error' })
        salvarOffline(file)
      }
    }

    toast({ title: 'Fotos enviadas com sucesso!', status: 'success' })
  }

  const handleComentarioChange = (fotoKey, comentario) => {
    setEvidencias(prev => ({
      ...prev,
      [fotoKey]: {
        ...prev[fotoKey],
        comentario
      }
    }))
  }

  return (
    <Box>
      <Text mb={2}>📷 Enviar Fotos de Evidência:</Text>

      <Button
        leftIcon={<Icon as={FiUploadCloud} />}
        colorScheme="gray"
        variant="outline"
        onClick={() => inputRef.current.click()}
        isDisabled={Object.keys(evidencias).length >= 4}
        mb={4}
      >
        Selecionar Fotos ({Object.keys(evidencias).length}/4)
      </Button>

      <Input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        onChange={handleUpload}
        display="none"
      />

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {Object.entries(evidencias).map(([fotoKey, { url, comentario }]) => (
          <Box key={fotoKey} borderWidth="1px" borderRadius="md" overflow="hidden" p={2}>
            <Image
              src={url}
              alt={`Foto ${fotoKey}`}
              objectFit="cover"
              borderRadius="md"
              width="100%"
              height="120px"
            />
            <Textarea
              value={comentario}
              onChange={(e) => handleComentarioChange(fotoKey, e.target.value)}
              placeholder="Comentário (Obrigatório)"
              size="sm"
              mt={2}
              minHeight="60px"
            />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default UploadFotosEvidencias
