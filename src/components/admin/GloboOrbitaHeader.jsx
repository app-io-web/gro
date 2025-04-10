import { Box, keyframes } from '@chakra-ui/react'

export default function GloboOrbitaHeader() {
  const clockwiseZ = keyframes`
    0%, 100% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg) skew(-10deg, -5deg); }
  `
  const anticlockwiseZ = keyframes`
    0%, 100% { transform: rotateX(0deg); }
    50% { transform: rotateX(-180deg) skew(10deg, 5deg); }
  `

  return (
    <Box
      position="relative"
      w="32px"
      h="32px"
      minW="32px"
      minH="32px"
      border="3px solid transparent"
      borderRadius="full"
    >
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
          animation: `${clockwiseZ} 2.5s infinite`,
        }}
        _after={{
          content: `''`,
          border: '2px solid #505065',
          borderRadius: 'full',
          w: 'full',
          h: 'full',
          position: 'absolute',
          opacity: 1,
          animation: `${clockwiseZ} 2.5s infinite`,
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
          animation: `${anticlockwiseZ} 2.5s infinite`,
        }}
        _after={{
          content: `''`,
          border: '2px solid #505065',
          borderRadius: 'full',
          w: 'full',
          h: 'full',
          position: 'absolute',
          opacity: 1,
          animation: `${anticlockwiseZ} 2.5s infinite`,
        }}
      />
    </Box>
  )
}
