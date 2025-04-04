import { Box, Heading, Text, Input, Checkbox, Flex } from '@chakra-ui/react'

function MateriaisStep({ materiais, setMateriais }) {

  const handleChange = (field, value) => {
    setMateriais(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCheckbox = (field, checked, isText = false) => {
    if (checked) {
      setMateriais(prev => ({
        ...prev,
        [field]: isText ? '' : 0  // Se for texto, começa vazio
      }))
    } else {
      const newMateriais = { ...materiais }
      delete newMateriais[field]
      setMateriais(newMateriais)
    }
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Materiais Utilizados</Heading>

      <Text mb={2}>Metragem de Drop (metros):</Text>
      <Input
        type="number"
        placeholder="Ex: 30"
        value={materiais.Drop_Metros || ''}
        onChange={e => handleChange('Drop_Metros', Number(e.target.value))}
        mb={4}
      />

      <Text mb={2}>Quantidade de Esticadores:</Text>
      <Input
        type="number"
        placeholder="Ex: 2"
        value={materiais.Esticadores || ''}
        onChange={e => handleChange('Esticadores', Number(e.target.value))}
        mb={4}
      />

      <Flex direction="column" gap={3}>
        {/* Conectores */}
        <Checkbox
          isChecked={materiais.Conectores !== undefined}
          onChange={e => handleCheckbox('Conectores', e.target.checked)}
        >
          Adicionar Conectores
        </Checkbox>

        {materiais.Conectores !== undefined && (
          <Input
            type="number"
            placeholder="Quantidade de Conectores"
            value={materiais.Conectores}
            onChange={e => handleChange('Conectores', Number(e.target.value))}
          />
        )}

        {/* Fixa Fio */}
        <Checkbox
          isChecked={materiais.FixaFio !== undefined}
          onChange={e => handleCheckbox('FixaFio', e.target.checked)}
        >
          Adicionar Fixa Fio
        </Checkbox>

        {materiais.FixaFio !== undefined && (
          <Input
            type="number"
            placeholder="Quantidade de Fixa Fio"
            value={materiais.FixaFio}
            onChange={e => handleChange('FixaFio', Number(e.target.value))}
          />
        )}

        {/* Outros */}
        <Checkbox
          isChecked={materiais.Outros !== undefined}
          onChange={e => handleCheckbox('Outros', e.target.checked, true)}
        >
          Adicionar Outros Materiais
        </Checkbox>

        {materiais.Outros !== undefined && (
          <Input
            placeholder="Descreva os outros materiais utilizados"
            value={materiais.Outros}
            onChange={e => handleChange('Outros', e.target.value)}
          />
        )}
      </Flex>
    </Box>
  )
}

export default MateriaisStep;
