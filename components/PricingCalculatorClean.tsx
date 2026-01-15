
import React, { useState, useEffect } from 'react';
import { ProjectPricingInputs, PricingResult, FixedCostItem, Position } from '../types';
import { WEIGHT_TABLES, HOURLY_RATES, DEFAULT_FIXED_ITEMS, TAX_RATES } from '../constants';
import { Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle, FileText, Loader2, Sparkles, Briefcase } from 'lucide-react';
import { SupabaseStatus } from './SupabaseStatus';
import { generateProposalPDF } from './lib/pdfGenerator';
import { getTeamRates, TeamRates } from './lib/teamRatesService';
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

  // Load team rates on mount and refresh every 5 seconds
  useEffect(() => {
    const loadRates = async () => {
      const rates = await getTeamRates();
      setTeamRates(rates);
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
  }, [inputs, profitMarginPct, complexityScale, teamRates]);

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
    const referenceSalaryTotal = positions.reduce(
      (sum, pos) => sum + (pos.salary * pos.vacancies),
      0
    );

    // Admin Fee: Input is the Target % of Salary.
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

    const totalPreTax = adminFee;

    // 4. Taxes
    // Busca a alíquota do município selecionado
    let issRate = 0.05;
    if (selectedISSBase) {
      const found = ISS_RATES.find(item => item.base === selectedISSBase);
      if (found) issRate = found.aliquota / 100;
    }
    const taxIss = totalPreTax * issRate;
    const taxPis = totalPreTax * TAX_RATES.pis;
    const taxCofins = totalPreTax * TAX_RATES.cofins;
    const taxIrrf = totalPreTax * TAX_RATES.irrf;
    const taxCsll = totalPreTax * TAX_RATES.csll;

    const totalTaxes = taxIss + taxPis + taxCofins + taxIrrf + taxCsll;

    // 5. Final
    const grossNF = totalPreTax + totalTaxes;
    const retentionIR = grossNF * TAX_RATES.retentionIR; // 1.5% on Gross

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
        {/* ...existing code... */}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const InputField: React.FC<{ label: string, type: string, value: any, onChange: (val: string) => void }> = ({ label, type, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 bg-gray-50 rounded-3xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-mono"
    />
  </div>
);

const SelectField: React.FC<{ label: string, value: number, onChange: (val: string) => void, options: { label: string, value: number }[] }> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 bg-gray-50 rounded-3xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm"
    >
      {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const Row: React.FC<{ label: string, value: string, highlight?: boolean, small?: boolean }> = ({ label, value, highlight, small }) => (
  <div className={`flex justify-between ${small ? 'text-gray-400' : highlight ? 'text-white font-bold' : 'text-gray-300'}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
  // (todo o corpo do PricingCalculator.tsx original, incluindo cálculos, handlers, return JSX)

  // ...existing code...
  // ...cálculos, handlers, etc...

  // JSX completo do return:
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32 animate-fade-in overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header, grid, todos os cards, JSX completo igual ao PricingCalculator.tsx */}
        {/* ...existing code... */}
      </div>
    </div>
  );
}
export default PricingCalculator;
