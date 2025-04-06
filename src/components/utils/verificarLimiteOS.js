// utils/usarVerificacaoLimiteOS.js
import { apiGet } from '../../services/api'

export function usarVerificacaoLimiteOS(navigateOrOnLimite, onLimiteOrNada, somenteVerificar = false) {
  return async () => {
    try {
      const UnicID_Empresa = localStorage.getItem('UnicID')
      const agora = new Date()
      const mesAtual = agora.toISOString().slice(0, 7)

      // 🟦 BUSCAR DADOS ATUALIZADOS DA EMPRESA
      const resEmpresa = await apiGet('/api/v2/tables/mga2sghx95o3ssp/records')
      const empresaInfo = resEmpresa.list.find(emp => emp.UnicID === UnicID_Empresa)
      const limitePermitido = parseInt(empresaInfo?.Limite_de_Ordem || '0', 10)

      // 🟦 BUSCAR ORDENS DE SERVIÇO
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records')
      const registro = res.list.find(item => {
        const raw = item['Ordem de Serviços']
        const json = typeof raw === 'string' ? JSON.parse(raw) : raw
        return json?.empresas?.some(emp => emp.UnicID_Empresa === UnicID_Empresa)
      })

      if (!registro) return somenteVerificar ? navigateOrOnLimite(true) : onLimiteOrNada()

      const json = typeof registro['Ordem de Serviços'] === 'string'
        ? JSON.parse(registro['Ordem de Serviços'])
        : registro['Ordem de Serviços']

      const empresa = json.empresas.find(emp => emp.UnicID_Empresa === UnicID_Empresa)
      if (!empresa) return somenteVerificar ? navigateOrOnLimite(true) : onLimiteOrNada()

      const ordensDoMes = (empresa.Ordens_de_Servico || []).filter(ordem => {
        if (!ordem.Data_Envio_OS) return false
        const data = new Date(ordem.Data_Envio_OS)
        const mesmoMes = data.toISOString().slice(0, 7) === mesAtual
        return mesmoMes
      })

      const atingiuLimite = limitePermitido === 0 || ordensDoMes.length >= limitePermitido
      console.log('[DEBUG] Limite:', limitePermitido)
      console.log('[DEBUG] Total de ordens no mês:', ordensDoMes.length)
      console.log('[DEBUG] Atingiu Limite?', atingiuLimite)

      if (somenteVerificar) {
        navigateOrOnLimite(atingiuLimite)
      } else {
        if (atingiuLimite) {
          onLimiteOrNada()
        } else {
          navigateOrOnLimite('/empresa/abrir-ordem')
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