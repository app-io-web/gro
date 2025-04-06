import React, { useEffect, useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { apiGet } from '../../src/services/api';

const NotificacoesAlert = () => {
  const [notificacoesCount, setNotificacoesCount] = useState(0);
  const [notificacaoExibida, setNotificacaoExibida] = useState(false); 

  const fetchNotificacoesCount = async () => {
    try {
      const res = await apiGet('/api/v2/tables/mtnh21kq153to8h/records');  
      if (res?.list) {
        let count = 0;
        let ultimaOrdemID = null;  

        res.list.forEach(registro => {
          const raw = registro['Ordem de Serviços'];
          const json = typeof raw === 'string' ? JSON.parse(raw) : raw;

          json.empresas.forEach(emp => {
            emp.Ordens_de_Servico?.forEach(ordem => {
              const statusOS = ordem.Status_OS?.toLowerCase();
              if (statusOS === 'agendada' || statusOS === 'reagendada') {
                count++;
                
                // Armazenando o ID da ordem
                if (!ultimaOrdemID) {
                  ultimaOrdemID = ordem.UnicID_OS;
                }
              }
            });
          });
        });

        setNotificacoesCount(count);
        console.log('Contagem de notificações:', count);

        const ultimaNotificacaoSalva = localStorage.getItem('ultimoUnicID');
        console.log('Última ordem salva no localStorage:', ultimaNotificacaoSalva);  // Verificando o que está no localStorage
        
        // Exibe a notificação apenas uma vez, mesmo se várias ordens forem encontradas
        if (count > 0 && !notificacaoExibida && ultimaNotificacaoSalva !== ultimaOrdemID) {
          toast.info(`Você tem ${count} novas ordens agendadas ou reagendadas.`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeButton: false,
            onClose: () => {
              setNotificacaoExibida(true);
              console.log('Toast fechado. ID da última ordem:', ultimaOrdemID);
              localStorage.setItem('ultimoUnicID', ultimaOrdemID);  // Salva o ID da última ordem no localStorage
            }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  useEffect(() => {
    fetchNotificacoesCount();  
    const interval = setInterval(() => {
      fetchNotificacoesCount();  
    }, 10000); 

    return () => clearInterval(interval);
  }, [notificacaoExibida]); 

  return <ToastContainer />;
};

export default NotificacoesAlert;
