import { Box, Flex, IconButton, Badge } from '@chakra-ui/react';
import { FiHome, FiTool, FiBell, FiList, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiGet } from '../../services/api';

function TecnicoBottomNav() {
  const navigate = useNavigate();
  const [notificacoesCount, setNotificacoesCount] = useState(0); // Contador de notificações

  // Lógica para buscar o número de notificações
  const fetchNotificacoesCount = async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records'); // Sua API para obter ordens
      const ordens = res?.list || [];

      // Filtrar ordens com status 'agendada' ou 'reagendada' e contar
      const novasNotificacoes = ordens.filter(
        (ordem) =>
          ordem.Status_OS?.toLowerCase() === 'agendada' ||
          ordem.Status_OS?.toLowerCase() === 'reagendada'
      );

      setNotificacoesCount(novasNotificacoes.length); // Atualizar o contador
      console.log('Contagem de notificações:', novasNotificacoes.length); // Adicionando log para depuração
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  // Chama a função ao carregar o componente e sempre que uma atualização for necessária
  useEffect(() => {
    fetchNotificacoesCount(); // Atualiza o contador de notificações

    // Não é mais necessário o setInterval, pois estamos atualizando diretamente ao carregar ou modificar dados
  }, []); // Somente no primeiro carregamento do componente

  return (
    <Box
      pos="fixed"
      bottom="0"
      left="0"
      w="100%"
      bg="white"
      boxShadow="0 -1px 5px rgba(0, 0, 0, 0.1)"
      zIndex="999"
      px={4}
      py={2}
      display={{ base: 'flex', md: 'none' }}
    >
      <Flex justify="space-between" align="center" w="100%">
        <IconButton
          icon={<FiHome />}
          variant="ghost"
          onClick={() => navigate('/tecnico')}
          aria-label="Agenda"
        />

        {/* Ícone de notificações com contagem */}
        <IconButton
          icon={<FiBell />}
          variant="ghost"
          onClick={() => navigate('/tecnico/notificacoes')}
          aria-label="Notificações"
        >
          {notificacoesCount > 0 && (
            <Badge
              colorScheme="red"
              position="absolute"
              top="0"
              right="0"
              borderRadius="full"
              px={2}
              py={1}
            >
              {notificacoesCount}
            </Badge>
          )}
        </IconButton>

        <IconButton
          icon={<FiList />}
          variant="ghost"
          onClick={() => navigate('/tecnico/tarefas')}
          aria-label="Tarefas"
        />
        <IconButton
          icon={<FiSettings />}
          variant="ghost"
          onClick={() => navigate('/tecnico/perfil')}
          aria-label="Configurações"
        />
      </Flex>
    </Box>
  );
}

export default TecnicoBottomNav;
