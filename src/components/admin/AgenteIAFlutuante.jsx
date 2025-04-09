import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Button,
  IconButton,
  Input,
  VStack,
  Flex,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { ChatIcon, CloseIcon } from '@chakra-ui/icons'
import { FaPaperPlane } from 'react-icons/fa'

export default function AgenteIAFlutuante({ empresasData }) {
  const [chatOpen, setChatOpen] = useState(false)
  const [perguntaAtual, setPerguntaAtual] = useState('')
  const [mensagens, setMensagens] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('Digitando...')
  const mensagensEndRef = useRef(null)
  const toast = useToast()

  const frasesCarregando = ['Digitando...', 'Analisando dados...', 'Verificando informações...']
  let fraseIndex = 0

  const toggleChat = () => {
    setChatOpen(!chatOpen)
    if (!chatOpen) {
      enviarMensagemBoasVindas()
    }
  }

  const scrollParaBaixo = () => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (chatOpen) {
      scrollParaBaixo()
    }
  }, [mensagens, chatOpen])




  useEffect(() => {
    let interval
    if (loading) {
      interval = setInterval(() => {
        fraseIndex = (fraseIndex + 1) % frasesCarregando.length
        setLoadingStatus(frasesCarregando[fraseIndex])
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [loading])

  const enviarMensagemBoasVindas = () => {
    const hora = new Date().getHours()
    const hoje = new Date()
    const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(hoje)
  
    let saudacao = 'Olá! Como posso ajudá-lo(a)?'
  
    if (hora >= 5 && hora < 12) {
      saudacao = `Bom dia! Como posso ajudar você nesta manhã de ${diaSemana}?`
    } else if (hora >= 12 && hora < 18) {
      saudacao = `Boa tarde! Em que posso te ajudar nesta tarde de ${diaSemana}?`
    } else {
      saudacao = `Boa noite! Como posso ajudar você nesta noite de ${diaSemana}?`
    }
  
    setMensagens([{ tipo: 'ia', texto: saudacao }])
  }
  

const formatarResposta = (texto) => {
  let textoFormatado = texto
    .replace(/(Empresa:)/g, '<b>$1</b>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/(Tipo de Ordem de Serviço:)/g, '<b>$1</b>')
    .replace(/(Cliente:)/g, '<b>$1</b>')
    .replace(/(Telefone[s]* de [Contato|Cliente]*:)/g, '<b>$1</b>')
    .replace(/(Endereço:)/g, '<b>$1</b>')
    .replace(/(Observação da Empresa:)/g, '<b>$1</b>')
    .replace(/(Coordenadas:)/g, '<b>$1</b>')
    .replace(/(Técnico Responsável:)/g, '<b>$1</b>')
    .replace(/(Data de Envio da Ordem de Serviço:|Enviado em:)/g, '<b>$1</b>')
    .replace(/(Número da Ordem de Serviço:)/g, '<b>$1</b>')

  // Corrigir links no estilo [texto](url)
  textoFormatado = textoFormatado.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" style="color: blue; text-decoration: underline;">$1</a>'
  )

  return textoFormatado
}


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
          dados: empresasData,
          historico: mensagens // <--- adiciona o histórico!
        })
      })

      const data = await res.json()
      const respostaIA = {
        tipo: 'ia',
        texto: formatarResposta(data.resposta || 'Não consegui entender 😕')
      }
      setMensagens(prev => [...prev, respostaIA])

      toast({
        title: 'Resposta recebida!',
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
          w="380px"
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
                    maxW="100%"
                    fontSize="sm"
                    textAlign="left"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                    dangerouslySetInnerHTML={{ __html: msg.texto }}
                  />
                ) : (
                  <Box
                    bg="blue.100"
                    p={3}
                    borderRadius="20px 20px 0px 20px"
                    maxW="100%"
                    fontSize="sm"
                    textAlign="left"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {msg.texto}
                  </Box>
                )}
              </Flex>
            ))}

            {loading && (
              <Flex justify="flex-start" px={1}>
                <Box
                  bg="gray.100"
                  p={3}
                  borderRadius="20px 20px 20px 0px"
                  maxW="80%"
                  fontSize="sm"
                >
                  <Flex align="center" gap={2}>
                    <Spinner size="xs" /> {loadingStatus}
                  </Flex>
                </Box>
              </Flex>
            )}
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
