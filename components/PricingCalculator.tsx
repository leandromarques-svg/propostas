import React, { useState, useEffect } from 'react';
import { ProjectPricingInputs, PricingResult, FixedCostItem, Position } from '../types';
import { WEIGHT_TABLES, HOURLY_RATES, DEFAULT_FIXED_ITEMS, TAX_RATES } from '../constants';
import { Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle, FileText, Loader2, Sparkles, Briefcase } from 'lucide-react';
import { SupabaseStatus } from './SupabaseStatus';
import { generateProposalPDF } from './lib/pdfGenerator';
import { getTeamRates, TeamRates } from './lib/teamRatesService';
import { getAppSettings, AppSettings } from './lib/settingsService';
import { Logo } from './Logo';
import { ISSSelector } from './ISSSelector';
import { ISS_RATES } from './ISSRates';

interface PricingCalculatorProps {
  onCancel: () => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onCancel }) => {
  // --- STATE ---
  const [inputs, setInputs] = useState<ProjectPricingInputs>({
    positions: [{
      id: 'pos-1',
      roleName: '',
      roleWeight: 1,
      salary: 0,
      vacancies: 1
    }],
    weight_complexity: 1.0,
    demandedDays: 0,
    qtyConsultant2: 0,
    qtyConsultant1: 0,
    qtyAssistant: 0,
    fixedItems: DEFAULT_FIXED_ITEMS,
    marginMultiplier: 100,
    selectedCity: 'São Paulo - SP',
    selectedISSBase: '',
    clientName: '',
    clientCnpj: ''
  });

  // New coefficient categories (max 10 points)
  const [complexityScale, setComplexityScale] = useState<number>(1); // 0-5 scale

  const [result, setResult] = useState<PricingResult | null>(null);

  // AI Analysis State
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Team Rates from Supabase
  const [teamRates, setTeamRates] = useState<TeamRates>({
    senior: 150,
    plena: 100,
    junior: 60
  });

  // Tax Rates State (Dynamic)
  const [taxRates, setTaxRates] = useState(TAX_RATES);

  const ROLE_OPTIONS = [
    { label: 'Diretoria', value: 2 },
    { label: 'Gerência', value: 1.75 },
    { label: 'Supervisão', value: 1.75 },
    { label: 'Analista Sr', value: 1.5 },
    { label: 'Analista Pl/Jr', value: 1.25 },
    { label: 'Técnico', value: 1.25 },
    { label: 'Assistente', value: 1 },
    { label: 'Operacional', value: 1 }
  ];

  const [selectedRoleLabel, setSelectedRoleLabel] = useState<string>('Assistente');
  const [profitMarginPct, setProfitMarginPct] = useState<number>(20);

  // Load team rates and settings on mount and refresh every 5 seconds
  useEffect(() => {
    const loadRates = async () => {
      const [rates, settings] = await Promise.all([
        getTeamRates(),
        getAppSettings()
      ]);
      setTeamRates(rates);
      if (settings && settings.general_tax_rates) {
        setTaxRates(settings.general_tax_rates);
      }
    };

    // Load immediately
    loadRates();

    // Refresh every 5 seconds
    const interval = setInterval(loadRates, 5000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // --- CALCULATION LOGIC ---
  useEffect(() => {
    calculatePricing();
  }, [inputs, profitMarginPct, complexityScale, teamRates, taxRates]);

  const calculatePricing = () => {
    const {
      positions,
      demandedDays,
      qtyConsultant2, qtyConsultant1, qtyAssistant,
      fixedItems,
      marginMultiplier,
      selectedISSBase
    } = inputs;

    // 1. Team Suggestion based on Complexity Scale (0-5)
    let suggestedTeam = 'Equipe Padrão';
    if (complexityScale <= 1.5) suggestedTeam = 'Foco em Assistente/Jr';
    else if (complexityScale <= 3.5) suggestedTeam = 'Equipe Mista (Pleno)';
    else suggestedTeam = 'Foco em Sênior/Especialista';

    // 2. Operational Costs - Use dynamic rates from Supabase
    const LOCAL_HOURLY_RATES = {
      consultant2: teamRates.senior,  // Senior
      consultant1: teamRates.plena,   // Pleno
      assistant: teamRates.junior     // Junior
    };

    const teamHourlyCost =
      (qtyConsultant2 * LOCAL_HOURLY_RATES.consultant2) +
      (qtyConsultant1 * LOCAL_HOURLY_RATES.consultant1) +
      (qtyAssistant * LOCAL_HOURLY_RATES.assistant);

    // Calculate Total Team Cost based on Demand Hours
    // 1 Day = 9 Hours
    const hoursPerDay = 9;
    const projectHours = demandedDays * hoursPerDay;
    const teamCostTotal = teamHourlyCost * projectHours;

    const fixedItemsCostTotal = fixedItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

    // Total Operacional = Team Costs + Fixed Costs
    const totalOperationalCost = teamCostTotal + fixedItemsCostTotal;

    // 3. Pricing - Calculate Reference Salary from all positions
    // referenceSalaryTotal = sum(salary * vacancies)
    const referenceSalaryTotal = positions.reduce(
      (sum, pos) => sum + (pos.salary * pos.vacancies),
      0
    );

    // Apply job-level weights (roleWeight) to compute the "salário do cargo"
    const weightedSalaryTotal = positions.reduce(
      (sum, pos) => sum + (pos.salary * pos.vacancies * (pos.roleWeight || 1)),
      0
    );

    // Admin Fee: Input is the Target % of Salary reference (100% => equals referenceSalaryTotal)
    const adminFee = referenceSalaryTotal * (marginMultiplier / 100);

    // Profit Margin (Legacy calculation, kept for reference if needed, but not used in new logic)
    const profitMargin = totalOperationalCost * (profitMarginPct / 100);

    // Invoice Total (Gross NF) = Admin Fee + Taxes
    // We need to calculate Taxes ON TOP of the Admin Fee so that:
    // Gross NF = Admin Fee + Taxes
    // And Net Liquid (after retention) covers the Admin Fee.

    // However, user said: "O total Bruto (NF) é o valor da Taxa Administrativa + Impostos"
    // Let's assume standard gross up logic or simple addition depending on interpretation.
    // Usually: Gross = Net / (1 - TaxRate). 
    // But here, let's stick to the previous flow: Base = Admin Fee.

    // Compose the proposal base as: Salário Referência + Salário do Cargo (peso) + Taxa Administrativa
    const totalPreTax = referenceSalaryTotal + weightedSalaryTotal + adminFee;

    // 4. Taxes - taxes are calculated on the whole proposal composition
    // Busca a alíquota do município selecionado
    let issRate = 0.05;
    if (selectedISSBase) {
      const found = ISS_RATES.find(item => item.base === selectedISSBase);
      if (found) issRate = found.aliquota / 100;
    }
    const taxIss = totalPreTax * issRate;
    const taxPis = totalPreTax * taxRates.pis;
    const taxCofins = totalPreTax * taxRates.cofins;
    const taxIrrf = totalPreTax * taxRates.irrf;
    const taxCsll = totalPreTax * taxRates.csll;

    const totalTaxes = taxIss + taxPis + taxCofins + taxIrrf + taxCsll;

    // 5. Final
    const grossNF = totalPreTax + totalTaxes;
    const retentionIR = grossNF * taxRates.retentionIR;

    // Total Líquido (Recebido) = Valor da Nota - Retenção de IR
    const netLiquid = grossNF - retentionIR;

    // 6. Lucro L. Operacional Calculation
    // Lucro L. Operacional = Total Líquido Recebido - Custo Operacional - Total Tributos
    const realProfit = netLiquid - totalOperationalCost - totalTaxes;

    // Profit Margin %: percentage of net liquid received
    const profitMarginPercentage = netLiquid > 0 ? (realProfit / netLiquid) * 100 : 0;

    setResult({
      totalWeight: complexityScale, // Using complexity scale as total weight
      weightPercentage: (complexityScale / 5) * 100,
      suggestedMargin: 0, // Not used
      suggestedTeam,
      workingHours: projectHours,
      teamCostTotal,
      fixedItemsCostTotal,
      totalOperationalCost,
      adminFee,
      referenceSalaryTotal,
      weightedSalaryTotal,
      profitMargin,
      taxIss,
      taxPis,
      taxCofins,
      taxIrrf,
      taxCsll,
      totalTaxes,
      grossNF,
      retentionIR,
      netLiquid,
      realProfit,
      profitMarginPercentage
    });
  };

  // --- HANDLERS ---
  const handleNumberChange = (name: keyof ProjectPricingInputs, val: string) => {
    setInputs(prev => ({ ...prev, [name]: parseFloat(val) || 0 }));
  };

  const handleSelectChange = (name: keyof ProjectPricingInputs, val: string | number) => {
    setInputs(prev => ({ ...prev, [name]: val }));
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);

    // Mask: XX.XXX.XXX/XXXX-XX
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');

    setInputs(prev => ({ ...prev, clientCnpj: value }));
  };

  // Fixed Items Handlers
  const handleUpdateFixedItem = (id: string, field: 'quantity' | 'cost' | 'name', value: string) => {
    setInputs(prev => ({
      ...prev,
      fixedItems: prev.fixedItems.map(item =>
        item.id === id ? { ...item, [field]: field === 'name' ? value : (parseFloat(value) || 0) } : item
      )
    }));
  };

  const handleAddFixedItem = () => {
    const newItem: FixedCostItem = {
      id: `custom-${Date.now()}`,
      name: 'Novo Item',
      cost: 0,
      quantity: 1
    };
    setInputs(prev => ({ ...prev, fixedItems: [...prev.fixedItems, newItem] }));
  };

  const handleDeleteFixedItem = (id: string) => {
    setInputs(prev => ({ ...prev, fixedItems: prev.fixedItems.filter(i => i.id !== id) }));
  };

  // AI Analysis Handler
  const handleAnalyzeWithAI = async () => {
    if (!projectDescription.trim()) {
      alert('Por favor, insira uma descrição do projeto primeiro.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Try multiple sources for the API Key
      // 1. VITE_GEMINI_API_KEY (Recommended in guide)
      // 2. process.env.API_KEY (Mapped in vite.config.ts from VITE_API_KEY)
      // 3. Hardcoded fallback (Temporary for debugging)
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

      if (!apiKey) {
        alert('Chave da API não encontrada. Verifique se VITE_GEMINI_API_KEY está configurada no .env.local');
        return;
      }

      // Dynamic import to avoid build-time resolution issues
      const { GoogleGenerativeAI } = await import("@google/generative-ai");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analise a seguinte descrição de projeto de R&S e retorne APENAS um JSON válido com o seguinte campo numérico:
- complexityScale: Um valor de 0 a 5 representando a complexidade geral da posição (0=Muito Baixa, 5=Muito Alta).

Considere: Nível da vaga, Localidade, Modelo de trabalho, Urgência e Dificuldade do perfil.

Descrição: ${projectDescription}

Retorne APENAS o JSON, sem explicações, markdown ou formatação adicional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const analysis = JSON.parse(jsonText);

      // Set the complexity scale
      setComplexityScale(analysis.complexityScale || 2.5);

    } catch (error) {
      console.error('Erro na análise IA:', error);
      alert('Erro ao analisar com IA. Verifique a conexão e tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const fmtPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32 animate-fade-in overflow-x-hidden">
      <div className="max-w-7xl mx-auto">


        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Precificação de Projetos de R&S</h1>
            <p className="text-gray-500 mt-1">Configure os parâmetros para calcular o valor da proposta</p>
          </div>
          <div className="flex items-center gap-3">
            <SupabaseStatus />
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            {/* Client Info */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                {/* Using Briefcase icon for consistency, imported manually or assuming available locally given similar imports */}
                <Briefcase size={16} /> Dados do Cliente
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Nome do Cliente / Projeto
                  </label>
                  <input
                    type="text"
                    value={inputs.clientName}
                    onChange={(e) => setInputs(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Digite o nome..."
                    className="w-full text-lg font-bold text-metarh-dark border-b-2 border-gray-100 focus:border-metarh-medium outline-none py-2 transition-colors placeholder-gray-300 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={inputs.clientCnpj}
                    onChange={handleCnpjChange}
                    placeholder="XX.XXX.XXX/0001-XX"
                    maxLength={18}
                    className="w-full text-lg font-bold text-metarh-dark border-b-2 border-gray-100 focus:border-metarh-medium outline-none py-2 transition-colors placeholder-gray-300 bg-transparent font-mono"
                  />
                </div>
              </div>
            </div>



            {/* 1. SCOPE & COMPLEXITY */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Users size={18} /> 1. Escopo e Complexidade
              </h2>

              {/* Multiple Positions */}
              <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Cargos para Contratação</label>
                  <button
                    onClick={() => {
                      const newPosition: Position = {
                        id: `pos-${Date.now()}`,
                        roleName: '',
                        roleWeight: 1,
                        salary: 0,
                        vacancies: 1
                      };
                      setInputs(prev => ({
                        ...prev,
                        positions: [...prev.positions, newPosition]
                      }));
                    }}
                    className="text-xs flex items-center gap-1 text-metarh-medium font-bold hover:underline"
                  >
                    <Plus size={14} /> Adicionar Cargo
                  </button>
                </div>

                {inputs.positions.map((position, idx) => (
                  <div key={position.id} className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-600">Cargo {idx + 1}</span>
                      {inputs.positions.length > 1 && (
                        <button
                          onClick={() => setInputs(prev => ({
                            ...prev,
                            positions: prev.positions.filter(p => p.id !== position.id)
                          }))}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Cargo</label>
                        <input
                          type="text"
                          value={position.roleName}
                          onChange={(e) => {
                            setInputs(prev => ({
                              ...prev,
                              positions: prev.positions.map(p =>
                                p.id === position.id ? { ...p, roleName: e.target.value } : p
                              )
                            }));
                          }}
                          className="w-full p-3 bg-white rounded-3xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-mono"
                          placeholder="Ex: Analista Sr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vagas (Qtd)</label>
                        <input
                          type="number"
                          value={position.vacancies || ''}
                          onChange={(e) => {
                            setInputs(prev => ({
                              ...prev,
                              positions: prev.positions.map(p =>
                                p.id === position.id ? { ...p, vacancies: parseFloat(e.target.value) || 0 } : p
                              )
                            }));
                          }}
                          className="w-full p-3 bg-white rounded-3xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salário Base (R$)</label>
                        <input
                          type="number"
                          value={position.salary || ''}
                          onChange={(e) => {
                            setInputs(prev => ({
                              ...prev,
                              positions: prev.positions.map(p =>
                                p.id === position.id ? { ...p, salary: parseFloat(e.target.value) || 0 } : p
                              )
                            }));
                          }}
                          className="w-full p-3 bg-white rounded-3xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-3xl">
                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                    Escala de Complexidade (0-5)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={complexityScale}
                      onChange={(e) => setComplexityScale(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-2xl appearance-none cursor-pointer accent-metarh-medium"
                    />
                    <div className="w-16 text-center font-bold text-lg text-metarh-medium border border-gray-200 rounded-2xl py-1 bg-white">
                      {complexityScale}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                    <span>Baixa (Jr)</span>
                    <span>Média (Pl)</span>
                    <span>Alta (Sr/Esp)</span>
                  </div>
                </div>
              </div>

              {result && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 px-2">
                    <span>Coeficiente: <strong className="text-metarh-medium text-lg">{result.totalWeight.toFixed(1)}</strong> / 5</span>
                    <span className="text-gray-500">Salário Referência Total: {fmtCurrency(result.referenceSalaryTotal)}</span>
                  </div>
                  <div className="bg-metarh-medium/10 border border-metarh-medium/30 rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-metarh-medium" />
                      <span className="text-sm font-bold text-metarh-dark">
                        Sugestão de Equipe: <span className="text-metarh-medium">{result.suggestedTeam}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      {result.totalWeight <= 1.5 && "Vaga tranquila, júnior dá conta sem sofrer. Custo menor, margem maior."}
                      {result.totalWeight > 1.5 && result.totalWeight <= 3.5 && "Vagas medianas, pleno segura a bronca. Custo ok, margem equilibrada."}
                      {result.totalWeight > 3.5 && "Vaga complexa, só sênior fecha rápido. Custo maior, mas evita retrabalho."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. OPERATIONAL COSTS */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <BarChart3 size={18} /> 2. Custos Operacionais
              </h2>

              <div className="mb-6 bg-purple-50/50 p-4 rounded-3xl border border-purple-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Equipe (Qtd Profissionais)</label>
                  <div className="w-40">
                    <label className="block text-[10px] font-bold text-metarh-medium uppercase mb-1">Dias Demandados</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputs.demandedDays || ''}
                        onChange={(e) => handleNumberChange('demandedDays', e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-metarh-medium/30 focus:ring-2 focus:ring-metarh-medium outline-none text-center font-bold bg-white"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        = {inputs.demandedDays * 9}h úteis
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 font-bold mb-1">Sênior ({fmtCurrency(teamRates.senior)})</label>
                    <input type="number" value={inputs.qtyConsultant2} onChange={(e) => handleNumberChange('qtyConsultant2', e.target.value)} className="p-2 border rounded-xl" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 font-bold mb-1">Pleno ({fmtCurrency(teamRates.plena)})</label>
                    <input type="number" value={inputs.qtyConsultant1} onChange={(e) => handleNumberChange('qtyConsultant1', e.target.value)} className="p-2 border rounded-xl" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-500 font-bold mb-1">Júnior ({fmtCurrency(teamRates.junior)})</label>
                    <input type="number" value={inputs.qtyAssistant} onChange={(e) => handleNumberChange('qtyAssistant', e.target.value)} className="p-2 border rounded-xl" />
                  </div>
                </div>

                {/* Team Totals */}
                {result && (
                  <div className="mt-4 bg-metarh-medium/10 border border-metarh-medium/30 rounded-2xl p-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-700">Total da Equipe:</span>
                      <span className="font-bold text-metarh-dark">{inputs.qtyConsultant2 + inputs.qtyConsultant1 + inputs.qtyAssistant} profissionais</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="font-bold text-gray-700">Custo da Equipe:</span>
                      <span className="font-bold text-metarh-medium text-lg">{fmtCurrency(result.teamCostTotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Custos Fixos</label>
                  <button onClick={handleAddFixedItem} className="text-xs flex items-center gap-1 text-metarh-medium font-bold hover:underline">
                    <Plus size={14} /> Adicionar Item
                  </button>
                </div>

                <div className="space-y-2">
                  {inputs.fixedItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateFixedItem(item.id, 'name', e.target.value)}
                        className="flex-1 p-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm"
                        placeholder="Nome do item"
                      />
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.cost || ''}
                          onChange={(e) => handleUpdateFixedItem(item.id, 'cost', e.target.value)}
                          className="w-full p-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-right"
                          placeholder="R$ Unit."
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleUpdateFixedItem(item.id, 'quantity', e.target.value)}
                          className="w-full p-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm text-center"
                          placeholder="Qtd"
                        />
                      </div>
                      <button onClick={() => handleDeleteFixedItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Fixed Costs Total */}
                {result && (
                  <>
                    <div className="mt-4 bg-gray-100 border border-gray-300 rounded-2xl p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-gray-700">Total Custos Fixos:</span>
                        <span className="font-bold text-gray-900 text-lg">{fmtCurrency(result.fixedItemsCostTotal)}</span>
                      </div>
                    </div>

                    {/* Total Operational Costs */}
                    <div className="mt-4 bg-gradient-to-br from-metarh-medium/10 to-metarh-dark/10 border-2 border-metarh-medium rounded-2xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-metarh-dark uppercase text-sm">Total Custos Operacionais:</span>
                        <span className="font-bold text-metarh-dark text-xl">{fmtCurrency(result.totalOperationalCost)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 text-right">Equipe + Custos Fixos</p>
                    </div>
                  </>
                )}
              </div>
            </div>


            {/* 2. TAXA ADMINISTRATIVA */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <DollarSign size={18} /> 2. Taxa Administrativa
              </h2>
            // ...existing code...
          </div>

        {/* 3. ENCARGOS - FORA DO GRID PRINCIPAL */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
            <Calculator size={18} /> 3. Encargos
          </h2>
          <div className="mb-4">
            <ISSSelector
              value={inputs.selectedISSBase}
              onChange={base => setInputs(prev => ({ ...prev, selectedISSBase: base }))}
            />
          </div>
          <p className="text-xs text-gray-500">Selecione o município para definir a alíquota de ISS. Outros encargos são calculados automaticamente.</p>
        </div>

              {/* Explicação dos Modos de Cálculo */}
              <div className="mb-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-[12px] text-gray-700 leading-relaxed">
                  <p className="mb-1"><strong>5 Colunas:</strong> A taxa (margem) é aplicada <strong>sobre os valores antes dos impostos</strong> (Salário Referência, Salário do Cargo e Custos Operacionais). Ou seja, sua margem é calculada sobre o custo do projeto, antes de adicionar tributos.</p>
                  <p><strong>Taxa Final:</strong> A taxa é aplicada <strong>sobre o valor da NF Bruta</strong> (faturamento total, já incluindo impostos). Aqui, sua margem é calculada sobre o valor final que o cliente paga, já com tributos embutidos.</p>
                </div>
              </div>

              {/* Admin Fee */}
              <div className="bg-gray-50 border-2 border-gray-300 p-4 rounded-3xl">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Taxa Administrativa</label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="number"
                    step="1"
                    value={inputs.marginMultiplier}
                    onChange={(e) => handleNumberChange('marginMultiplier', e.target.value)}
                    className="w-20 p-2 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none font-bold text-center"
                  />
                  <span className="text-sm text-gray-600">%</span>
                  <span className="text-xs text-gray-500">sobre salário referência</span>
                </div>
                {result && (
                  <div className="bg-white rounded-2xl p-3 border border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-600">Valor Total:</span>
                      <span className="text-lg font-bold text-gray-900">{fmtCurrency(result.adminFee)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN: RESULTS --- */}
          <div className="lg:col-span-1">
            <div className="bg-metarh-dark text-white p-8 rounded-[2.5rem] shadow-xl sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-metarh-lime" /> Resultado
              </h2>

              {result && (
                <div className="space-y-6">
                  {/* Summary Costs */}
                  <div className="space-y-2 pb-4 border-b border-white/10">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Custo Equipe</span><span className="font-bold">{fmtCurrency(result.teamCostTotal)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Custos Fixos</span><span className="font-bold">{fmtCurrency(result.fixedItemsCostTotal)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Total Operacional</span><span className="font-bold">{fmtCurrency(result.totalOperationalCost)}</span></div>

                    {/* Highlighted Reference Salary */}
                    <div className="bg-white/10 border border-white/20 rounded-3xl p-3 my-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-metarh-lime uppercase tracking-wider">Salário Referência</span>
                        <span className="text-xl font-bold text-white">{fmtCurrency(result.referenceSalaryTotal)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 text-right mt-1">Base para cálculo da taxa</p>
                    </div>
                  </div>
                  {/* Display weighted salary (salário do cargo) */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-3 my-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">Salário do Cargo (peso)</span>
                      <span className="text-lg font-bold text-white">{fmtCurrency(result.weightedSalaryTotal || 0)}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 text-right mt-1">Soma dos salários × peso por nível</p>
                  </div>

                  {/* Revenue & Costs */}
                  <div className="space-y-2 pb-4 border-b border-white/10">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Taxa Administrativa</span><span className="font-bold">{fmtCurrency(result.adminFee)}</span></div>
                  </div>

                  {/* Taxes Breakdown */}
                  <div className="bg-white/5 p-4 rounded-3xl space-y-1 text-xs">
                    <p className="font-bold text-gray-300 mb-2 uppercase tracking-wider">Impostos (NF)</p>
                    <div className="flex justify-between"><span className="text-gray-500">ISS</span><span className="text-gray-300">{fmtCurrency(result.taxIss)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">PIS ({fmtPercent(taxRates.pis)})</span><span className="text-gray-300">{fmtCurrency(result.taxPis)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">COFINS ({fmtPercent(taxRates.cofins)})</span><span className="text-gray-300">{fmtCurrency(result.taxCofins)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">IRRF ({fmtPercent(taxRates.irrf)})</span><span className="text-gray-300">{fmtCurrency(result.taxIrrf)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">CSLL ({fmtPercent(taxRates.csll)})</span><span className="text-gray-300">{fmtCurrency(result.taxCsll)}</span></div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between font-bold"><span className="text-gray-400">Total Tributos</span><span className="text-white">{fmtCurrency(result.totalTaxes)}</span></div>
                    </div>
                  </div>

                  {/* Final */}
                  <div className="pt-2 space-y-3">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                      <p className="text-xs text-gray-300 uppercase font-bold mb-1">Total Bruto (NF)</p>
                      <p className="text-3xl font-bold text-white">{fmtCurrency(result.grossNF)}</p>
                      <p className="text-[11px] text-gray-300 mt-1">Composição: Salário Referência + Salário do Cargo (peso) + Taxa Administrativa + Tributos</p>
                    </div>

                    <div className="flex justify-between text-xs text-red-300 px-2">
                      <span>Retenção IR ({fmtPercent(taxRates.retentionIR)})</span>
                      <span>- {fmtCurrency(result.retentionIR)}</span>
                    </div>

                    <div className="bg-metarh-lime p-4 rounded-2xl text-metarh-dark shadow-lg">
                      <p className="text-xs uppercase font-bold mb-1 opacity-80">Total Líquido (Recebido)</p>
                      <p className="text-3xl font-bold">{fmtCurrency(result.netLiquid)}</p>
                    </div>

                    {/* Lucro L. Operacional Section */}
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 p-4 rounded-2xl">
                      <p className="text-xs uppercase font-bold mb-2 text-purple-300 tracking-wider">💰 Lucro L. Operacional</p>
                      <p className="text-2xl font-bold text-white mb-1">{fmtCurrency(result.realProfit)}</p>
                      <div className="bg-white/10 rounded-2xl p-2 mt-2 border border-purple-300/30">
                        <p className="text-2xl font-bold text-purple-200 text-center">
                          {result.profitMarginPercentage.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-gray-400 text-center mt-1">do valor recebido</p>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400">
                        Líquido Recebido - Custo Operacional - Tributos
                      </div>
                    </div>

                    {/* Fun Tips Section */}
                    <div className={`p-4 rounded-2xl border-l-8 shadow-lg ${result.realProfit < 0
                      ? 'bg-red-500/20 border-red-500'
                      : result.profitMarginPercentage < 10
                        ? 'bg-orange-500/20 border-orange-500'
                        : result.profitMarginPercentage <= 35
                          ? 'bg-yellow-500/20 border-yellow-500'
                          : 'bg-green-500/20 border-green-500'
                      }`}>
                      <p className="text-sm font-bold mb-2 flex items-center gap-2 text-white">
                        {result.realProfit < 0 ? '🚨' : result.profitMarginPercentage < 10 ? '😅' : result.profitMarginPercentage <= 35 ? '😉' : '🚀'}
                        <span className="uppercase tracking-wider">Dica do Especialista</span>
                      </p>
                      <p className="text-xs text-gray-200 leading-relaxed font-medium">
                        {result.realProfit < 0
                          ? 'Prejuízo à vista! Abortar missão ou renegociar urgente! A gente não trabalha de graça não, né? 🚨'
                          : result.profitMarginPercentage < 10
                            ? 'Eita! Margem apertada. Tente aumentar a taxa ou rever os custos fixos. Senão a gente paga pra trabalhar! 😅'
                            : result.profitMarginPercentage <= 35
                              ? 'Margem ok, mas dá pra melhorar. Que tal um chorinho na taxa? Ou cortar uns custos fixos? 😉'
                              : 'Aí sim! Margem top (acima de 35%). O comercial tá voando! Pode fechar sem medo. 🚀'
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!result) return;
                      try {
                        const ok = generateProposalPDF(inputs, result);
                        if (!ok) alert('Não foi possível gerar o PDF automaticamente. Verifique popups bloqueados.');
                      } catch (err) {
                        console.error('Erro gerando pdf (pricing):', err);
                        alert('Erro ao gerar PDF. Verifique console.');
                      }
                    }}
                    className="w-full bg-metarh-lime hover:bg-metarh-lime/90 text-metarh-dark font-bold text-lg py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <FileText size={24} />
                    Gerar Proposta PDF
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Simple InputField helper
const InputField = ({ label, type = "text", value, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-bold"
    />
  </div>
);
