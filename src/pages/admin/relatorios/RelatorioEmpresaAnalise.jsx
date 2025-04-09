import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Box, Heading, Text, VStack, Button, Badge, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, } from '@chakra-ui/react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useBreakpointValue } from '@chakra-ui/react'
import { Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { keyframes } from '@emotion/react'; // Para definir a animação



import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import 'jspdf-autotable'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'




import AdminSidebarDesktop from '../../../components/admin/AdminSidebarDesktop'
import AdminBottomNav from '../../../components/admin/AdminBottomNav'
import AdminMobileMenu from '../../../components/admin/AdminMobileMenu'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50']

const thStyleDesktop = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
    fontWeight: "bold",
}

const tdStyleDesktop = {
    border: "1px solid #ddd",
    padding: "8px",
}

// Definindo a animação de brilho
const shineEffect = keyframes`
  0% {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0f0, 0 0 20px #0f0, 0 0 25px #0f0, 0 0 30px #0f0, 0 0 35px #0f0;
  }
  50% {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0f0, 0 0 20px #0f0, 0 0 25px #0f0, 0 0 30px #0f0, 0 0 40px #0f0;
  }
  100% {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0f0, 0 0 20px #0f0, 0 0 25px #0f0, 0 0 30px #0f0, 0 0 35px #0f0;
  }
`;

