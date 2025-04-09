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
import { FaPaperPlane } from 'react-icons/fa' // Ícone de aviãozinho

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
      const respostaIA = { tipo: 'ia', texto: data.resposta || 'Não consegui entender 😕' }
      setMensagens(prev => [...prev, respostaIA])

      // 🔔 Animaçãozinha/toast ao receber resposta
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
          w="300px"
          maxH="500px"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <VStack spacing={3} align="stretch" flex="1" overflowY="auto">
            {mensagens.map((msg, idx) => (
              <Flex
                key={idx}
                justify={msg.tipo === 'usuario' ? 'flex-end' : 'flex-start'}
                px={1}
              >
                <Box
                  bg={msg.tipo === 'usuario' ? 'blue.100' : 'gray.100'}
                  p={2}
                  borderRadius="md"
                  maxW="80%"
                  fontSize="sm"
                >
                  {msg.texto}
                </Box>
              </Flex>
            ))}
            {/* Âncora invisível para scroll automático */}
            <div ref={mensagensEndRef} />
          </VStack>

          <Flex mt={3} gap={2}>
            <Input
              placeholder="Digite..."
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
