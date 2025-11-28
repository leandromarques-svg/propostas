import { jsPDF } from 'jspdf';
import { ProjectPricingInputs, PricingResult } from '../../types';

export const generateProposalPDF = (inputs: ProjectPricingInputs, result: PricingResult) => {
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

    // Header
    addTitle('PROPOSTA COMERCIAL - METARH');
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
