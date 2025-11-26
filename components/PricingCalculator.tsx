import React, { useState, useEffect } from 'react';
import { ProjectPricingInputs, PricingResult, FixedCostItem } from '../types';
import { WEIGHT_TABLES, HOURLY_RATES, DEFAULT_FIXED_ITEMS, TAX_RATES } from '../constants';
import { Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle } from 'lucide-react';

interface PricingCalculatorProps {
  onCancel: () => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onCancel }) => {
  // --- STATE ---
  const [inputs, setInputs] = useState<ProjectPricingInputs>({
    roleName: '',
    vacancies: 1,
    salary: 0,
    weightRole: 1.0, // Default Assistente
    weightComplexity: 1.0, // Default Baixo
    weightUrgency: 1.0, // Default Baixo
    weightVolume: 1.0, // Default Ate 20
    // FIX: Renamed 'estimatedProjectHours' to 'demandedDays' to match the type definition.
    demandedDays: 0,
    qtyConsultant2: 0,
    qtyConsultant1: 0,
    qtyAssistant: 0,
    fixedItems: DEFAULT_FIXED_ITEMS,
    marginMultiplier: 1.25, // Default Adjusted
    selectedCity: 'São Paulo - SP'
  });

  const [result, setResult] = useState<PricingResult | null>(null);

  // --- CALCULATION LOGIC ---
  useEffect(() => {
    calculatePricing();
  }, [inputs]);

  const calculatePricing = () => {
    const {
      vacancies, salary,
      weightRole, weightComplexity, weightUrgency, weightVolume,
      // FIX: Renamed 'estimatedProjectHours' to 'demandedDays'.
      demandedDays,
      qtyConsultant2, qtyConsultant1, qtyAssistant,
      fixedItems,
      marginMultiplier, selectedCity
    } = inputs;

    // 1. Coefficients & Suggested Margin
    const totalWeight = weightRole + weightComplexity + weightUrgency + weightVolume;
    const maxWeight = 8;
    const weightPercentage = (totalWeight / maxWeight) * 100;
    
    // Suggestion Logic (Simple heuristic based on prompts)
    let suggestedMargin = 1.15;
    if (totalWeight > 6) suggestedMargin = 1.50;
    else if (totalWeight > 4) suggestedMargin = 1.25;

    // 2. Operational Costs
    const teamHourlyCost = 
      (qtyConsultant2 * HOURLY_RATES.consultant2) +
      (qtyConsultant1 * HOURLY_RATES.consultant1) +
      (qtyAssistant * HOURLY_RATES.assistant);
    
    // Calculate Total Team Cost based on Demand Hours
    // FIX: Renamed 'estimatedProjectHours' to 'demandedDays'.
    const teamCostTotal = teamHourlyCost * demandedDays;

    const fixedItemsCostTotal = fixedItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
    const totalOperationalCost = teamCostTotal + fixedItemsCostTotal;

    // 3. Pricing (Admin Fee)
    // User manually inputs marginMultiplier, applied to Operational Costs
    const adminFee = totalOperationalCost * marginMultiplier;

    // 4. Taxes
    const issRate = TAX_RATES.issOptions.find(c => c.city === selectedCity)?.rate || 0.05;
    
    const taxIss = adminFee * issRate;
    const taxPis = adminFee * TAX_RATES.pis;
    const taxCofins = adminFee * TAX_RATES.cofins;
    const taxIrrf = adminFee * TAX_RATES.irrf;
    const taxCsll = adminFee * TAX_RATES.csll;
    
    const totalTaxes = taxIss + taxPis + taxCofins + taxIrrf + taxCsll;

    // 5. Final
    const grossNF = adminFee + totalTaxes;
    const retentionIR = grossNF * TAX_RATES.retentionIR; // 1.5% on Gross
    const netLiquid = grossNF - retentionIR;

    setResult({
      totalWeight,
      weightPercentage,
      suggestedMargin,
      teamCostTotal,
      fixedItemsCostTotal,
      totalOperationalCost,
      adminFee,
      referenceSalaryTotal: salary * vacancies, // Multiplier fixed
      taxIss,
      taxPis,
      taxCofins,
      taxIrrf,
      taxCsll,
      totalTaxes,
      grossNF,
      retentionIR,
      netLiquid
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-metarh-dark flex items-center gap-3">
              <Calculator size={32} className="text-metarh-medium" /> Precificação de Projetos
            </h1>
            <p className="text-gray-500 mt-1">Calculadora baseada em custos operacionais e tributação SP.</p>
          </div>
          <button onClick={onCancel} className="px-6 py-2 border rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
            Voltar
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: INPUTS --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. SCOPE & COMPLEXITY */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <Users size={18} /> 1. Escopo e Complexidade
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <InputField label="Cargo" type="text" value={inputs.roleName} onChange={(v) => setInputs(p => ({...p, roleName: v}))} />
                <InputField label="Vagas (Qtd)" type="number" value={inputs.vacancies} onChange={(v) => handleNumberChange('vacancies', v)} />
                <InputField label="Salário Base (R$)" type="number" value={inputs.salary} onChange={(v) => handleNumberChange('salary', v)} />
              </div>

              <div className="grid md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                <SelectField 
                  label="Nível do Cargo" 
                  value={inputs.weightRole} 
                  onChange={(v) => handleSelectChange('weightRole', Number(v))}
                  options={WEIGHT_TABLES.roles}
                />
                <SelectField 
                  label="Complexidade" 
                  value={inputs.weightComplexity} 
                  onChange={(v) => handleSelectChange('weightComplexity', Number(v))}
                  options={WEIGHT_TABLES.complexity}
                />
                <SelectField 
                  label="Urgência" 
                  value={inputs.weightUrgency} 
                  onChange={(v) => handleSelectChange('weightUrgency', Number(v))}
                  options={WEIGHT_TABLES.urgency}
                />
                <SelectField 
                  label="Volumetria" 
                  value={inputs.weightVolume} 
                  onChange={(v) => handleSelectChange('weightVolume', Number(v))}
                  options={WEIGHT_TABLES.volume}
                />
              </div>
              
              {result && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 px-2">
                  <span>Coeficiente: <strong>{result.totalWeight.toFixed(2)}</strong></span>
                  <span className="text-metarh-medium font-bold">Salário Referência Total: {fmtCurrency(result.referenceSalaryTotal)}</span>
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
                        <label className="block text-[10px] font-bold text-metarh-medium uppercase mb-1">Total de Horas Demandadas</label>
                        <input 
                            type="number" 
                            // FIX: Renamed 'estimatedProjectHours' to 'demandedDays'.
                            value={inputs.demandedDays || ''} 
                            // FIX: Renamed 'estimatedProjectHours' to 'demandedDays'.
                            onChange={(e) => handleNumberChange('demandedDays', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-metarh-medium/30 focus:ring-2 focus:ring-metarh-medium outline-none text-center font-bold bg-white"
                            placeholder="0"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="Consultor 2" type="number" value={inputs.qtyConsultant2} onChange={(v) => handleNumberChange('qtyConsultant2', v)} />
                  <InputField label="Consultor 1" type="number" value={inputs.qtyConsultant1} onChange={(v) => handleNumberChange('qtyConsultant1', v)} />
                  <InputField label="Assistente" type="number" value={inputs.qtyAssistant} onChange={(v) => handleNumberChange('qtyAssistant', v)} />
                </div>
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
              </div>
            </div>

            {/* 3. MARGIN & TAXES */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <DollarSign size={18} /> 3. Margem e Tributação
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Margem de Lucro</label>
                    <div className="flex items-center gap-2 mb-2">
                        <input 
                            type="number" 
                            step="0.01"
                            value={inputs.marginMultiplier}
                            onChange={(e) => handleNumberChange('marginMultiplier', e.target.value)}
                            className="w-24 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none font-bold text-center"
                        />
                        <span className="text-sm text-gray-600">Multiplicador</span>
                    </div>
                    {result && (
                        <div className="flex items-center gap-2 text-xs text-metarh-medium">
                            <AlertCircle size={12} />
                            <span>Sugestão (Peso): {result.suggestedMargin.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Localidade (ISS)</label>
                  <select 
                    value={inputs.selectedCity}
                    onChange={(e) => handleSelectChange('selectedCity', e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none text-sm"
                  >
                    {TAX_RATES.issOptions.map((opt, idx) => (
                      <option key={idx} value={opt.city}>{opt.city} ({fmtPercent(opt.rate)})</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-2">
                    Aplicando PIS (1.65%), COFINS (7.6%), IRRF (1.5%), CSLL (1%)
                  </p>
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
                    <Row label="Total Operacional" value={fmtCurrency(result.totalOperationalCost)} highlight />
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 pb-4 border-b border-white/10">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-300">Taxa Administrativa</span>
                        <span className="text-xl font-bold text-metarh-lime">{fmtCurrency(result.adminFee)}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-right">
                       Baseado na margem {inputs.marginMultiplier}x
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
                  </div>

                  <button 
                    onClick={() => alert("Proposta salva no histórico!")}
                    className="w-full py-3 bg-white text-metarh-dark font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mt-4"
                  >
                    <DollarSign size={18} /> Salvar Proposta
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