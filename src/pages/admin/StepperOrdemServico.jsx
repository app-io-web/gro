import {
  Box, Flex, Text, Icon, useColorModeValue, Tooltip, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon, useBreakpointValue, Badge
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { FaCircle } from 'react-icons/fa'

const MotionBox = motion(Box)

const statusColors = {
  complete: 'green.500',
  active: 'blue.500',
  pending: 'gray.400'
}

export default function StepperOrdemServico({ steps, activeStep, onStepClick }) {
  const lineColor = useColorModeValue('gray.300', 'gray.600')
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (isMobile) {
    // 📱 MOBILE - vertical acordeon
    return (
      <Accordion allowToggle mt={4}>
        {steps.map((step, index) => {
          const status = index < activeStep ? 'complete' : index === activeStep ? 'active' : 'pending'
          const color = statusColors[status]

          return (
            <AccordionItem key={index} border="none">
              <AccordionButton onClick={() => onStepClick(index)}>
                <Box flex="1" textAlign="left" display="flex" alignItems="center" gap={2}>
                  <Icon
                    as={status === 'complete' ? CheckCircleIcon : FaCircle}
                    color={color}
                    boxSize={4}
                  />
                  <Text fontWeight="semibold" color={color}>{step.label}</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} fontSize="sm" color="gray.600">
                Clique no passo para ver detalhes.
              </AccordionPanel>
            </AccordionItem>
          )
        })}
      </Accordion>
    )
  }

  // 💻 DESKTOP - horizontal
  return (
    <Flex direction="column" w="full" maxW="container.lg" mx="auto" mt={6}>
      <Flex justify="space-between" align="center" position="relative">
        {steps.map((step, index) => {
          const status = index < activeStep ? 'complete' : index === activeStep ? 'active' : 'pending'
          const color = statusColors[status]
          const isLast = index === steps.length - 1

          return (
            <Flex key={index} flexDir="column" align="center" flex={1} position="relative">
              <Tooltip label={step.tooltip || ''} hasArrow placement="top">
                <MotionBox
                  onClick={() => index <= activeStep && onStepClick(index)}
                  cursor={index <= activeStep ? 'pointer' : 'default'}
                  bg={color}
                  color="white"
                  rounded="full"
                  w="40px"
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  zIndex={1}
                >
                  {status === 'complete' ? (
                    <CheckCircleIcon boxSize={5} />
                  ) : (
                    <Icon as={FaCircle} boxSize={3} />
                  )}
                </MotionBox>
              </Tooltip>
              <Text mt={2} fontSize="sm" fontWeight="medium" color={color}>{step.label}</Text>

              {!isLast && (
                <Box
                  position="absolute"
                  top="20px"
                  left="50%"
                  transform="translateX(50%)"
                  h="2px"
                  w="full"
                  bg={lineColor}
                  zIndex={0}
                />
              )}
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}
