export const generatePDF = (type: 'internal' | 'client', result: any, clientName: string = 'Cliente') => {
    console.debug('[pdfGenerator] generatePDF requested', { type, clientName, result });
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        // Popup was blocked — create a downloadable HTML file as a fallback
        try {
            const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(htmlBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clientName || 'proposta'}.html`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            alert('Popup bloqueado — arquivo HTML gerado para download. Abra-o e salve como PDF no navegador.');
            return;
        } catch (err) {
            alert('Por favor, permita popups para gerar o PDF. (Tentativa de fallback falhou)');
            console.error('Fallback de geração de PDF falhou:', err);
            return;
        }
    }

    const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const generateInternalContent = (result: any) => {
        return `
            <h1>Ordem de Serviço (Interno)</h1>
            
            <div class="section">
                <h2>Resumo Financeiro</h2>
                <div class="row"><span class="label">Total Bruto (NF):</span> <span class="value">${fmt(result.totalBrutoNF)}</span></div>
                <div class="row"><span class="label">Total Líquido:</span> <span class="value">${fmt(result.totalLiquido)}</span></div>
                <div class="row"><span class="label">Custo Total Projeto:</span> <span class="value">${fmt(result.totalOperationalCost + result.totalTaxes)}</span></div>
                <div class="row"><span class="label">Lucro Operacional:</span> <span class="value" style="color: ${result.lucroOperacional > 0 ? 'green' : 'red'}">${fmt(result.lucroOperacional)}</span></div>
            </div>

            <div class="section">
                <h2>Detalhamento de Custos</h2>
                <table>
                    <tr><th>Item</th><th>Valor</th></tr>
                    <tr><td>Salários Base</td><td>${fmt(result.totalBaseSalary)}</td></tr>
                    <tr><td>Encargos (A + B)</td><td>${fmt(result.totalCharges)}</td></tr>
                    <tr><td>Benefícios</td><td>${fmt(result.totalBenefits)}</td></tr>
                    <tr><td>Exames</td><td>${fmt(result.totalExams)}</td></tr>
                    <tr><td>Custo Operacional (Recrutamento/Adm/EPI)</td><td>${fmt(result.totalOperationalCostValue)}</td></tr>
                    <tr><td>Taxas Administrativas</td><td>${fmt(result.totalFees)}</td></tr>
                    <tr><td>Impostos (Tributos)</td><td>${fmt(result.totalTaxes)}</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>Benefícios (detalhado)</h2>
                <table>
                    <tr><th>Benefício</th><th>Vlr. Fornecido</th><th>Desconto (colab.)</th><th>Custo Cliente</th></tr>
                    ${ (result.benefitsBreakdown || []).map((b: any) => `
                        <tr>
                            <td>${b.name} ${b.discountBase ? '('+ (b.discountBase === 'salary' ? 'desconto sobre salário' : 'desconto sobre fornecido') +')' : ''}</td>
                            <td>${fmt(b.providedValue || 0)}</td>
                            <td>${b.collabDiscount ? fmt(b.collabDiscount) : fmt(0)}</td>
                            <td>${fmt(b.clientCost || 0)}</td>
                        </tr>
                    `).join('') }
                </table>
            </div>

            <div class="section">
                <h2>Detalhamento de Cargos</h2>
                <table>
                    <tr><th>Cargo</th><th>Qtd</th><th>Salário Base</th><th>Salário Bruto</th></tr>
                    ${result.positionsCalculated.map((pos: any) => `
                        <tr>
                            <td>${pos.roleName}</td>
                            <td>${pos.vacancies}</td>
                            <td>${fmt(pos.baseSalary)}</td>
                            <td>${fmt(pos.gross)}</td>
                        </tr>
                    `).join('')}
                </table>

            </div>
        `;
    };

    const generateClientContent = (result: any, clientName: string) => {
        return `
            <div style="text-align: center; margin-bottom: 40px;">
                <img src="https://metarh.com.br/wp-content/uploads/2023/08/Logo-MetaRH-1.png" alt="MetaRH Logo" style="height: 60px;">
            </div>

            <h1>Proposta Comercial</h1>
            <p>Preparado para: <strong>${clientName}</strong></p>

            <div class="section">
                <h2>Investimento Mensal</h2>
                <div class="total">${fmt(result.totalBrutoNF)}</div>
                <p style="font-size: 12px; color: #666; margin-top: 5px;">Valor bruto mensal, incluindo todos os encargos, benefícios e taxas.</p>
            </div>

            <div class="section">
                <h2>Escopo</h2>
                <table>
                    <tr><th>Cargo</th><th>Qtd</th><th>Salário Base</th></tr>
                    ${result.positionsCalculated.map((pos: any) => `
                        <tr>
                            <td>${pos.roleName}</td>
                            <td>${pos.vacancies}</td>
                            <td>${fmt(pos.baseSalary)}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>

            <div class="section">
                <h2>Benefícios (resumo)</h2>
                <table>
                    <tr><th>Benefício</th><th>Vlr. Fornecido</th><th>Custo Cliente</th></tr>
                    ${ (result.benefitsBreakdown || []).map((b: any) => `
                        <tr>
                            <td>${b.name}</td>
                            <td>${fmt(b.providedValue || 0)}</td>
                            <td>${fmt(b.clientCost || 0)}</td>
                        </tr>
                    `).join('') }
                </table>
            </div>

            <div class="section">
                <h2>Benefícios Inclusos</h2>
                <ul>
                    <li>Vale Transporte, Refeição, Alimentação (conforme CLT)</li>
                    <li>Gestão de Benefícios e Ponto</li>
                    <li>Suporte Administrativo e RH</li>
                </ul>
            </div>

            <div class="section" style="margin-top: 50px; border: none;">
                <div style="border-top: 1px solid #000; width: 200px; margin: 0 auto;"></div>
                <p style="text-align: center; margin-top: 10px;">Assinatura Responsável</p>
            </div>
        `;
    };

    const htmlContent = `
        <html>
        <head>
            <title>Proposta - ${clientName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                h1 { color: #4a1d96; border-bottom: 2px solid #4a1d96; padding-bottom: 10px; }
                h2 { color: #4a1d96; margin-top: 20px; font-size: 18px; }
                .section { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .label { font-weight: bold; color: #666; }
                .value { font-weight: bold; }
                .total { font-size: 24px; color: #4a1d96; font-weight: bold; margin-top: 10px; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
                @media print {
                    .no-print { display: none; }
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #4a1d96; color: white; border: none; border-radius: 5px; cursor: pointer;">Imprimir / Salvar PDF</button>
            </div>

            ${type === 'internal' ? generateInternalContent(result) : generateClientContent(result, clientName)}

            <div class="footer">
                <p>Gerado por MetaRH Solutions - ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
    `;

    try {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Try to focus and trigger print dialog automatically (works if not blocked)
        try {
            printWindow.focus();
            // give the new window a moment to render before print
            setTimeout(() => {
                try {
                    printWindow.print();
                } catch (errPrint) {
                    console.warn('[pdfGenerator] automatic print failed or blocked', errPrint);
                }
            }, 250);
        } catch (errFocus) {
            console.warn('[pdfGenerator] could not focus/auto-print', errFocus);
        }

        return true;
    } catch (err) {
        console.error('[pdfGenerator] failed to write/print document', err);
        // last-resort fallback: create downloadable HTML
        try {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clientName || 'proposta'}.html`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            alert('Não foi possível abrir a janela de impressão — um arquivo HTML foi gerado para download. Abra-o e salve como PDF no navegador.');
            return true;
        } catch (err2) {
            console.error('[pdfGenerator] fallback download also failed', err2);
            alert('Erro ao gerar PDF. Verifique console para mais detalhes.');
            return false;
        }
    }
};

// Backwards-compatible wrapper used by PricingCalculator / TrilhandoPlusCalculator
export const generateProposalPDF = (inputsOrType: any, maybeResult?: any, maybeName?: string) => {
    // There are two call shapes in the codebase:
    //  - generateProposalPDF(inputs, result)
    //  - generateProposalPDF(result)  (rare)
    // Normalize to (result, clientName)
    let result: any;
    let clientName = 'Cliente';

    if (maybeResult) {
        // Called as (inputs, result)
        result = maybeResult;
        // Try to read a clientName from inputs if present
        if (inputsOrType && typeof inputsOrType === 'object' && (inputsOrType.clientName || inputsOrType.selectedClient)) {
            clientName = inputsOrType.clientName || inputsOrType.selectedClient;
        }
    } else {
        // Called as (result)
        result = inputsOrType;
    }

    // Fallback: if result missing, just call generatePDF in 'client' mode
    if (!result) return generatePDF('client', {}, clientName);

    // Use existing generate client content by creating a temporary window and writing HTML
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor, permita popups para gerar o PDF.');
        return;
    }

    const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const title = 'Proposta Comercial';
    const html = `
        <html>
        <head>
            <title>${title} - ${clientName}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                h1 { color: #4a1d96; border-bottom: 2px solid #4a1d96; padding-bottom: 10px; }
                h2 { color: #4a1d96; margin-top: 20px; font-size: 18px; }
                .section { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .label { font-weight: bold; color: #666; }
                .value { font-weight: bold; }
                .total { font-size: 24px; color: #4a1d96; font-weight: bold; margin-top: 10px; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
                .highlight { background: #f0fff4; padding: 8px; border-radius: 6px; border: 1px solid #d1fae5; }
                @media print { .no-print { display: none; } body { padding: 0; } }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #4a1d96; color: white; border: none; border-radius: 5px; cursor: pointer;">Imprimir / Salvar PDF</button>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://metarh.com.br/wp-content/uploads/2023/08/Logo-MetaRH-1.png" alt="MetaRH Logo" style="height: 60px;"/>
            </div>

            <h1>${title}</h1>
            <p>Preparado para: <strong>${clientName}</strong></p>

            <div class="section">
                <h2>Investimento Mensal</h2>
                <div class="total">${fmt(result.totalBrutoNF || result.grossNF || 0)}</div>
                <p style="font-size: 12px; color: #666; margin-top: 5px;">Valor bruto mensal, incluindo encargos, benefícios e taxas.</p>
            </div>

            <div class="section">
                <h2>Resumo</h2>
                <div class="row"><span class="label">Salário Referência Total</span><span class="value">${fmt(result.totalBaseSalary || result.referenceSalaryTotal || 0)}</span></div>
                <div class="row"><span class="label">Salário do Cargo (peso)</span><span class="value">${fmt(result.weightedSalaryTotal || 0)}</span></div>
                <div class="row"><span class="label">Taxa Administrativa</span><span class="value">${fmt(result.adminFee || result.totalFees || 0)}</span></div>
                <div class="row"><span class="label">Total Tributos</span><span class="value">${fmt(result.totalTaxes || 0)}</span></div>
            </div>

            <div class="section">
                <h2>Escopo</h2>
                <table>
                    <tr><th>Cargo</th><th>Qtd</th><th>Salário Base</th><th>Salário Bruto</th></tr>
                    ${result.positionsCalculated ? result.positionsCalculated.map((pos: any) => `
                        <tr>
                            <td>${pos.roleName}</td>
                            <td>${pos.vacancies}</td>
                            <td>${fmt(pos.baseSalary)}</td>
                            <td>${fmt(pos.gross)}</td>
                        </tr>
                    `).join('') : ''}
                </table>
            </div>

            <div class="section">
                <h2>Benefícios e Observações</h2>
                <p style="font-size: 12px; color: #666;">Incluir: Vale Transporte (aplicado conforme regras da calculadora), Refeição/Alimentação, Planos de Saúde e demais itens selecionados.</p>
            </div>

            <div class="footer">
                <p>Gerado por MetaRH Solutions - ${new Date().toLocaleDateString()}</p>
            </div>
        </body>
        </html>
    `;

    try {
        printWindow.document.write(html);
        printWindow.document.close();
        try { printWindow.focus(); setTimeout(() => { try { printWindow.print(); } catch (e) { console.warn('auto-print blocked', e); } }, 250); } catch (e) { console.warn('could not focus auto-print', e); }
        return true;
    } catch (err) {
        console.error('generateProposalPDF write/print failed', err);
        try {
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clientName || 'proposta'}.html`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            alert('Popup bloqueado — arquivo HTML gerado para download. Abra-o e salve como PDF no navegador.');
        } catch (err2) {
            console.error('generateProposalPDF fallback failed', err2);
            alert('Erro ao gerar PDF. Verifique console para detalhes.');
            return false;
        }
        return true;
    }
};
