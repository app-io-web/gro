// src/pages/EsqueciSenha.jsx
import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PinInput, PinInputField, HStack, Text, Link } from '@chakra-ui/react';


function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState(1); // 1: pedir email, 2: pedir código
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleEnviarEmail = async () => {
    if (!email) {
      toast({ title: 'Digite seu e-mail.', status: 'error', duration: 3000 });
      return;
    }
  
    setEnviandoEmail(true); // 🔵 BLOQUEIA o botão
  
    try {
      const res = await fetch('https://recoverypass-sgo.appsy.app.br/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast({ title: data.message, status: 'success', duration: 4000 });
        setEtapa(2); // Muda para a etapa de validar código
      } else {
        toast({ title: data.message, status: 'error', duration: 4000 });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao conectar.', status: 'error', duration: 4000 });
    } finally {
      setEnviandoEmail(false); // 🔵 DESBLOQUEIA o botão após terminar tudo
    }
  };
  

  const handleValidarCodigo = async () => {
    if (!codigo) {
      toast({ title: 'Digite o código enviado para seu e-mail.', status: 'error', duration: 3000 });
      return;
    }

    try {
      const res = await fetch('https://recoverypass-sgo.appsy.app.br/validar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), codigo: codigo.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        toast({ title: data.message, status: 'success', duration: 4000 });
        // Redireciona para a tela de redefinir senha
        navigate('/redefinir-senha', { state: { email } });
      } else {
        toast({ title: data.message, status: 'error', duration: 4000 });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao validar o código.', status: 'error', duration: 4000 });
    }
  };

  const handleReenviarCodigo = async () => {
    if (!email) {
      toast({ title: 'Email não encontrado.', status: 'error', duration: 3000 });
      return;
    }
  
    try {
      const res = await fetch('https://recoverypass-sgo.appsy.app.br/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast({ title: 'Novo código enviado!', status: 'success', duration: 4000 });
      } else {
        toast({ title: data.message || 'Erro ao reenviar código.', status: 'error', duration: 4000 });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro de conexão.', status: 'error', duration: 4000 });
    }
  };
  

  return (
    <VStack spacing={6} p={6} align="center" justify="center" minH="100vh" bg="gray.50">
    <Box
        bg="white"
        p={8}
        rounded="md"
        shadow="md"
        w="full"
        maxW="400px"
        textAlign="center"
    >
        <Heading size="lg" mb={6}>Recuperação de Senha</Heading>

        {etapa === 1 && (
        <>
            <FormControl mb={4}>
            <FormLabel textAlign="left">Digite seu e-mail</FormLabel>
            <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </FormControl>

            <Button
            colorScheme="blue"
            w="full"
            onClick={handleEnviarEmail}
            isLoading={enviandoEmail}
            isDisabled={enviandoEmail}
            >
            Enviar Código
            </Button>
        </>
        )}

        {etapa === 2 && (
        <>
            <FormControl mb={4}>
            <FormLabel textAlign="left">Digite o código de segurança</FormLabel>
            <HStack justify="center">
                <PinInput otp value={codigo} onChange={setCodigo}>
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                <PinInputField />
                </PinInput>
            </HStack>
            </FormControl>

            <Button
            colorScheme="green"
            w="full"
            onClick={handleValidarCodigo}
            >
            Validar Código
            </Button>

            <Text mt={4} fontSize="sm" textAlign="center" color="gray.500">
            Não recebeu?{' '}
            <Link color="blue.500" fontWeight="bold" onClick={handleReenviarCodigo}>
                Reenviar código
            </Link>
            </Text>
        </>
        )}
    </Box>
    </VStack>

  );
}

export default EsqueciSenha;
