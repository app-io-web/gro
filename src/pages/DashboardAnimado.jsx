import { useState, useEffect } from 'react';
import { Flex, Grid, GridItem, Image } from '@chakra-ui/react';
import Lottie from 'lottie-react';

// Importa as animações
import dashboard1 from '../assets/lotties/dashboard 1.json';
import dashboard2 from '../assets/lotties/dashboard 2.json';
import dashboard3 from '../assets/lotties/dashboard 3.json';
import dashboard4 from '../assets/lotties/dashboard 4.json';
import dashboard5 from '../assets/lotties/dashboard 5.json';

function DashboardAnimado() {
  const [mostrarDashboards, setMostrarDashboards] = useState(false);
  const [imagemIlustracao, setImagemIlustracao] = useState('/Imagem 1920x1080.png');

  useEffect(() => {
    // Detecta tamanho da tela ao abrir
    const handleResize = () => {
      if (window.innerWidth > 1400) {
        setImagemIlustracao('/Imagem 1920x1080.png');
      } else {
        setImagemIlustracao('/Imagem 1080x1000.png');
      }
    };

    handleResize(); // Executa ao carregar a página
    window.addEventListener('resize', handleResize); // Atualiza se redimensionar

    const timer = setTimeout(() => {
      setMostrarDashboards(true);
    }, 12000); // Espera 12 segundos

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Flex w="100%" h="100%" direction="column" align="center" justify="start" p={4}>
      {!mostrarDashboards ? (
        <Image
          src={imagemIlustracao}
          alt="Dashboard inicial"
          objectFit="cover"
          maxW="100%"
          maxH="90vh"
        />
      ) : (
        <Grid
          templateColumns="repeat(2, 1fr)"
          gap={4}
          w="100%"
          maxW="100%"
          mx="auto"
        >
          {/* Primeira Linha - Ocupa tudo */}
          <GridItem colSpan={2}>
            <Flex
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="md"
              align="center"
              justify="center"
              minH="200px"
            >
              <Lottie
                animationData={dashboard1}
                loop
                style={{ width: '100%', height: '380px' }}
              />
            </Flex>
          </GridItem>

          {/* Segunda Linha - 2 colunas */}
          <GridItem>
            <Flex
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="md"
              align="center"
              justify="center"
              minH="160px"
            >
              <Lottie
                animationData={dashboard2}
                loop
                style={{ width: '100%', height: '200px' }}
              />
            </Flex>
          </GridItem>

          <GridItem>
            <Flex
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="md"
              align="center"
              justify="center"
              minH="160px"
            >
              <Lottie
                animationData={dashboard3}
                loop
                style={{ width: '100%', height: '200px' }}
              />
            </Flex>
          </GridItem>

          {/* Terceira Linha - 2 colunas */}
          <GridItem>
            <Flex
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="md"
              align="center"
              justify="center"
              minH="160px"
            >
              <Lottie
                animationData={dashboard4}
                loop
                style={{ width: '95%', height: '220px' }}
              />
            </Flex>
          </GridItem>

          <GridItem>
            <Flex
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="md"
              align="center"
              justify="center"
              minH="160px"
            >
              <Lottie
                animationData={dashboard5}
                loop
                style={{ width: '95%', height: '220px' }}
              />
            </Flex>
          </GridItem>
        </Grid>
      )}
    </Flex>
  );
}

export default DashboardAnimado;
