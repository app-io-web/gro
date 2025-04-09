import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  IconButton,
  Input,
  VStack,
  Text,
  Flex,
  useToast,
} from '@chakra-ui/react'
import { ChatIcon, CloseIcon } from '@chakra-ui/icons'
import { FaPaperPlane } from 'react-icons/fa'

export default function AgenteIAFlutuante({ empresasData }) {
  const [chatOpen, setChatOpen] = useState(false)
  const [perguntaAtual, setPerguntaAtual] = useState('')
  const [mensagens, setMensagens] = useState([])
  const [loading, setLoading] = useState(false)
  const mensagensEndRef = useRef(null)
  const toast = useToast()

  const toggleChat = () => {
    setChatOpen(!chatOpen)
  }

  const scrollParaBaixo = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (chatOpen) {
      scrollParaBaixo()
    }
  }, [mensagens, chatOpen])

  const formatarResposta = (texto) => {
    if (!texto) return '';
  
    // Transforma links em <a>
    const textoComLinks = texto.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => `<a href="${url}" target="_blank" style="color:blue;text-decoration:underline;">[Abrir Link]</a>`
    );
  
    // Negritar palavras-chave
    const textoComNegrito = textoComLinks
      .replace(/(Empresa:)/g, '<b>$1</b>')
      .replace(/(Tipo de Ordem de Serviço:)/g, '<b>$1</b>')
      .replace(/(Cliente:)/g, '<b>$1</b>')
      .replace(/(Telefone[s]?:)/g, '<b>$1</b>')
      .replace(/(Endereço do Cliente:)/g, '<b>$1</b>')
      .replace(/(Observação da Empresa:)/g, '<b>$1</b>')
      .replace(/(Técnico Responsável:)/g, '<b>$1</b>')
      .replace(/(Data de Envio da Ordem de Serviço:)/g, '<b>$1</b>')
      .replace(/(Número da Ordem de Serviço:)/g, '<b>$1</b>');
  
    // Corrige quebra de linha para o HTML
    const textoFinal = textoComNegrito.replace(/\n/g, '<br />');
  
    return textoFinal;
  };
  

  const enviarPergunta = async () => {
    if (!perguntaAtual.trim()) return

    const novaMensagemUsuario = { tipo: 'usuario', texto: perguntaAtual }
    setMensagens(prev => [...prev, novaMensagemUsuario])
    setPerguntaAtual('')
    setLoading(true)

    try {
      const res = await fetch('https://inte.groia.nexusnerds.com.br/assistente-ordens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pergunta: perguntaAtual,
          dados: empresasData
        })
      })

      const data = await res.json()
      const respostaIA = {
        tipo: 'ia',
        texto: formatarResposta(data.resposta || 'Não consegui entender 😕')
      }
      setMensagens(prev => [...prev, respostaIA])

      toast({
        title: 'Nova resposta recebida!',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'top-right',
      })
    } catch (err) {
      console.error('Erro ao consultar IA:', err)
      const erroMensagem = { tipo: 'ia', texto: '⚠️ Erro ao tentar responder.' }
      setMensagens(prev => [...prev, erroMensagem])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box position="fixed" bottom="80px" right="30px" zIndex="9999">
      {chatOpen ? (
        <Box
          bg="white"
          p={4}
          shadow="2xl"
          borderRadius="lg"
          w="350px"
          maxH="600px"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <VStack spacing={3} align="stretch" flex="1" overflowY="auto" pr={2}>
            {mensagens.map((msg, idx) => (
              <Flex
                key={idx}
                justify={msg.tipo === 'usuario' ? 'flex-end' : 'flex-start'}
                px={1}
              >
                {msg.tipo === 'ia' ? (
                  <Box
                    bg="gray.100"
                    p={3}
                    borderRadius="20px 20px 20px 0px"
                    maxW="90%"
                    whiteSpace="pre-line"
                    overflowWrap="break-word"
                    wordBreak="break-word"
                    fontSize="sm"
                    textAlign="left"
                    dangerouslySetInnerHTML={{ __html: msg.texto }}
                  />

                ) : (
                  <Box
                    bg="blue.100"
                    p={3}
                    borderRadius="20px 20px 0px 20px"
                    maxW="90%"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                    fontSize="sm"
                    textAlign="left"
                  >
                    {msg.texto}
                  </Box>
                )}
              </Flex>
            ))}
            <div ref={mensagensEndRef} />
          </VStack>


          <Flex mt={3} gap={2}>
            <Input
              placeholder="Digite sua pergunta..."
              value={perguntaAtual}
              onChange={e => setPerguntaAtual(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') enviarPergunta() }}
              isDisabled={loading}
              size="sm"
              flex="1"
            />
            <IconButton
              colorScheme="blue"
              onClick={enviarPergunta}
              size="sm"
              icon={<FaPaperPlane />}
              isLoading={loading}
              aria-label="Enviar pergunta"
            />
          </Flex>

          <Button
            leftIcon={<CloseIcon />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            mt={2}
            onClick={toggleChat}
          >
            Fechar
          </Button>
        </Box>
      ) : (
        <IconButton
          colorScheme="blue"
          aria-label="Abrir Agente IA"
          icon={<ChatIcon />}
          isRound
          size="lg"
          onClick={toggleChat}
          shadow="lg"
        />
      )}
    </Box>
  )
}
