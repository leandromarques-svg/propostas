import React, { useState, useEffect } from 'react';
import { ProjectPricingInputs, PricingResult, FixedCostItem } from '../types';
import { WEIGHT_TABLES, HOURLY_RATES, DEFAULT_FIXED_ITEMS, TAX_RATES } from '../constants';
import { Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle, Save, Loader2 } from 'lucide-react';
import { saveProposal } from './lib/proposalService';
import { SupabaseStatus } from './SupabaseStatus';

interface PricingCalculatorProps {
  onCancel: () => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onCancel }) => {
  // --- STATE ---
  const [inputs, setInputs] = useState<ProjectPricingInputs>({
    roleName: '',
    vacancies: 1,
    salary: 0,
    weightRole: 1.0,
    weightComplexity: 0.5,
    weightUrgency: 0.5,
    weightVolume: 0.5,
    demandedDays: 0,
    qtyConsultant2: 0,
    qtyConsultant1: 0,
    qtyAssistant: 0,
    fixedItems: DEFAULT_FIXED_ITEMS,
    marginMultiplier: 100,
    selectedCity: 'São Paulo - SP'
  });

  // New coefficient categories (max 10 points)
  const [weightJobLevel, setWeightJobLevel] = useState<number>(1); // max 3
  const [weightLocation, setWeightLocation] = useState<number>(0.5); // max 1.5
  const [weightWorkModel, setWeightWorkModel] = useState<number>(0.5); // max 1.5
  const [weightUrgency, setWeightUrgency] = useState<number>(0.5); // max 2
  const [weightProfileDifficulty, setWeightProfileDifficulty] = useState<number>(0.5); // max 2

  const [result, setResult] = useState<PricingResult | null>(null);

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

  // New weight options
  const WEIGHT_JOB_LEVEL = [
    { label: 'Júnior', value: 1 },
    { label: 'Pleno', value: 2 },
    { label: 'Sênior/Liderança', value: 3 }
  ];

  const WEIGHT_LOCATION = [
    { label: 'Grande Centro', value: 0.5 },
    { label: 'Cidade Média', value: 1 },
    { label: 'Interior/Difícil Acesso', value: 1.5 }
  ];

  const WEIGHT_WORK_MODEL = [
    { label: 'Remoto', value: 0.5 },
    { label: 'Híbrido', value: 1 },
    { label: 'Presencial', value: 1.5 }
  ];

  const WEIGHT_URGENCY = [
    { label: 'Baixa', value: 0.5 },
    { label: 'Média', value: 1 },
    { label: 'Alta', value: 2 }
  ];

  const WEIGHT_PROFILE_DIFFICULTY = [
    { label: 'Fácil', value: 0.5 },
    { label: 'Médio', value: 1 },
    { label: 'Difícil', value: 2 }
  ];

  const [selectedRoleLabel, setSelectedRoleLabel] = useState<string>('Assistente');
  const [profitMarginPct, setProfitMarginPct] = useState<number>(20);
  const [isSaving, setIsSaving] = useState(false);

  // --- CALCULATION LOGIC ---
  useEffect(() => {
    calculatePricing();
  }, [inputs, profitMarginPct, weightJobLevel, weightLocation, weightWorkModel, weightUrgency, weightProfileDifficulty]);

  const calculatePricing = () => {
    const {
      vacancies, salary,
      demandedDays,
      qtyConsultant2, qtyConsultant1, qtyAssistant,
      fixedItems,
      marginMultiplier
    } = inputs;

    // 1. Coefficients & Team Suggestion
    const totalWeight = weightJobLevel + weightLocation + weightWorkModel + weightUrgency + weightProfileDifficulty;
    const maxWeight = 10;
    const weightPercentage = (totalWeight / maxWeight) * 100;

    // Team suggestion based on coefficient
    let suggestedTeam = 'Júnior';
    if (totalWeight > 6) suggestedTeam = 'Sênior';
    else if (totalWeight > 3) suggestedTeam = 'Plena';

    // Suggested margin (keeping for compatibility)
    let suggestedMargin = 1.15;
    if (totalWeight > 6) suggestedMargin = 1.50;
    else if (totalWeight > 3) suggestedMargin = 1.25;

    // 2. Operational Costs
    const LOCAL_HOURLY_RATES = {
      consultant2: 27.00,
      consultant1: 22.00,
      assistant: 15.00
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

    // Total Operacional = Team Costs + Fixed Costs (internal tracking only)
    const totalOperationalCost = teamCostTotal + fixedItemsCostTotal;

    // 3. Pricing - ONLY Admin Fee is charged to client
    const referenceSalaryTotal = salary * vacancies;

    // Admin Fee: Input is the Target % of Salary.
    // 100% -> Fee = 1.0 * Salary. 120% -> Fee = 1.2 * Salary.
    const adminFee = referenceSalaryTotal * (marginMultiplier / 100);

    // Profit Margin (for display purposes, but not added to invoice)
    const profitMargin = totalOperationalCost * (profitMarginPct / 100);

    // NEW LOGIC: Invoice ONLY includes Admin Fee (no operational costs)
    const totalPreTax = adminFee;

    // 4. Taxes
    // Fixed to São Paulo
    const issRate = 0.05; // São Paulo default

    const taxIss = totalPreTax * issRate;
    const taxPis = totalPreTax * TAX_RATES.pis;
    const taxCofins = totalPreTax * TAX_RATES.cofins;
    const taxIrrf = totalPreTax * TAX_RATES.irrf;
    const taxCsll = totalPreTax * TAX_RATES.csll;

    const totalTaxes = taxIss + taxPis + taxCofins + taxIrrf + taxCsll;

    // 5. Final
    const grossNF = totalPreTax + totalTaxes;
    const retentionIR = grossNF * TAX_RATES.retentionIR; // 1.5% on Gross

    // Net Liquid = Gross - Retention - Taxes - Fixed Costs
    const netLiquid = grossNF - retentionIR - totalTaxes - fixedItemsCostTotal;

    // 6. Real Profit = What we receive - What we spend on team
    const realProfit = netLiquid - teamCostTotal;
    const profitMarginPercentage = netLiquid > 0 ? (realProfit / netLiquid) * 100 : 0;

    setResult({
      totalWeight,
      weightPercentage,
      suggestedMargin,
      suggestedTeam,
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

  const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const fmtPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32 animate-fade-in">
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

            {/* 1. SCOPE & COMPLEXITY */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Users size={18} /> 1. Escopo e Complexidade
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InputField label="Cargo" type="text" value={inputs.roleName} onChange={(v) => setInputs(p => ({ ...p, roleName: v }))} />
                <InputField label="Vagas (Qtd)" type="number" value={inputs.vacancies} onChange={(v) => handleNumberChange('vacancies', v)} />
                <InputField label="Salário Base (R$)" type="number" value={inputs.salary} onChange={(v) => handleNumberChange('salary', v)} />
              </div>

              <div className="grid md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-xl">
                <SelectField
                  label="Nível da Vaga"
                  value={weightJobLevel}
                  onChange={(v) => setWeightJobLevel(Number(v))}
                  options={WEIGHT_JOB_LEVEL}
                />
                <SelectField
                  label="Localidade"
                  value={weightLocation}
                  onChange={(v) => setWeightLocation(Number(v))}
                  options={WEIGHT_LOCATION}
                />
                <SelectField
                  label="Modelo de Trabalho"
                  value={weightWorkModel}
                  onChange={(v) => setWeightWorkModel(Number(v))}
                  options={WEIGHT_WORK_MODEL}
                />
                <SelectField
                  label="Urgência"
                  value={weightUrgency}
                  onChange={(v) => setWeightUrgency(Number(v))}
                  options={WEIGHT_URGENCY}
                />
                <SelectField
                  label="Facilidade do Perfil"
                  value={weightProfileDifficulty}
                  onChange={(v) => setWeightProfileDifficulty(Number(v))}
                  options={WEIGHT_PROFILE_DIFFICULTY}
                />
              </div>

              {result && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 px-2">
                    <span>Coeficiente: <strong className="text-metarh-medium text-lg">{result.totalWeight.toFixed(1)}</strong> / 10</span>
                    <span className="text-gray-500">Salário Referência Total: {fmtCurrency(result.referenceSalaryTotal)}</span>
                  </div>
                  <div className="bg-metarh-medium/10 border border-metarh-medium/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-metarh-medium" />
                      <span className="text-sm font-bold text-metarh-dark">
                        Sugestão de Equipe: <span className="text-metarh-medium">{result.suggestedTeam}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                      {result.totalWeight <= 3 && "Vaga tranquila, júnior dá conta sem sofrer. Custo menor, margem maior."}
                      {result.totalWeight > 3 && result.totalWeight <= 6 && "Vagas medianas, pleno segura a bronca. Custo ok, margem equilibrada."}
                      {result.totalWeight > 6 && "Vaga complexa, só sênior fecha rápido. Custo maior, mas evita retrabalho."}
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

              <div className="mb-6 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Equipe (Qtd Profissionais)</label>
                  <div className="w-40">
                    <label className="block text-[10px] font-bold text-metarh-medium uppercase mb-1">Dias Demandados</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputs.demandedDays || ''}
                        onChange={(e) => handleNumberChange('demandedDays', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-metarh-medium/30 focus:ring-2 focus:ring-metarh-medium outline-none text-center font-bold bg-white"
                        placeholder="0"
                      />
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        = {inputs.demandedDays * 9}h úteis
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="Equipe Senior" type="number" value={inputs.qtyConsultant2} onChange={(v) => handleNumberChange('qtyConsultant2', v)} />
                  <InputField label="Equipe Plena" type="number" value={inputs.qtyConsultant1} onChange={(v) => handleNumberChange('qtyConsultant1', v)} />
                  <InputField label="Equipe Junior" type="number" value={inputs.qtyAssistant} onChange={(v) => handleNumberChange('qtyAssistant', v)} />
                </div>

                {/* Team Totals */}
                {result && (
                  <div className="mt-4 bg-metarh-medium/10 border border-metarh-medium/30 rounded-lg p-3">
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
                        className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                        placeholder="Nome do item"
                      />
                      <div className="w-24">
                        <input
                          type="number"
                          value={item.cost || ''}
                          onChange={(e) => handleUpdateFixedItem(item.id, 'cost', e.target.value)}
                          className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-right"
                          placeholder="R$ Unit."
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleUpdateFixedItem(item.id, 'quantity', e.target.value)}
                          className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-center"
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
                  <div className="mt-4 bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-700">Total Custos Fixos:</span>
                      <span className="font-bold text-gray-900 text-lg">{fmtCurrency(result.fixedItemsCostTotal)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. MARGIN */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <DollarSign size={18} /> 3. Margem e Taxa
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Profit Margin */}
                <div className="bg-gradient-to-br from-metarh-lime/10 to-metarh-medium/10 border-2 border-metarh-lime/30 p-4 rounded-xl">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Margem de Lucro</label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={profitMarginPct}
                      onChange={(e) => setProfitMarginPct(parseFloat(e.target.value) || 0)}
                      className="w-20 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none font-bold text-center"
                    />
                    <span className="text-sm text-gray-600">%</span>
                    <span className="text-xs text-gray-500">sobre total operacional</span>
                  </div>
                  {result && (
                    <div className="bg-white/80 rounded-lg p-3 border border-metarh-lime/40">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600">Valor Total:</span>
                        <span className="text-lg font-bold text-metarh-medium">{fmtCurrency(result.totalOperationalCost + result.profitMargin)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Fee */}
                <div className="bg-gray-50 border-2 border-gray-300 p-4 rounded-xl">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Taxa Administrativa</label>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      step="1"
                      value={inputs.marginMultiplier}
                      onChange={(e) => handleNumberChange('marginMultiplier', e.target.value)}
                      className="w-20 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none font-bold text-center"
                    />
                    <span className="text-sm text-gray-600">%</span>
                    <span className="text-xs text-gray-500">sobre salário referência</span>
                  </div>
                  {result && (
                    <div className="bg-white rounded-lg p-3 border border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600">Valor Total:</span>
                        <span className="text-lg font-bold text-gray-900">{fmtCurrency(result.adminFee)}</span>
                      </div>
                    </div>
                  )}
                </div>
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
                    <Row label="Custo Equipe" value={fmtCurrency(result.teamCostTotal)} />
                    <Row label="Custos Fixos" value={fmtCurrency(result.fixedItemsCostTotal)} />
                    <Row label="Total Operacional" value={fmtCurrency(result.totalOperationalCost)} />

                    {/* Highlighted Reference Salary */}
                    {/* Highlighted Reference Salary */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 my-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-metarh-lime uppercase tracking-wider">Salário Referência</span>
                        <span className="text-xl font-bold text-white">{fmtCurrency(result.referenceSalaryTotal)}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 text-right mt-1">Base para cálculo da taxa</p>
                    </div>
                  </div>

                  {/* Pricing - Separate Box */}
                  <div className="bg-gradient-to-br from-metarh-lime/20 to-metarh-medium/20 border-2 border-metarh-lime rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-metarh-lime uppercase tracking-wider">Margem & Taxa</p>

                    {/* Profit Margin */}
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">Margem de Lucro</span>
                      <span className="text-2xl font-bold text-metarh-lime">{fmtCurrency(result.profitMargin)}</span>
                    </div>
                    <p className="text-xs text-gray-300 text-right -mt-1">
                      {profitMarginPct}% sobre total operacional
                    </p>

                    <div className="border-t border-white/20 my-2"></div>

                    {/* Admin Fee */}
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-white">Taxa Administrativa</span>
                      <span className="text-xl font-bold text-white">{fmtCurrency(result.adminFee)}</span>
                    </div>
                    <p className="text-xs text-gray-300 text-right -mt-1">
                      {inputs.marginMultiplier}% sobre salário referência
                    </p>
                  </div>

                  {/* Taxes Breakdown */}
                  <div className="bg-white/5 p-4 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-gray-300 mb-2 uppercase tracking-wider">Tributos (Adicionados)</p>
                    <Row label="ISS" value={fmtCurrency(result.taxIss)} small />
                    <Row label="PIS (1.65%)" value={fmtCurrency(result.taxPis)} small />
                    <Row label="COFINS (7.6%)" value={fmtCurrency(result.taxCofins)} small />
                    <Row label="IRRF (1.5%)" value={fmtCurrency(result.taxIrrf)} small />
                    <Row label="CSLL (1%)" value={fmtCurrency(result.taxCsll)} small />
                    <div className="pt-2 border-t border-white/10">
                      <Row label="Total Tributos" value={fmtCurrency(result.totalTaxes)} />
                    </div>
                  </div>

                  {/* Final */}
                  <div className="pt-2 space-y-3">
                    <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                      <p className="text-xs text-gray-300 uppercase font-bold mb-1">Total Bruto (NF)</p>
                      <p className="text-3xl font-bold text-white">{fmtCurrency(result.grossNF)}</p>
                    </div>

                    <div className="flex justify-between text-xs text-red-300 px-2">
                      <span>Retenção IR (1.5%)</span>
                      <span>- {fmtCurrency(result.retentionIR)}</span>
                    </div>

                    <div className="bg-metarh-lime p-4 rounded-2xl text-metarh-dark shadow-lg">
                      <p className="text-xs uppercase font-bold mb-1 opacity-80">Total Líquido (Recebido)</p>
                      <p className="text-3xl font-bold">{fmtCurrency(result.netLiquid)}</p>
                    </div>

                    {/* Real Profit Section */}
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400 p-4 rounded-2xl">
                      <p className="text-xs uppercase font-bold mb-2 text-purple-300 tracking-wider">💰 Lucro Real</p>
                      <p className="text-2xl font-bold text-white mb-1">{fmtCurrency(result.realProfit)}</p>
                      <p className="text-xs text-gray-300">
                        {result.profitMarginPercentage.toFixed(1)}% do valor recebido
                      </p>
                      <div className="mt-2 text-[10px] text-gray-400">
                        Líquido - Custos Equipe - Custos Fixos
                      </div>
                    </div>

                    {/* Fun Tips Section */}
                    <div className={`p-4 rounded-2xl border-2 ${result.realProfit < 0
                      ? 'bg-red-500/10 border-red-400'
                      : result.profitMarginPercentage < 10
                        ? 'bg-orange-500/10 border-orange-400'
                        : result.profitMarginPercentage < 20
                          ? 'bg-yellow-500/10 border-yellow-400'
                          : 'bg-green-500/10 border-green-400'
                      }`}>
                      <p className="text-xs font-bold mb-2 flex items-center gap-1">
                        {result.realProfit < 0 ? '🚨' : result.profitMarginPercentage < 10 ? '😅' : result.profitMarginPercentage < 20 ? '😉' : '🚀'}
                        <span className="text-white">Dica do Especialista</span>
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {result.realProfit < 0
                          ? 'Prejuízo à vista! Abortar missão ou renegociar urgente! A gente não trabalha de graça não, né? 🚨'
                          : result.profitMarginPercentage < 10
                            ? 'Eita! Margem apertada. Tente aumentar a taxa ou rever os custos fixos. Senão a gente paga pra trabalhar! 😅'
                            : result.profitMarginPercentage < 20
                              ? 'Margem ok, mas dá pra melhorar. Que tal um chorinho na taxa? Ou cortar uns custos fixos? 😉'
                              : 'Aí sim! Margem top. O comercial tá voando! Pode fechar sem medo. 🚀'
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (!result) return;
                      setIsSaving(true);

                      const proposalData = {
                        role_name: inputs.roleName,
                        vacancies: inputs.vacancies,
                        salary: inputs.salary,

                        weight_job_level: weightJobLevel,
                        weight_location: weightLocation,
                        weight_work_model: weightWorkModel,
                        weight_urgency: weightUrgency,
                        weight_profile_difficulty: weightProfileDifficulty,

                        demanded_days: inputs.demandedDays,
                        qty_senior: inputs.qtyConsultant2,
                        qty_plena: inputs.qtyConsultant1,
                        qty_junior: inputs.qtyAssistant,

                        fixed_items: inputs.fixedItems,

                        profit_margin_pct: profitMarginPct,
                        admin_fee_pct: inputs.marginMultiplier,

                        results: result
                      };

                      const { success, error } = await saveProposal(proposalData);
                      setIsSaving(false);

                      if (success) {
                        alert("Proposta salva com sucesso!");
                      } else {
                        alert("Erro ao salvar proposta: " + JSON.stringify(error));
                        console.error(error);
                      }
                    }}
                    disabled={isSaving}
                    className="w-full py-3 bg-white text-metarh-dark font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={18} /> Salvar Proposta
                      </>
                    )}
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

// --- SUB-COMPONENTS ---

const InputField: React.FC<{ label: string, type: string, value: any, onChange: (val: string) => void }> = ({ label, type, value, onChange }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-mono"
    />
  </div>
);

const SelectField: React.FC<{ label: string, value: number, onChange: (val: string) => void, options: { label: string, value: number }[] }> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm"
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