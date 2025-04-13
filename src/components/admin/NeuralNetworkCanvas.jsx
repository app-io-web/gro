import { useEffect, useRef, useState } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';


export default function NeuralNetworkCanvas({ ativo }) {
  const canvasRef = useRef(null);
  const [pontos, setPontos] = useState([]);
  const [coresPontos, setCoresPontos] = useState([]);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Cria pontos iniciais
  useEffect(() => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;




    const criarPontos = () => Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
    }));

    setPontos(criarPontos());
  }, []);

  // Atualiza a cor das bolinhas de forma aleatória se API estiver parada
  useEffect(() => {
    if (!ativo) {
      const interval = setInterval(() => {
        setCoresPontos(
          Array.from({ length: 30 }, () => (Math.random() > 0.7 ? '#e61b00' : '#00a621'))
        );
      }, 900); // muda a cada 800ms

      return () => clearInterval(interval);
    } else {
      // Se voltar ativo, tudo verde
      setCoresPontos(Array(30).fill('#00a621'));
    }
  }, [ativo]);

  // Faz a animação
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    function desenhar() {
      ctx.clearRect(0, 0, width, height);

      // Desenha linhas entre pontos
      for (let i = 0; i < pontos.length; i++) {
        for (let j = i + 1; j < pontos.length; j++) {
          const dx = pontos[i].x - pontos[j].x;
          const dy = pontos[i].y - pontos[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.strokeStyle = '#080808'; // linhas sempre pretas
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pontos[i].x, pontos[i].y);
            ctx.lineTo(pontos[j].x, pontos[j].y);
            ctx.stroke();
          }
        }
      }

      // Desenha bolinhas com cores dinâmicas
      pontos.forEach((ponto, idx) => {
        ctx.beginPath();
        ctx.arc(ponto.x, ponto.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#070730';
        ctx.fill();
        ctx.strokeStyle = coresPontos[idx] || '#00a621'; // fallback verde se ainda não tiver cor
        ctx.stroke();
      });

      requestAnimationFrame(desenhar);
    }

    desenhar();
  }, [pontos, coresPontos]);

  // Atualiza os pontos se API estiver ativa/parada
  useEffect(() => {
    const interval = setInterval(() => {
      setPontos(prev =>
        prev.map(ponto => {
          const speedMultiplier = ativo ? 1 : 0.2;
          const width = canvasRef.current.width;
          const height = canvasRef.current.height;

          let novoX = ponto.x + ponto.dx * speedMultiplier;
          let novoY = ponto.y + ponto.dy * speedMultiplier;

          if (novoX <= 0 || novoX >= width) ponto.dx *= -1;
          if (novoY <= 0 || novoY >= height) ponto.dy *= -1;

          return {
            ...ponto,
            x: Math.min(width, Math.max(0, novoX)),
            y: Math.min(height, Math.max(0, novoY)),
          };
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, [ativo]);

// Aqui muda dinamicamente:
if (isMobile) {
    return (
      <Box
        w={{ base: '100%', md: '450px' }}
        h={{ base: '200px', md: '150px' }}
        display="flex"
        justifyContent="center"
        alignItems="center"
        mx="auto"
        mb={6}
        bg="white"
        borderRadius="xl"
        boxShadow="md"
        p={2}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
          }}
        />
      </Box>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={450}
      height={150}
      style={{ borderRadius: '12px' }}
    />
  );
}