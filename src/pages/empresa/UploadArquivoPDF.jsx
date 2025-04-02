import {
    Box, Button, Input, Text, useToast, Icon
  } from '@chakra-ui/react'
  import { useRef, useState } from 'react'
  import { FiUploadCloud } from 'react-icons/fi'
  import axios from 'axios'
  
  function UploadArquivoPDF({ onUpload }) {
    const [fileName, setFileName] = useState('')
    const toast = useToast()
    const inputRef = useRef()
  
    const handleFileChange = async (e) => {
      const file = e.target.files[0]
  
      if (!file || file.type !== 'application/pdf') {
        toast({ title: 'Apenas arquivos PDF são permitidos.', status: 'warning' })
        return
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
  
        console.log('📦 Resposta do NocoDB:', res.data)
  
        const filePath = res?.data?.[0]?.path
        if (!filePath) throw new Error('Erro ao obter o caminho do arquivo')
  
            // Garante que tenha uma barra entre o domínio e o path
            const fullUrl = `${import.meta.env.VITE_NOCODB_URL.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}`
            
        setFileName(file.name)
        onUpload(fullUrl)
  
        toast({ title: 'Upload concluído com sucesso', status: 'success' })
      } catch (err) {
        console.error(err)
        toast({ title: 'Erro ao fazer upload para o NocoDB', status: 'error' })
      }
    }
  
    return (
      <Box border="1px dashed #CBD5E0" p={4} borderRadius="md" textAlign="center">
        <Text mb={2}>📎 Anexar PDF da Ordem (opcional)</Text>
  
        <Button
          leftIcon={<Icon as={FiUploadCloud} />}
          colorScheme="gray"
          variant="outline"
          onClick={() => inputRef.current.click()}
        >
          Selecionar PDF
        </Button>
  
        <Input
          type="file"
          accept="application/pdf"
          ref={inputRef}
          onChange={handleFileChange}
          display="none"
        />
  
        {fileName && (
          <Text mt={2} fontSize="sm" color="green.600">
            📄 {fileName}
          </Text>
        )}
      </Box>
    )
  }
  
  export default UploadArquivoPDF
  