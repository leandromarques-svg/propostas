// @ts-ignore - jsPDF loaded from CDN
const { jsPDF } = window.jspdf || {};
import { ProjectPricingInputs, PricingResult } from '../../types';

export const generateProposalPDF = (inputs: ProjectPricingInputs, result: PricingResult) => {
    if (!jsPDF) {
        alert('Erro: biblioteca jsPDF não carregada. Recarregue a página.');
        return;
    }
    const doc = new jsPDF();

    const primaryColor = '#470082';
    const accentColor = '#aa3ffe';
    const textColor = '#333333';

    let yPos = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper functions
    const fmtCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const addTitle = (text: string) => {
        doc.setFontSize(16);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(text, 20, yPos);
        yPos += lineHeight + 3;
    };

    const addSection = (title: string) => {
        yPos += 5;
        doc.setFontSize(12);
        doc.setTextColor(accentColor);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 20, yPos);
        yPos += lineHeight;
    };

    const addLine = (label: string, value: string, bold = false) => {
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        doc.text(label, 25, yPos);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(value, pageWidth - 25, yPos, { align: 'right' });
        yPos += lineHeight;
    };

    const checkPageBreak = () => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
    };

    // Header with METARH SVG Logo
    const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 237.39 237.4">
      <path fill="#470082" d="M34.39,170.39c3.89,1.38,5.5,1.9,7.75.51,1.18-.78,2.54-2.08,4.57-4.09,4.31-4.25,5.23-5.53,4.39-8.77-1.01-2.19-1.76-4.47-2.2-6.81-.03-.15-.05-.29-.08-.44-.12-.69-.21-1.39-.28-2.09-.02-.2-.04-.39-.06-.58-.06-.81-.1-1.62-.09-2.43,0-.22.02-.44.03-.67.02-.58.05-1.16.1-1.73.03-.35.07-.71.11-1.06.06-.44.13-.88.2-1.31.28-1.64.71-3.25,1.27-4.84.02-.07.04-.14.07-.2h0c1.43-3.92,3.69-7.6,6.86-10.73.06-.06.12-.11.18-.17,0,0,0,0,0,0,.01-.01.02-.02.04-.03.4-.39.81-.76,1.22-1.12.36-.32.73-.62,1.11-.92,0,0,.02-.01.02-.02,3.71-2.93,8-4.83,12.47-5.67.15-.03.29-.05.44-.08.69-.12,1.39-.21,2.09-.28.2-.02.39-.04.58-.06.52-.04,1.05-.05,1.58-.06.14,0,.27-.02.41-.02.06,0,.12,0,.17,0,.09,0,.18-.01.27-.01.03,0,.07,0,.1,0,.03,0,.06,0,.09,0,.78,0,1.56.04,2.34.11.34.03.68.08,1.02.12.41.05.82.11,1.22.18.49.08.97.17,1.46.28.12.03.23.06.34.08,5.08,1.18,9.89,3.71,13.79,7.66.26.26.49.54.74.81.26.28.51.55.76.84.1.12.2.24.3.36,2.39,2.86,4.14,6.08,5.27,9.46h0s.02.08.03.12c.17.52.34,1.05.48,1.58.12.43.22.87.32,1.3.08.36.17.72.23,1.08.13.72.23,1.45.31,2.18.03.24.04.47.06.71.05.64.08,1.28.09,1.93,0,.21.01.42.01.64,0,.78-.04,1.56-.11,2.34-.03.34-.08.68-.12,1.02-.05.41-.11.82-.18,1.22-.08.49-.17.97-.28,1.46-.03.12-.06.23-.08.34-.48,2.06-1.19,4.06-2.11,5.99-.44,1.76-.37,2.98.55,4.46.78,1.18,2.08,2.54,4.09,4.57,4.88,4.95,5.84,5.43,10.38,3.91,2.26-.9,4.6-1.5,6.96-1.8.22-.03.44-.05.66-.07.6-.06,1.21-.12,1.81-.15.72-.03,1.44-.04,2.16-.02.14,0,.28.01.42.02,3.47.15,6.91.92,10.16,2.3,2.52.82,3.94.95,5.76-.17,1.18-.78,2.54-2.08,4.57-4.09,5.36-5.29,5.48-5.97,3.49-11.58-.95-2.68-1.48-5.47-1.6-8.28-.02-.16-.05-.32-.07-.48-.03-.25-.05-.51-.07-.76-.06-.69-.09-1.38-.1-2.08,0-.23-.01-.45-.01-.68,0-.84.04-1.68.12-2.51.03-.37.09-.73.13-1.1.05-.44.11-.87.19-1.31.09-.52.18-1.05.3-1.57.03-.12.06-.25.09-.37,1.25-5.46,3.94-10.63,8.15-14.83,2.49-2.48,5.29-4.42,8.27-5.88,7.47-3.73,16.03-4.2,23.75-1.41,4.14,1.49,5.86,2.05,8.25.56,1.25-.83,2.71-2.24,4.87-4.39,5.71-5.69,5.83-6.41,3.71-12.45-3.88-11.03-1.32-23.79,7.46-32.54,1.49-1.48,3.1-2.76,4.8-3.87C203.05,25.45,164.54.5,120.02,0,54.47-.72.74,51.83,0,117.38c-.22,19.47,4.27,37.89,12.39,54.19,6.94-3.33,14.84-3.75,21.99-1.18Z"/>
      <path fill="#470082" d="M229.78,117.57c-4.14-1.49-5.86-2.05-8.25-.56-1.25.83-2.71,2.24-4.87,4.39-5.71,5.69-5.83,6.41-3.71,12.45,3.88,11.03,1.32,23.79-7.46,32.54-4.46,4.45-10.01,7.23-15.82,8.33-.16.03-.31.05-.47.08-.74.13-1.48.23-2.22.3-.21.02-.41.05-.62.06-.34.03-.69.02-1.03.04-4.26.47-8.59,0-12.68-1.46-3.89-1.38-5.5-1.9-7.75-.51-1.18.78-2.54,2.08-4.57,4.09-4.66,4.6-5.36,5.71-4.16,9.61.82,1.93,1.42,3.93,1.81,5.97.03.15.05.29.08.44.12.69.21,1.39.28,2.09.02.2.04.39.06.59.02.22.01.44.03.66.01.2.01.39.02.59.01.39.05.78.05,1.17,0,.1,0,.20-.01.30-.07,7.41-2.98,14.8-8.67,20.42-4.19,4.14-9.40,6.73-14.86,7.75-.15.03-.29.05-.44.08-.69.12-1.39.21-2.09.28-.2.02-.39.04-.59.06-.81.06-1.62.1-2.43.09-.06,0-.12,0-.18,0-.05,0-.11,0-.16,0-.78,0-1.56-.04-2.34-.11-.34-.03-.68-.08-1.02-.12-.41-.05-.81-.11-1.22-.17-.49-.08-.97-.17-1.46-.28-.12-.03-.23-.06-.34-.08-5.08-1.18-9.89-3.71-13.79-7.66-2.31-2.34-4.12-4.97-5.47-7.77-1.54-3.12-2.45-6.44-2.8-9.81,0-.05-.02-.09-.02-.14,0-.08-.01-.15-.02-.23-.05-.59-.09-1.18-.1-1.78,0-.21-.03-.42-.03-.64,0-.21-.01-.42-.01-.63,0-.19.02-.37.03-.56,0-.09,0-.19.01-.28.02-.5.03-1,.07-1.5.03-.34.08-.68.12-1.02.05-.41.11-.81.17-1.22.08-.49.17-.97.28-1.46.03-.12.06-.23.08-.34.41-1.76.99-3.49,1.73-5.17.68-2.24.73-3.58-.32-5.28-.78-1.18-2.08-2.54-4.09-4.57-4.65-4.71-5.73-5.37-9.73-4.12-3.3,1.39-6.78,2.14-10.28,2.24-.64.03-1.27.03-1.91.02-.06,0-.13,0-.19,0-3.73-.12-7.44-.96-10.91-2.51-2.15-.64-3.47-.66-5.13.37-1.18.78-2.54,2.08-4.57,4.09-5.36,5.29-5.48,5.97-3.49,11.58,3.08,8.68,1.8,18.51-3.66,26.26,19.29,14.13,43.01,22.59,68.75,22.87,65.55.73,119.28-51.82,120.01-117.37,0-.27,0-.54,0-.80-2.58-.23-5.14-.75-7.61-1.64Z"/>
    </svg>`;

    try {
        // Try to add SVG as image (jsPDF 2.x supports this)
        doc.addSvgAsImage(logoSvg, 20, yPos - 5, 15, 15);
        yPos += 18;
    } catch (e) {
        // Fallback: use text if SVG rendering fails
        doc.setFontSize(24);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('METARH', 20, yPos);
        yPos += lineHeight + 2;
    }

    addTitle('PROPOSTA COMERCIAL');
    doc.setFontSize(9);
    doc.setTextColor('#666666');
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, yPos);
    yPos += lineHeight + 5;

    // 1. ESCOPO DO PROJETO
    addSection('1. ESCOPO DO PROJETO');

    // Calculate total reference salary
    const totalReferenceSalary = inputs.positions.reduce(
        (sum, pos) => sum + (pos.salary * pos.vacancies),
        0
    );

    inputs.positions.forEach((pos, idx) => {
        checkPageBreak();
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`Cargo ${idx + 1}: ${pos.roleName}`, 25, yPos);
        yPos += lineHeight;

        doc.setFont('helvetica', 'normal');
        addLine(`  • Vagas:`, `${pos.vacancies}`);
        addLine(`  • Salário Base:`, fmtCurrency(pos.salary));
        addLine(`  • Subtotal:`, fmtCurrency(pos.salary * pos.vacancies), true);
    });

    yPos += 3;
    doc.setDrawColor(accentColor);
    doc.line(25, yPos, pageWidth - 25, yPos);
    yPos += 5;
    addLine('SALÁRIO REFERÊNCIA TOTAL:', fmtCurrency(totalReferenceSalary), true);

    // 2. ANÁLISE DE COMPLEXIDADE
    checkPageBreak();
    addSection('2. ANÁLISE DE COMPLEXIDADE');
    addLine('Escala de Complexidade (0-5):', result.totalWeight.toFixed(1), true);
    addLine('Sugestão de Equipe:', result.suggestedTeam);

    // 3. COMPOSIÇÃO DA EQUIPE
    checkPageBreak();
    addSection('3. COMPOSIÇÃO DA EQUIPE');
    addLine('Dias Demandados:', `${inputs.demandedDays} dias (${inputs.demandedDays * 9}h úteis)`);
    addLine('Equipe Senior:', `${inputs.qtyConsultant2} profissionais`);
    addLine('Equipe Plena:', `${inputs.qtyConsultant1} profissionais`);
    addLine('Equipe Junior:', `${inputs.qtyAssistant} profissionais`);
    yPos += 2;
    addLine('Custo Total da Equipe:', fmtCurrency(result.teamCostTotal), true);

    // 4. CUSTOS FIXOS
    checkPageBreak();
    addSection('4. CUSTOS FIXOS');
    inputs.fixedItems.forEach(item => {
        checkPageBreak();
        const itemTotal = item.cost * item.quantity;
        addLine(`${item.name} (${item.quantity}x ${fmtCurrency(item.cost)}):`, fmtCurrency(itemTotal));
    });
    yPos += 2;
    addLine('Total Custos Fixos:', fmtCurrency(result.fixedItemsCostTotal), true);

    yPos += 3;
    doc.setFillColor(accentColor);
    doc.rect(20, yPos - 5, pageWidth - 40, lineHeight + 2, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTO OPERACIONAL TOTAL:', 25, yPos);
    doc.text(fmtCurrency(result.totalOperationalCost), pageWidth - 25, yPos, { align: 'right' });
    yPos += lineHeight + 5;
    doc.setTextColor(textColor);

    // 5. PRECIFICAÇÃO
    checkPageBreak();
    addSection('5. PRECIFICAÇÃO');
    addLine('Taxa Administrativa:', `${inputs.marginMultiplier}% do Salário Referência`);
    addLine('Valor da Taxa Administrativa:', fmtCurrency(result.adminFee), true);

    // 6. IMPOSTOS
    checkPageBreak();
    addSection('6. IMPOSTOS E TRIBUTOS');
    addLine('ISS (5%):', fmtCurrency(result.taxIss));
    addLine('PIS (1.65%):', fmtCurrency(result.taxPis));
    addLine('COFINS (7.6%):', fmtCurrency(result.taxCofins));
    addLine('IRRF (1.5%):', fmtCurrency(result.taxIrrf));
    addLine('CSLL (1%):', fmtCurrency(result.taxCsll));
    yPos += 2;
    addLine('Total de Tributos:', fmtCurrency(result.totalTaxes), true);

    // 7. VALORES FINAIS
    checkPageBreak();
    addSection('7. VALORES FINAIS');

    yPos += 3;
    doc.setFillColor(primaryColor);
    doc.rect(20, yPos - 5, pageWidth - 40, lineHeight + 2, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL BRUTO (NOTA FISCAL):', 25, yPos);
    doc.text(fmtCurrency(result.grossNF), pageWidth - 25, yPos, { align: 'right' });
    yPos += lineHeight + 5;
    doc.setTextColor(textColor);
    doc.setFontSize(10);

    addLine('(-) Retenção IR (1.5%):', fmtCurrency(result.retentionIR));
    yPos += 2;

    doc.setFillColor('#c9f545');
    doc.rect(20, yPos - 5, pageWidth - 40, lineHeight + 2, 'F');
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL LÍQUIDO (RECEBIDO):', 25, yPos);
    doc.text(fmtCurrency(result.netLiquid), pageWidth - 25, yPos, { align: 'right' });
    yPos += lineHeight + 8;
    doc.setTextColor(textColor);
    doc.setFontSize(10);

    // 8. ANÁLISE DE LUCRO
    checkPageBreak();
    addSection('8. ANÁLISE DE LUCRO');
    addLine('Total Líquido Recebido:', fmtCurrency(result.netLiquid));
    addLine('(-) Custo Operacional:', fmtCurrency(result.totalOperationalCost));
    yPos += 3;

    doc.setFillColor('#aa3ffe');
    doc.rect(20, yPos - 5, pageWidth - 40, lineHeight + 2, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('LUCRO L. OPERACIONAL:', 25, yPos);
    doc.text(fmtCurrency(result.realProfit), pageWidth - 25, yPos, { align: 'right' });
    yPos += lineHeight + 5;

    doc.setTextColor(textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    addLine('Margem de Lucro:', `${result.profitMarginPercentage.toFixed(1)}% do valor recebido`, true);

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.setFont('helvetica', 'italic');
    doc.text('METARH - Soluções em Recursos Humanos', pageWidth / 2, yPos, { align: 'center' });

    // Save PDF
    const fileName = `Proposta_METARH_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};
