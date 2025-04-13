// src/pages/RedefinirSenha.jsx
import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, Heading, Progress, Text } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const [forcaSenha, setForcaSenha] = useState(0);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // Função para verificar a força da senha
  const avaliarForcaSenha = (senha) => {
    let forca = 0;
    if (senha.length >= 8) forca += 1;
    if (/[A-Z]/.test(senha)) forca += 1;
    if (/[a-z]/.test(senha)) forca += 1;
    if (/[0-9]/.test(senha)) forca += 1;
    if (/[^A-Za-z0-9]/.test(senha)) forca += 1;
    return forca;
  };

  const handleSenhaChange = (e) => {
    const senha = e.target.value;
    setNovaSenha(senha);
    setForcaSenha(avaliarForcaSenha(senha));
  };

  const senhaForte = () => {
    return (
      novaSenha.length >= 8 &&
      /[A-Z]/.test(novaSenha) &&
      /[a-z]/.test(novaSenha) &&
      /[0-9]/.test(novaSenha) &&
      /[^A-Za-z0-9]/.test(novaSenha)
    );
  };

  const handleRedefinirSenha = async () => {
    if (!novaSenha) {
      toast({ title: 'Digite a nova senha.', status: 'error', duration: 3000 });
      return;
    }

    if (!senhaForte()) {
      toast({ title: 'A senha precisa ter letra maiúscula, minúscula, número, caractere especial e no mínimo 8 dígitos.', status: 'error', duration: 5000 });
      return;
    }
  
    try {
      const res = await fetch('https://recoverypass-sgo.appsy.app.br/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), novaSenha: novaSenha.trim() })
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast({ title: data.message, status: 'success', duration: 4000 });
        navigate('/'); // Redireciona para o login
      } else {
        toast({ title: data.message, status: 'error', duration: 4000 });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao redefinir senha.', status: 'error', duration: 4000 });
    }
  };

  // Cores da barra de progresso
  const getBarColor = () => {
    if (forcaSenha <= 2) return 'red.400';
    if (forcaSenha === 3) return 'yellow.400';
    return 'green.400';
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
        <Heading size="lg" mb={6}>Redefinir Senha</Heading>

        <FormControl mb={4}>
          <FormLabel textAlign="left">Nova Senha</FormLabel>
          <Input
            type="password"
            value={novaSenha}
            onChange={handleSenhaChange}
          />
        </FormControl>

        {/* Indicador de Força da Senha */}
        {novaSenha && (
          <>
            <Progress value={(forcaSenha / 5) * 100} size="sm" colorScheme={getBarColor().split('.')[0]} rounded="md" mb={2} />
            <Text fontSize="sm" color={getBarColor()} fontWeight="bold">
              {forcaSenha <= 2 ? 'Senha Fraca' : forcaSenha === 3 ? 'Senha Média' : 'Senha Forte'}
            </Text>
          </>
        )}

        <Button
          colorScheme="blue"
          w="full"
          mt={4}
          onClick={handleRedefinirSenha}
        >
          Salvar Nova Senha
        </Button>
      </Box>
    </VStack>
  );
}

export default RedefinirSenha;
