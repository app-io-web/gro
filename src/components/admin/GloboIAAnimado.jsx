import { Box, keyframes } from '@chakra-ui/react'

export default function GloboIAAnimado({ pensando }) {
  const clockwiseZ = keyframes`
    0%, 100% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg) skew(-10deg, -5deg); }
  `
  const anticlockwiseZ = keyframes`
    0%, 100% { transform: rotateX(0deg); }
    50% { transform: rotateX(-180deg) skew(10deg, 5deg); }
  `
  const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.1); opacity: 1; }
  `

  return (
    <Box
      position="relative"
      w="28px"
      h="28px"
      minW="28px"
      minH="28px"
      borderRadius="full"
      overflow="hidden"
      border="2px solid #505065"
      animation={!pensando ? `${pulse} 2.5s ease-in-out infinite` : undefined}
    >
      {pensando && (
        <>
          {/* Primeira órbita */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="full"
            h="full"
            _before={{
              content: `''`,
              border: '2px solid #505065',
              borderRadius: 'full',
              w: 'full',
              h: 'full',
              position: 'absolute',
              opacity: 1,
              animation: `${clockwiseZ} 2.5s infinite linear`,
            }}
            _after={{
              content: `''`,
              border: '2px solid #505065',
              borderRadius: 'full',
              w: 'full',
              h: 'full',
              position: 'absolute',
              opacity: 1,
              animation: `${clockwiseZ} 2.5s infinite linear`,
            }}
          />

          {/* Segunda órbita */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="full"
            h="full"
            _before={{
              content: `''`,
              border: '2px solid #505065',
              borderRadius: 'full',
              w: 'full',
              h: 'full',
              position: 'absolute',
              opacity: 1,
              animation: `${anticlockwiseZ} 2.5s infinite linear`,
            }}
            _after={{
              content: `''`,
              border: '2px solid #505065',
              borderRadius: 'full',
              w: 'full',
              h: 'full',
              position: 'absolute',
              opacity: 1,
              animation: `${anticlockwiseZ} 2.5s infinite linear`,
            }}
          />
        </>
      )}
    </Box>
  )
}
