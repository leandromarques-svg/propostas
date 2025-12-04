export const generatePDF = (type: 'internal' | 'client', result: any, clientName: string = 'Cliente') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Por favor, permita popups para gerar o PDF.');
        return;
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

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
