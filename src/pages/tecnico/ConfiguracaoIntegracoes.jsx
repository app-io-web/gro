import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, Input, Select, FormControl, FormLabel, useToast, Text, VStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure } from '@chakra-ui/react';
import TecnicoBottomNav from '../../components/tecnico/TecnicoBottomNav';  // Importando o BottomNav
import { apiGet, apiPost } from '../../services/api';  // Adapte os serviços de API conforme sua necessidade
import { v4 as uuidv4 } from 'uuid';

const ConfiguracaoIntegracoes = () => {
  const [integracoes, setIntegracoes] = useState([]); // Guardar a lista de integrações
  const [selectedPlataforma, setSelectedPlataforma] = useState('');  // A plataforma selecionada
  const [apiKey, setApiKey] = useState(''); // Chave da API
  const [nomeTecnico, setNomeTecnico] = useState('');  // Nome do técnico
  const [unicidTecnico, setUnicidTecnico] = useState('');  // UnicID do técnico
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();  // Controle do modal

  // Função para buscar as integrações
// Função para buscar as integrações
    const fetchIntegracoes = async () => {
        try {
        const response = await apiGet('/api/v2/tables/m3d1mb6n58ajo2u/records');  // Endpoint de integração correto
        if (response?.list) {
            // Filtra as integrações para exibir apenas as que têm chave da API
            const plataformas = response.list.filter(item => item.apikey);  // Verifica se tem a chave API
            const platformOptions = plataformas.map(item => item.plataforma);  // Extrai a plataforma
            setIntegracoes(platformOptions);  // Atualiza o estado com as plataformas que possuem chave API
        }
        setLoading(false);
        } catch (error) {
        console.error("Erro ao buscar integrações:", error);
        setLoading(false);
        toast({
            title: 'Erro ao carregar integrações',
            description: 'Ocorreu um erro ao carregar as integrações.',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        }
    };
  

  // Função para salvar a integração
  const handleSaveIntegration = async () => {
    if (!selectedPlataforma || !apiKey || !nomeTecnico || !unicidTecnico) {
      toast({
        title: 'Erro',
        description: 'Selecione uma plataforma, insira a chave da API, e certifique-se de que os dados do técnico estão completos.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const tecnicoId = localStorage.getItem('tecnico_id');  // AQUI PEGA O ID INTEIRO!
    
    if (!tecnicoId) {
      toast({
        title: 'Erro',
        description: 'ID do técnico não encontrado no localStorage.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      Id: parseInt(tecnicoId), // ID correto (inteiro, sem UUID)
      Usuario: nomeTecnico,    // Nome do técnico
      UnicID: unicidTecnico,   // Pode enviar o UnicID (string) pra um campo tipo texto
      plataforma: selectedPlataforma,
      apikey: apiKey,
    };

    try {
      const response = await apiPost('/api/v2/tables/my0sqoras5kz8fc/records', payload);
      console.log("Resposta do servidor:", response);
      toast({
        title: 'Integração salva com sucesso!',
        description: 'A chave da API foi salva corretamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setApiKey('');
      setSelectedPlataforma('');
      fetchIntegracoes();  // Recarregar a lista de integrações
      onClose();  // Fechar o modal
    } catch (error) {
      console.error("Erro ao salvar integração:", error);
      toast({
        title: 'Erro ao salvar integração',
        description: `Erro: ${error.message || error}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Função para obter os dados do técnico (nome e unicid)
  const fetchDadosTecnico = () => {
    const nome = localStorage.getItem('nome');
    const unicid = localStorage.getItem('ID_Tecnico_Responsavel');
    
    if (nome && unicid) {
      setNomeTecnico(nome);
      setUnicidTecnico(unicid);
    } else {
      toast({
        title: 'Erro',
        description: 'Dados do técnico não encontrados no localStorage.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchIntegracoes();  // Carregar as integrações ao montar a página
    fetchDadosTecnico();  // Carregar os dados do técnico ao montar a página
  }, []);

  return (
    <Box pb="70px" maxWidth="100vw">
      {/* Cabeçalho da página */}
      <Box p={4} bg="blue.600" color="white" >
        <Heading size="lg" textAlign="center">Configurações de Integração</Heading>
      </Box>

      {/* Exibição das integrações já existentes */}
      <VStack spacing={6} maxWidth="600px" mx="auto" px={4}>
        {integracoes.length > 0 ? (
          integracoes.map((plataforma, index) => (
            <Box key={index} p={4} bg="gray.100" borderRadius="md" boxShadow="sm" width="100%">
              <Text fontSize="lg" fontWeight="bold">{plataforma}</Text>
            </Box>
          ))
        ) : (
          <Text color="gray.500">Nenhuma integração foi realizada ainda.</Text>
        )}
      </VStack>

      {/* Botão para abrir o modal */}
      <Button colorScheme="blue" size="lg" onClick={onOpen} width="100%" mt={6}>
        Adicionar Integração
      </Button>

      {/* Modal para adicionar integração */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Adicionar Integração</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor="plataforma" fontWeight="semibold" fontSize="lg">Plataforma</FormLabel>
              <Select
                id="plataforma"
                value={selectedPlataforma}
                onChange={(e) => setSelectedPlataforma(e.target.value)}
                placeholder="Selecione a Plataforma"
                size="lg"
                bg="white"
                borderColor="blue.300"
                focusBorderColor="blue.400"
              >
                {integracoes.length === 0 ? (
                  <option value="">Nenhuma plataforma disponível</option>
                ) : (
                  integracoes.map((plataforma, index) => (
                    <option key={index} value={plataforma}>
                      {plataforma}
                    </option>
                  ))
                )}
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor="apiKey" fontWeight="semibold" fontSize="lg">Chave da API</FormLabel>
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Digite a chave da API"
                size="lg"
                bg="white"
                borderColor="blue.300"
                focusBorderColor="blue.400"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveIntegration}>
              Salvar Integração
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Navegação Inferior */}
      <TecnicoBottomNav />
    </Box>
  );
};

export default ConfiguracaoIntegracoes;