function RelatorioEmpresaAnalise() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const [ordenacao, setOrdenacao] = useState({ coluna: null, asc: true })
    const isMobile = useBreakpointValue({ base: true, md: false })
    const [ordensSelecionadas, setOrdensSelecionadas] = useState([])
    const [analysisMessages, setAnalysisMessages] = useState({});  // Estado para armazenar as mensagens de análise de cada ordem
    const [reportSummary, setReportSummary] = useState("")  // Armazenar o resumo gerado




    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        if (isMobile) {
            onOpen()
        }
    }, [isMobile, onOpen])

    if (!state?.analise) {
        return (
            <Box p={6}>
                <Text>Nenhuma análise encontrada.</Text>
                <Button mb={6} onClick={() => navigate(-1)} colorScheme="blue" borderRadius="full" size="sm">Voltar</Button>
            </Box>
        )
    }

    function marcarStatus(status) {
        const idsStatus = ordensOrdenadas
          .map((ordem, idx) => ({ ordem, idx }))
          .filter(({ ordem }) => ordem.Status_OS === status)
          .map(({ idx }) => idx);
    
        setOrdensSelecionadas(idsStatus);
      }


    const { improdutivas, canceladas, instalacoes, trocasEndereco, rompimentos, manutencoes, materiais, materiaisFaltando, ordens } = state.analise

    const ordemMaisDrop = ordens?.reduce((maior, atual) => (atual.Materiais_Utilizados?.Drop_Metros || 0) > (maior?.Materiais_Utilizados?.Drop_Metros || 0) ? atual : maior, {}) || null
    const ordemMaisConectores = ordens?.reduce((maior, atual) => (atual.Materiais_Utilizados?.Conectores || 0) > (maior?.Materiais_Utilizados?.Conectores || 0) ? atual : maior, {}) || null

    const ordenarOrdens = (coluna) => {
        if (ordenacao.coluna === coluna) {
            setOrdenacao({ coluna, asc: !ordenacao.asc })
        } else {
            setOrdenacao({ coluna: coluna, asc: true })
        }
    }

    const ordensOrdenadas = [...(ordens || [])].sort((a, b) => {
        if (!ordenacao.coluna) return 0
        const valorA = a.Materiais_Utilizados?.[ordenacao.coluna] || 0
        const valorB = b.Materiais_Utilizados?.[ordenacao.coluna] || 0
        return ordenacao.asc ? valorA - valorB : valorB - valorA
    })


    const handleAnalyze = async (ordem) => {
        try {
          const response = await fetch('https://inte.groia.nexusnerds.com.br/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ordem),
          })
          const data = await response.json()
          const analysisMessage = data.analysisMessage
          setAnalysisMessages(prevMessages => ({
            ...prevMessages,
            [ordem.UnicID_OS]: analysisMessage,
          }))
        } catch (error) {
          console.error('Erro ao chamar o backend:', error)
        }
      }
    
      // Função para gerar o resumo de todas as ordens de serviço
      const handleGenerateReport = async () => {
        const reportData = {
          ordens: ordens, // Envia todas as ordens
          resumo: {
            improdutivas,
            canceladas,
            instalacoes,
            trocasEndereco,
            rompimentos,
            manutencoes,
          },
          materiais,
        };
      
        try {
          const response = await fetch('https://inte.groia.nexusnerds.com.br/generate-summary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData), // Envia dados para gerar o resumo
          });
      
          const data = await response.json();
          setReportSummary(data.summaryMessage); // Exibe o resumo gerado
        } catch (error) {
          console.error('Erro ao gerar o resumo:', error);
        }
      };
      
      function handleExportExcel() {
        const resumoDados = [
            ["Improdutivas", improdutivas],
            ["Canceladas", canceladas],
            ["Instalações", instalacoes],
            ["Trocas de Endereço", trocasEndereco],
            ["Rompimentos", rompimentos],
            ["Manutenções", manutencoes]
        ];
    
        const materiaisDados = [
            ["Drop em Metros", `${materiais.Drop_Metros} metros`],
            ["Alçadores", materiais.Esticadores],
            ["Conectores", materiais.Conectores],
            ["Fixa Fio", materiais.FixaFio]
        ];
    
        const destaquesDados = [];
        if (ordemMaisDrop?.Nome_Cliente) {
            destaquesDados.push(["Ordem com mais Drop", ordemMaisDrop.Nome_Cliente, `Quantidade: ${ordemMaisDrop.Materiais_Utilizados?.Drop_Metros || 0} metros`]);
        }
        if (ordemMaisConectores?.Nome_Cliente) {
            destaquesDados.push(["Ordem com mais Conectores", ordemMaisConectores.Nome_Cliente, `Quantidade: ${ordemMaisConectores.Materiais_Utilizados?.Conectores || 0}`]);
        }
    
        const ordensPorTecnico = Object.entries(
            ordens.reduce((acc, ordem) => {
                const tecnico = ordem.Tecnico_Responsavel || 'Não informado';
                acc[tecnico] = (acc[tecnico] || 0) + 1;
                return acc;
            }, {})
        ).map(([tecnico, total]) => [tecnico, total]);
    
        const ordensDetalhadas = ordensOrdenadas.map(ordem => ({
            Cliente: ordem.Nome_Cliente || '-',
            Tecnico: ordem.Tecnico_Responsavel || '-',
            Tipo: ordem.Tipo_OS || '-',
            Conectores: ordem.Materiais_Utilizados?.Conectores || 0,
            Drop: ordem.Materiais_Utilizados?.Drop_Metros || 0,
            Alçadores: ordem.Materiais_Utilizados?.Esticadores || 0,
            FixaFio: ordem.Materiais_Utilizados?.FixaFio || 0,
            Status: ordem.Status_OS || '-',
        }));
    
        const wb = XLSX.utils.book_new();
    
        // Resumo
        const resumoWs = XLSX.utils.aoa_to_sheet([["Resumo de Ordens"], ...resumoDados]);
        XLSX.utils.book_append_sheet(wb, resumoWs, "Resumo");
    
        // Materiais
        const materiaisWs = XLSX.utils.aoa_to_sheet([["Materiais Utilizados"], ...materiaisDados]);
        XLSX.utils.book_append_sheet(wb, materiaisWs, "Materiais");
    
        // Destaques
        const destaquesWs = XLSX.utils.aoa_to_sheet([["Destaques"], ...destaquesDados]);
        XLSX.utils.book_append_sheet(wb, destaquesWs, "Destaques");
    
        // Ordens por Técnico
        const ordensTecnicoWs = XLSX.utils.aoa_to_sheet([["Ordens por Técnico"], ...ordensPorTecnico]);
        XLSX.utils.book_append_sheet(wb, ordensTecnicoWs, "Ordens por Técnico");
    
        // Tabela de Ordens
        const ordensWs = XLSX.utils.json_to_sheet(ordensDetalhadas);
        XLSX.utils.book_append_sheet(wb, ordensWs, "Ordens");
    
        // Ajuste de largura das colunas para cada aba
        wb.SheetNames.forEach(sheetName => {
            const ws = wb.Sheets[sheetName];
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let col = range.s.c; col <= range.e.c; col++) {
                let maxWidth = 10;
                for (let row = range.s.r; row <= range.e.r; row++) {
                    const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
                    if (cell && cell.v) {
                        const cellValue = cell.v.toString();
                        maxWidth = Math.max(maxWidth, cellValue.length);
                    }
                }
                const colLetter = XLSX.utils.encode_col(col);
                ws['!cols'] = ws['!cols'] || [];
                ws['!cols'][col] = { wch: maxWidth };
            }
        });
    
        // Baixar o arquivo
        XLSX.writeFile(wb, 'Relatorio_Analise.xlsx');
    }
    

    function handleExportPDF() {
        const doc = new jsPDF()
    
        // Título principal
        doc.setFont("helvetica")
        doc.setFontSize(22)
        doc.text('Relatório de Análise Automática', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' })
    
        let y = 30
    
        const writeSection = (title, lines) => {
            doc.setFontSize(16)
            doc.text(title, 14, y)
            y += 8
    
            doc.setFontSize(12)
            lines.forEach(line => {
                doc.text(line, 18, y)
                y += 6
            })
    
            y += 6
        }
    
        // Resumo
        writeSection('Resumo de Ordens', [
            `Improdutivas: ${improdutivas}`,
            `Canceladas: ${canceladas}`,
            `Instalações: ${instalacoes}`,
            `Trocas de Endereço: ${trocasEndereco}`,
            `Rompimentos: ${rompimentos}`,
            `Manutenções: ${manutencoes}`
        ])
    
        // Materiais
        writeSection('Materiais Utilizados', [
            `Drop em Metros: ${materiais.Drop_Metros} metros`,
            `Alçadores: ${materiais.Esticadores}`,
            `Conectores: ${materiais.Conectores}`,
            `Fixa Fio: ${materiais.FixaFio}`
        ])
    
        if (materiaisFaltando.length > 0) {
            writeSection('Materiais não utilizados', materiaisFaltando.map(mat => `- ${mat.toUpperCase()}`))
        }
    
        // Destaques
        const destaques = []
        if (ordemMaisDrop?.Nome_Cliente) {
            destaques.push(`Ordem com mais Drop: ${ordemMaisDrop.Nome_Cliente}`)
            destaques.push(`Quantidade: ${ordemMaisDrop.Materiais_Utilizados?.Drop_Metros || 0} metros`)
        }
        if (ordemMaisConectores?.Nome_Cliente) {
            destaques.push(`Ordem com mais Conectores: ${ordemMaisConectores.Nome_Cliente}`)
            destaques.push(`Quantidade: ${ordemMaisConectores.Materiais_Utilizados?.Conectores || 0}`)
        }
        if (destaques.length > 0) {
            writeSection('Destaques', destaques)
        }
    
        // Ordens por técnico
        const ordensPorTecnico = Object.entries(
            ordens.reduce((acc, ordem) => {
                const tecnico = ordem.Tecnico_Responsavel || 'Não informado'
                acc[tecnico] = (acc[tecnico] || 0) + 1
                return acc
            }, {})
        ).map(([tecnico, total]) => `${tecnico}: ${total} ordens`)
    
        writeSection('Ordens por Técnico', ordensPorTecnico)
    
        // Nova página: Tabela de ordens
        doc.addPage()
        doc.setFontSize(18)
        doc.text('Tabela de Ordens', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' })
    
        const tableColumn = ["Cliente", "Técnico", "Tipo", "Conectores", "Drop", "Alçadores", "FixaFio", "Status"]
        const tableRows = ordensOrdenadas.map(ordem => [
            ordem.Nome_Cliente || '-',
            ordem.Tecnico_Responsavel || '-',
            ordem.Tipo_OS || '-',
            ordem.Materiais_Utilizados?.Conectores || 0,
            ordem.Materiais_Utilizados?.Drop_Metros || 0,
            ordem.Materiais_Utilizados?.Esticadores || 0,
            ordem.Materiais_Utilizados?.FixaFio || 0,
            ordem.Status_OS || '-'
        ])
    
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            styles: {
                fontSize: 10,
                cellPadding: 3,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [52, 152, 219],
                textColor: 255,
                halign: 'center',
            },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            bodyStyles: { textColor: 50 },
        })
    
        doc.save('Relatorio_Analise.pdf')
    }
    












    // Se for mobile, bloqueia o conteúdo
    if (isMobile) {
        return (
            <>
                <Modal isOpen={isOpen} onClose={onClose} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Acesso Restrito</ModalHeader>
                        <ModalBody>
                            <Text>Esta análise só pode ser visualizada em um computador. Por favor, acesse pelo desktop.</Text>
                        </ModalBody>
                        <ModalFooter>
                            <Button colorScheme="blue" onClick={() => navigate('/admin/relatorio-dasboard')}>Ok</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </>
        )
    }




    return (
        <Box display="flex">
            <AdminSidebarDesktop />

            <Box flex="1" p={6} ml={{ md: '250px' }}>
                <Button mb={6} onClick={() => navigate(-1)} colorScheme="blue" borderRadius="full" size="sm">Voltar</Button>

                <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="lg">📋 Análise Automática</Heading>

                    <Flex gap={2}>
                    <Button
                        colorScheme="green"
                        size="sm"
                        borderRadius="full"
                        onClick={handleGenerateReport}
                        _hover={{
                            bg: "green.400",  // Cor ao passar o mouse
                            animation: `${shineEffect} 1.5s infinite`,  // Aplica o brilho com animação
                        }}
                        _focus={{
                            boxShadow: "0 0 10px 5px rgba(0, 255, 0, 0.8)",  // Brilho mais forte ao focar
                            outline: "none",  // Remove o contorno padrão do foco
                        }}
                        >
                        📝 Gerar Resumo IA
                        </Button>

                        <Button colorScheme="green" size="sm" borderRadius="full" onClick={handleExportExcel}>
                            📄 Exportar Excel
                        </Button>
                        <Button colorScheme="red" size="sm" borderRadius="full" onClick={handleExportPDF}>
                            🖨️ Exportar PDF
                        </Button>
                    </Flex>
                </Flex>


                <VStack spacing={6} align="stretch">

                    {/* Resumo */}
                    <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="md">
                        <Heading size="md" mb={4}>Resumo de Ordens</Heading>
                        <Flex wrap="wrap" gap={4}>
                            <Text><b>📦 Improdutivas:</b> {improdutivas}</Text>
                            <Text><b>❌ Canceladas:</b> {canceladas}</Text>
                            <Text><b>🏠 Instalações:</b> {instalacoes}</Text>
                            <Text><b>🔄 Trocas de Endereço:</b> {trocasEndereco}</Text>
                            <Text><b>⚡ Rompimentos:</b> {rompimentos}</Text>
                            <Text><b>🛠️ Manutenções:</b> {manutencoes}</Text>
                        </Flex>
                    </Box>


                    {reportSummary && (
                        <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="md">
                            <Heading size="md" mb={4}>Resumo Gerado</Heading>
                            <Text>{reportSummary}</Text>
                        </Box>
                        )}


                    {/* Materiais Utilizados */}
                    <Box p={6} borderWidth="1px" borderRadius="md" boxShadow="md">
                        <Heading size="md" mb={4}>Materiais Utilizados</Heading>
                        <Flex wrap="wrap" gap={4}>
                            <Text><b>🎯 Drop em Metros:</b> {materiais.Drop_Metros} metros</Text>
                            <Text><b>🛠️ Alçadores:</b> {materiais.Esticadores}</Text>
                            <Text><b>🔗 Conectores:</b> {materiais.Conectores}</Text>
                            <Text><b>📎 Fixa Fio:</b> {materiais.FixaFio}</Text>
                        </Flex>
                    </Box>

                    {/* Gráficos */}
                    <Flex direction={{ md: 'row' }} gap={8}>
                        <Box flex="1" h="300px" id="grafico-materiais"> {/* ID adicionado aqui */}
                            <Heading size="sm" mb={2}>📊 Gráfico de Materiais</Heading>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ material: 'Drop', quantidade: materiais.Drop_Metros }, { material: 'Alçadores', quantidade: materiais.Esticadores }, { material: 'Conectores', quantidade: materiais.Conectores }, { material: 'Fixa Fio', quantidade: materiais.FixaFio }]}>
                                    <XAxis dataKey="material" />
                                    <YAxis />
                                    <Tooltip formatter={(value, name, props) => props.payload.material === 'Drop' ? [`${value} metros`, 'Drop'] : [value, name]} />
                                    <Bar dataKey="quantidade" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>

                        <Box flex="1" h="300px" id="grafico-distribuicao"> {/* ID adicionado aqui */}
                            <Heading size="sm" mb={2}>🥧 Distribuição de Ordens</Heading>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={[{ name: 'Improdutivas', value: improdutivas }, { name: 'Canceladas', value: canceladas }, { name: 'Instalações', value: instalacoes }, { name: 'Trocas Endereço', value: trocasEndereco }, { name: 'Rompimentos', value: rompimentos }, { name: 'Manutenções', value: manutencoes }]} dataKey="value" nameKey="name" outerRadius={80} label>
                                        {COLORS.map((color, idx) => (<Cell key={idx} fill={color} />))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Flex>

                    {/* Materiais Faltando */}
                    {materiaisFaltando.length > 0 && (
                        <Box p={isMobile ? 4 : 6} bg="red.50" border="1px solid red" borderRadius={isMobile ? "xl" : "lg"}>
                            <Heading size="sm" mb={2}>🚨 Materiais não utilizados:</Heading>
                            {materiaisFaltando.map((material, idx) => (
                                <Badge key={idx} colorScheme="red" mr={2}>{material.toUpperCase()}</Badge>
                            ))}
                        </Box>
                    )}

                    {/* Destaques */}
                    <Box p={isMobile ? 4 : 6} borderWidth="1px" borderRadius={isMobile ? "xl" : "md"} boxShadow={isMobile ? "lg" : "md"}>
                        <Heading size="md" mb={4}>📈 Destaques</Heading>
                        {ordemMaisDrop?.Nome_Cliente && (<Box mb={4}><Text><b>🏆 Ordem com mais Drop:</b> {ordemMaisDrop.Nome_Cliente}</Text><Text><b>Quantidade:</b> {ordemMaisDrop.Materiais_Utilizados?.Drop_Metros || 0} metros</Text></Box>)}
                        {ordemMaisConectores?.Nome_Cliente && (<Box><Text><b>🏆 Ordem com mais Conectores:</b> {ordemMaisConectores.Nome_Cliente}</Text><Text><b>Quantidade:</b> {ordemMaisConectores.Materiais_Utilizados?.Conectores || 0}</Text></Box>)}
                    </Box>

                    {/* Ordens por Técnico */}
                    <Box p={isMobile ? 4 : 6} borderWidth="1px" borderRadius={isMobile ? "xl" : "md"} boxShadow={isMobile ? "lg" : "md"}>
                        <Heading size="md" mb={4}>📋 Ordens por Técnico</Heading>
                        {Object.entries(
                            ordens.reduce((acc, ordem) => {
                                const tecnico = ordem.Tecnico_Responsavel || 'Não informado'
                                acc[tecnico] = (acc[tecnico] || 0) + 1
                                return acc
                            }, {})
                        ).map(([tecnico, total], idx) => (
                            <Box key={idx} mb={2}>
                                <Text><b>👷 {tecnico}:</b> {total} ordens</Text>
                            </Box>
                        ))}
                    </Box>





                    <Accordion allowToggle>
                        {/* Acordeão para Canceladas */}
                        <AccordionItem>
              <AccordionButton _expanded={{ bg: "teal.200", color: "white" }}>
                <Box flex="1" textAlign="left" fontWeight="bold">
                  <Text>Ordens Canceladas</Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} bg="gray.50" borderRadius="md" p={4} mt={2}>
                {ordens.filter(ordem => ordem.Status_OS === 'Cancelado').map((ordem, idx) => (
                  <Box key={idx} bg="white" p={4} borderWidth="1px" borderRadius="md" boxShadow="md" mb={4}>
                    <Text><b>Cliente:</b> {ordem.Nome_Cliente || '-'}</Text>
                    <Text><b>Técnico Responsável:</b> {ordem.Tecnico_Responsavel || '-'}</Text>
                    <Text><b>Tipo de Cliente:</b> {ordem.TipoCliente || 'Tipo não informado'}</Text> {/* <-- NOVO */}
                    <Text><b>Tipo de Ordem:</b> {ordem.Tipo_OS || '-'}</Text>
                    <Text><b>Status:</b> {ordem.Status_OS || '-'}</Text>

                    {/* Exibindo a análise de cancelamento */}
                    {analysisMessages[ordem.UnicID_OS] && (
                      <Text mt={2} color="green.500" fontWeight="bold">
                        {analysisMessages[ordem.UnicID_OS]}
                      </Text>
                    )}

                    {/* Botão de análise */}
                    <Flex justify="flex-end" mt={2}>
                      <Button colorScheme="blue" size="sm" onClick={() => handleAnalyze(ordem)}>
                        Analisar Cancelamento
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </AccordionPanel>
            </AccordionItem>
                        {/* Acordeão para Improdutivas */}
                        <AccordionItem>
                            <AccordionButton
                            _expanded={{ bg: "orange.200", color: "white" }}  // Cor ao expandir
                            borderRadius="md"
                            _hover={{ bg: "orange.100" }}  // Cor ao passar o mouse
                            >
                            <Box flex="1" textAlign="left" fontWeight="bold">
                                <Text>Ordens Improdutivas</Text>
                            </Box>
                            <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4} bg="gray.50" borderRadius="md" p={4} mt={2}>
                            {ordensOrdenadas.filter(ordem => ordem.Status_OS === 'Improdutivo').map((ordem, idx) => (
                                <Box key={idx} bg="white" p={4} borderWidth="1px" borderRadius="md" boxShadow="md" mb={4}>
                                    <Text><b>Cliente:</b> {ordem.Nome_Cliente || '-'}</Text>
                                    <Text><b>Técnico Responsável:</b> {ordem.Tecnico_Responsavel || '-'}</Text>
                                    <Text><b>Tipo de Cliente:</b> {ordem.TipoCliente || 'Tipo não informado'}</Text> {/* <-- NOVO */}
                                    <Text><b>Tipo de Ordem:</b> {ordem.Tipo_OS || '-'}</Text>
                                    <Text><b>Status:</b> {ordem.Status_OS || '-'}</Text>

                                </Box>
                            ))}
                            </AccordionPanel>
                        </AccordionItem>
                        </Accordion>



                    {/* Planilha */}
                    <Box p={isMobile ? 4 : 6} borderWidth="1px" borderRadius={isMobile ? "xl" : "md"} boxShadow={isMobile ? "lg" : "md"}>

                    <Flex align="center" justify="space-between" mb={4}>
                        <Heading size="md">📄 Todas as Ordens</Heading>
                        
                        <Menu>
                            <MenuButton
                            as={Button}
                            colorScheme="red"
                            size="sm"
                            rightIcon={<ChevronDownIcon />}
                            borderRadius="full"
                            >
                            Marcar Status
                            </MenuButton>

                            <MenuList>
                            <MenuItem onClick={() => marcarStatus("Cancelado")}>❌ Cancelados</MenuItem>
                            <MenuItem onClick={() => marcarStatus("Finalizado")}>✅ Finalizados</MenuItem>
                            <MenuItem onClick={() => marcarStatus("Improdutivo")}>⚡ Improdutivos</MenuItem>
                            <MenuItem onClick={() => marcarStatus("Agendada")}>📅 Agendadas</MenuItem>
                            </MenuList>
                        </Menu>
                        </Flex>

                        <Box overflowX="auto" borderRadius={isMobile ? "md" : "none"}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f7fafc" }}>
                                    <th style={thStyleDesktop}>Cliente</th>
                                    <th style={thStyleDesktop}>Técnico</th>
                                    <th style={thStyleDesktop}>Tipo Cliente</th> {/* <-- NOVO */}
                                    <th style={thStyleDesktop}>Tipo de Ordem</th>
                                    <th style={thStyleDesktop} onClick={() => ordenarOrdens('Conectores')}>Conectores ⬍</th>
                                    <th style={thStyleDesktop} onClick={() => ordenarOrdens('Drop_Metros')}>Drop ⬍</th>
                                    <th style={thStyleDesktop} onClick={() => ordenarOrdens('Esticadores')}>Alçadores ⬍</th>
                                    <th style={thStyleDesktop} onClick={() => ordenarOrdens('FixaFio')}>Fixa Fio ⬍</th>
                                    <th style={thStyleDesktop}>Status</th>
                                </tr>
                                </thead>


                                <tbody>
                                    {ordensOrdenadas.map((ordem, idx) => (
                                        <tr
                                        key={idx}
                                        style={{
                                            backgroundColor: ordensSelecionadas.includes(idx) ? '#FED7D7' : 'transparent'
                                        }}
                                        >
                                        <td style={tdStyleDesktop}>{ordem.Nome_Cliente || '-'}</td>
                                        <td style={tdStyleDesktop}>{ordem.Tecnico_Responsavel || '-'}</td>
                                        <td style={tdStyleDesktop}>{ordem.TipoCliente || 'Tipo não informado'}</td> {/* <-- NOVO */}
                                        <td style={tdStyleDesktop}>{ordem.Tipo_OS || '-'}</td>
                                        <td style={tdStyleDesktop}>{ordem.Materiais_Utilizados?.Conectores || 0}</td>
                                        <td style={tdStyleDesktop}>{ordem.Materiais_Utilizados?.Drop_Metros ? `${ordem.Materiais_Utilizados.Drop_Metros} metros` : '0 metros'}</td>
                                        <td style={tdStyleDesktop}>{ordem.Materiais_Utilizados?.Esticadores || 0}</td>
                                        <td style={tdStyleDesktop}>{ordem.Materiais_Utilizados?.FixaFio || 0}</td>
                                        <td style={tdStyleDesktop}>{ordem.Status_OS || '-'}</td>
                                        </tr>
                                    ))}
                                    </tbody>

                            </table>
                        </Box>
                    </Box>


                </VStack>
            </Box>
        </Box>
    )
}

export default RelatorioEmpresaAnalise
