export const corrigirHorario = (dataString) => {
    if (!dataString) return null;
    
    const partes = dataString.split(' ');
  
    // Se tiver dois pedaços (data + hora separada), junta eles
    if (partes.length === 2 && !partes[0].includes('T')) {
      return `${partes[0]}T${partes[1]}:00.000Z`;
    }
  
    // Se já tiver 'T', tenta retornar o primeiro pedaço certo
    return partes[0];
  };
  