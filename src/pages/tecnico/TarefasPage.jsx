import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Flex, Button,Checkbox , Stack, Input, Textarea, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'; // Adicionando ícones para editar e excluir
import TecnicoBottomNav from '../../components/tecnico/TecnicoBottomNav'; // Importando o BottomNav

// Importando a variável de ambiente
const apiUrl = import.meta.env.VITE_NOCODB_URL; 
const apiToken = import.meta.env.VITE_NOCODB_TOKEN; // Importando o token

const TarefasPage = () => {
  const [descricao, setDescricao] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacao, setObservacao] = useState('');
  const [geolocalizacao, setGeolocalizacao] = useState({ latitude: '', longitude: '' });
  const [mensagem, setMensagem] = useState('');
  const [isSameDay, setIsSameDay] = useState(false);  // Novo estado para o checkbox
  const [modalOpen, setModalOpen] = useState(false);  // Estado para controle do modal
  const [tarefas, setTarefas] = useState([]);  // Estado para armazenar as tarefas
  const toast = useToast();

  const [tecnicoId, setTecnicoId] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);  // Estado para controlar a tarefa que será editada

  // Função para buscar o técnico e verificar se ele já existe
  const fetchTecnicoExistente = async (tecnicoId) => {
    try {
      const response = await fetch(`${apiUrl}/api/v2/tables/mvgmphezonf3jyk/records?where=(UnicID_Tecnico,eq,${tecnicoId})`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': apiToken,
        },
      });
      
      const result = await response.json();
      if (response.ok && result.list.length > 0) {
        return result.list[0];  // Retorna o técnico existente
      }
      return null;  // Não encontrou o técnico
    } catch (error) {
      console.error('Erro ao buscar técnico:', error);
      return null;
    }
  };

  const handleSameDayChange = () => {
    setIsSameDay(!isSameDay);
    if (!isSameDay) {
      // Se o checkbox for marcado, define a data de entrega para o dia atual
      setDataEntrega(new Date().toISOString().slice(0, 16));
    } else {
      setDataEntrega('');
    }
  };

  // Função para atualizar o JSON de tarefas do técnico existente
  const updateJsonTarefas = async (tecnicoId, novoJsonTarefa) => {
    try {
      const response = await fetch(`${apiUrl}/api/v2/tables/mvgmphezonf3jyk/records`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'xc-token': apiToken,
        },
        body: JSON.stringify({
          id: tecnicoId,  // Enviando o ID no corpo da requisição
          Json_Tarefas: novoJsonTarefa,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Erro ao atualizar o JSON de tarefas');
      }
    } catch (error) {
      console.error('Erro ao atualizar o JSON de tarefas:', error);
    }
  };

  // Função para buscar as tarefas ao carregar a página
  const fetchTarefas = async () => {
    const tecnicoNome = localStorage.getItem('nome');
    const tecnicoId = JSON.parse(localStorage.getItem('tecnico_1'))?.ID_Tecnico_Responsavel;

    if (tecnicoId) {
      const tecnicoExistente = await fetchTecnicoExistente(tecnicoId);

      if (tecnicoExistente?.Json_Tarefas?.tarefa) {
        setTarefas(tecnicoExistente.Json_Tarefas.tarefa); // Definir tarefas se o técnico existir
      }
    }
  };

  // Função para enviar a tarefa para o banco de dados
  const handleSubmit = async (e) => {
    e.preventDefault();

    const tecnicoNome = localStorage.getItem('nome');
    const tecnicoId = JSON.parse(localStorage.getItem('tecnico_1'))?.ID_Tecnico_Responsavel;

    // Verificar se o tecnicoId foi recuperado corretamente
    if (!tecnicoId) {
      toast({
        title: 'Erro',
        description: 'ID do técnico não encontrado.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Buscando o técnico no banco de dados
    const tecnicoExistente = await fetchTecnicoExistente(tecnicoId);

    const tarefa = {
      descricao,
      dataEntrega,
      endereco,
      observacao,
      geolocalizacao,
    };

    const novoJsonTarefa = {
      ...tecnicoExistente?.Json_Tarefas,  // Se o técnico existir, manter as tarefas anteriores
      tarefa: [...(tecnicoExistente?.Json_Tarefas?.tarefa || []), tarefa],  // Adiciona a nova tarefa
    };

    // Se o técnico existir, atualiza, caso contrário, cria um novo
    if (tecnicoExistente) {
      await updateJsonTarefas(tecnicoExistente.Id, novoJsonTarefa);
      setMensagem('Tarefa atualizada com sucesso!');
      toast({
        title: 'Tarefa atualizada',
        description: 'A tarefa foi atualizada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTarefas([...novoJsonTarefa.tarefa]);  // Atualiza a lista de tarefas
    } else {
      // Se o técnico não existir, cria um novo registro
      const data = {
        Tecnico: tecnicoNome,
        Json_Tarefas: novoJsonTarefa,
        UnicID_Tecnico: tecnicoId,
      };

      try {
        const response = await fetch(`${apiUrl}/api/v2/tables/mvgmphezonf3jyk/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': apiToken, // Usando o token de ambiente
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          setMensagem('Tarefa criada com sucesso!');
          toast({
            title: 'Tarefa criada',
            description: 'A tarefa foi criada com sucesso.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          // Limpar campos após envio
          setDescricao('');
          setDataEntrega('');
          setEndereco('');
          setObservacao('');
          setGeolocalizacao({ latitude: '', longitude: '' });
          setModalOpen(false); // Fechar o modal após a criação
          setTarefas([...novoJsonTarefa.tarefa]);  // Atualiza a lista de tarefas
        } else {
          setMensagem(`Erro ao criar tarefa: ${result.msg}`);
          toast({
            title: 'Erro ao criar tarefa',
            description: result.msg || 'Ocorreu um erro inesperado.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Erro ao criar tarefa:', error);
        setMensagem('Ocorreu um erro ao tentar criar a tarefa.');
        toast({
          title: 'Erro ao criar tarefa',
          description: 'Ocorreu um erro ao tentar criar a tarefa.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // UseEffect para buscar as tarefas ao carregar o componente
  useEffect(() => {
    fetchTarefas();  // Buscar as tarefas ao carregar a página
  }, []);  // Só executa quando o componente for montado


    // Função para editar a tarefa
    const handleEdit = (index) => {
        const tarefaToEdit = tarefas[index];
        setDescricao(tarefaToEdit.descricao);
        setDataEntrega(tarefaToEdit.dataEntrega);
        setEndereco(tarefaToEdit.endereco);
        setObservacao(tarefaToEdit.observacao);
        setTaskToEdit(tarefaToEdit);  // Define a tarefa para editar
        setModalOpen(true);  // Abre o modal para edição
      };


        // Função para excluir uma tarefa
  const handleDelete = async (index) => {
    const tarefaToDelete = tarefas[index];

    const tecnicoNome = localStorage.getItem('nome');
    const tecnicoId = JSON.parse(localStorage.getItem('tecnico_1'))?.ID_Tecnico_Responsavel;

    if (tecnicoId && tarefaToDelete) {
      const tecnicoExistente = await fetchTecnicoExistente(tecnicoId);
      const updatedTarefas = tecnicoExistente?.Json_Tarefas?.tarefa.filter((_, idx) => idx !== index);  // Remove a tarefa pela posição do índice

      if (tecnicoExistente) {
        await updateJsonTarefas(tecnicoExistente.Id, { tarefa: updatedTarefas });
        setTarefas(updatedTarefas);  // Atualiza a lista de tarefas
        toast({
          title: 'Tarefa excluída',
          description: 'A tarefa foi excluída com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const formatData = (data) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateObj = new Date(data);
    return dateObj.toLocaleString('pt-BR', options);  // Você pode ajustar o locale se necessário
  };

  
  
    

  return (
    <Box pb="70px">
      {/* Cabeçalho da página */}
      <Flex align="center" justify="space-between" p={4} bg="#3182ce" color="white">
        <Heading size="md">Criar Tarefa</Heading>
      </Flex>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Tarefa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <Input
                  placeholder="Descrição da Tarefa"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
                    <Flex gap={2} align="center">
                    <Input
                        type="datetime-local"
                        value={dataEntrega}
                        onChange={(e) => setDataEntrega(e.target.value)}
                        isDisabled={isSameDay}  // Desabilita o campo quando for "no próprio dia"
                        required
                    />
                    <Checkbox 
                        isChecked={isSameDay}
                        onChange={handleSameDayChange}
                    >
                        É no próprio dia
                    </Checkbox>
                    </Flex>
                <Input
                  placeholder="Endereço"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Observação"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
                <Flex gap={2}>
                  <Input
                    placeholder="Latitude"
                    value={geolocalizacao.latitude}
                    onChange={(e) => setGeolocalizacao({ ...geolocalizacao, latitude: e.target.value })}
                  />
                  <Input
                    placeholder="Longitude"
                    value={geolocalizacao.longitude}
                    onChange={(e) => setGeolocalizacao({ ...geolocalizacao, longitude: e.target.value })}
                  />
                </Flex>
                <Button colorScheme="blue" type="submit">
                  Criar Tarefa
                </Button>
              </Stack>
            </form>
            {mensagem && <Text mt={4} color="red.500">{mensagem}</Text>}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Exibir Tarefas */}
      <Box mt={4} px={4}>
        <Heading size="md" mb={4}>Tarefas</Heading>
        {tarefas.length > 0 ? (
          tarefas.map((tarefa, index) => (
            <Box key={index} p={4} borderWidth={1} mb={4} borderRadius="md">
              <Text><strong>Descrição:</strong> {tarefa.descricao}</Text>
              <Text><strong>Data de Entrega:</strong> {formatData(tarefa.dataEntrega)}</Text>
              <Text><strong>Endereço:</strong> {tarefa.endereco}</Text>
              <Text><strong>Observação:</strong> {tarefa.observacao}</Text>
              <Flex justify="space-between" mt={2}>
                <Button colorScheme="yellow" onClick={() => handleEdit(index)}>
                  <EditIcon boxSize={4} />
                </Button>
                <Button colorScheme="red" onClick={() => handleDelete(index)}>
                  <DeleteIcon boxSize={4} />
                </Button>
              </Flex>
            </Box>
          ))
        ) : (
          <Text>Não há tarefas.</Text>
        )}
      </Box>

      {/* Botão flutuante para abrir o modal */}
      <Button 
        position="fixed" 
        bottom="80px" 
        right="20px" 
        borderRadius="50%" 
        colorScheme="blue" 
        boxSize="60px" 
        onClick={() => setModalOpen(true)}
        aria-label="Adicionar Tarefa"
      >
        <AddIcon boxSize={6} />
      </Button>

      {/* Navegação Inferior */}
      <TecnicoBottomNav />
    </Box>
  );
};

export default TarefasPage;
