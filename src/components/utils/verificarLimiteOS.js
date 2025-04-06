import { apiGet } from '../../services/api';



export function usarVerificacaoLimiteOS(navigateOrOnLimite, onLimiteOrNada, somenteVerificar = false) {
  return async () => {
    try {
      const UnicID_Empresa = localStorage.getItem('UnicID')
      const agora = new Date()
      const mesAtual = agora.toISOString().slice(0, 7)

      // 🟦 BUSCAR DADOS ATUALIZADOS DA EMPRESA
      const resEmpresa = await apiGet('/api/v2/tables/mga2sghx95o3ssp/records')
      console.log('[DEBUG] Resposta da empresa:', resEmpresa); // Log da resposta da API
      const empresaInfo = resEmpresa.list.find(emp => emp.UnicID === UnicID_Empresa)
      
      // Verifica se a empresa foi encontrada
      if (!empresaInfo) {
        console.error('[DEBUG] Empresa não encontrada:', UnicID_Empresa);
        return somenteVerificar ? navigateOrOnLimite(true) : onLimiteOrNada()
      }
      
      const limitePermitido = parseInt(empresaInfo?.Limite_de_Ordem || '0', 10)
      console.log('[DEBUG] Limite permitido:', limitePermitido); // Log do limite de ordem

      // 🟦 BUSCAR ORDENS DE SERVIÇO
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      console.log('[DEBUG] Resposta das ordens de serviço:', res); // Log da resposta das ordens
      const registro = res.list.find(item => {
        const raw = item['Ordem de Serviços'];
        const json = typeof raw === 'string' ? JSON.parse(raw) : raw;
      
        // Verifique se o UnicID_Empresa existe dentro das ordens de serviço
        return json?.empresas?.some(emp => emp.UnicID_Empresa === UnicID_Empresa);
      });
      
      if (!registro) {
        console.log('[DEBUG] Registro não encontrado para a empresa:', UnicID_Empresa);
        return somenteVerificar ? navigateOrOnLimite(true) : onLimiteOrNada();
      }
      
      const json = typeof registro['Ordem de Serviços'] === 'string'
        ? JSON.parse(registro['Ordem de Serviços'])
        : registro['Ordem de Serviços']

      const empresa = json.empresas.find(emp => emp.UnicID_Empresa === UnicID_Empresa)
      if (!empresa) {
        console.log('[DEBUG] Empresa não encontrada no registro de ordens');
        return somenteVerificar ? navigateOrOnLimite(true) : onLimiteOrNada()
      }

      const ordensDoMes = (empresa.Ordens_de_Servico || []).filter(ordem => {
        if (!ordem.Data_Envio_OS) return false
        const data = new Date(ordem.Data_Envio_OS)
        const mesmoMes = data.toISOString().slice(0, 7) === mesAtual
        return mesmoMes
      })

      const atingiuLimite = limitePermitido === 0 || ordensDoMes.length >= limitePermitido;
      console.log('[DEBUG] Limite:', limitePermitido);
      console.log('[DEBUG] Total de ordens no mês:', ordensDoMes.length);
      console.log('[DEBUG] Atingiu Limite?', atingiuLimite);
      
      // Alteração no fluxo
      if (somenteVerificar) {
        navigateOrOnLimite(atingiuLimite); // Se atingiu o limite, navega ou realiza ação
      } else {
        if (atingiuLimite) {
          onLimiteOrNada();  // Caso o limite tenha sido atingido, avisa o usuário
        } else {
          navigateOrOnLimite('/empresa/abrir-ordem'); // Libera para abrir nova ordem
        }
      }
      
    } catch (err) {
      console.error('Erro ao verificar limite de O.S:', err)
      if (somenteVerificar) {
        navigateOrOnLimite(true)
      } else {
        onLimiteOrNada()
      }
    }
  }
}
