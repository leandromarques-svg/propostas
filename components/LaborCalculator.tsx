import React, { useState, useEffect } from 'react';
import {
    Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle,
    FileText, Loader2, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { SupabaseStatus } from './SupabaseStatus';
import {
    LABOR_CHARGES, LABOR_TAX_RATES, BENEFIT_OPTIONS, EXAM_OPTIONS, MINIMUM_WAGE
} from '../constants';

interface LaborPosition {
    id: string;
    roleName: string;
    baseSalary: number;
    vacancies: number;
    hazardPay: 0 | 0.30 | 0.40; // Periculosidade
    unhealthinessLevel: 'none' | 'min' | 'med' | 'max'; // Insalubridade
    nightShift: boolean;
    nightShiftPercent: number; // Default 0.20
}

interface LaborCalculatorProps {
    onCancel: () => void;
}

export const LaborCalculator: React.FC<LaborCalculatorProps> = ({ onCancel }) => {
    // --- STATE ---
    const [positions, setPositions] = useState<LaborPosition[]>([{
        id: 'pos-1',
        roleName: '',
        baseSalary: 0,
        vacancies: 1,
        hazardPay: 0,
        unhealthinessLevel: 'none',
        nightShift: false,
        nightShiftPercent: 0.20
    }]);

    const [recruitmentType, setRecruitmentType] = useState<'indication' | 'selection'>('selection');
    const [recruitmentCost, setRecruitmentCost] = useState<number>(0); // If selection, maybe a flat fee or %? User said "igual como fizemos na calculadora de recrutamento". For now, let's make it an input.

    // Benefits Selection (Global for now, or per position? Usually global or per level. Let's assume global for simplicity first, or maybe per position is better? User said "poder selecionar qual o plano". Let's do global for now to start.)
    const [selectedMedicalPlan, setSelectedMedicalPlan] = useState<string>(BENEFIT_OPTIONS.medical[0].id);
    const [selectedWellhubPlan, setSelectedWellhubPlan] = useState<string>(BENEFIT_OPTIONS.wellhub[0].id);

    // Custom Benefits
    const [customBenefits, setCustomBenefits] = useState<{ id: string, name: string, value: number }[]>([]);

    // Fees
    const [backupFeePercent, setBackupFeePercent] = useState<number>(0.05); // Taxa de Backup default 5%?
    const [adminFeePercent, setAdminFeePercent] = useState<number>(0.10); // Taxa Administrativa default 10%?

    // Results State
    const [result, setResult] = useState<any>(null);

    // --- CALCULATIONS ---
    useEffect(() => {
        calculateLaborPricing();
    }, [positions, recruitmentType, recruitmentCost, selectedMedicalPlan, selectedWellhubPlan, customBenefits, backupFeePercent, adminFeePercent]);

    const calculateLaborPricing = () => {
        let totalBaseSalary = 0;
        let totalGrossSalary = 0;
        let totalPositions = 0;

        const positionsCalculated = positions.map(pos => {
            // 1. Base Salary
            const base = pos.baseSalary;

            // 2. Hazard Pay (Periculosidade) - % on Base Salary
            const hazardValue = base * pos.hazardPay;

            // 3. Unhealthiness (Insalubridade) - % on Minimum Wage
            let unhealthinessValue = 0;
            if (pos.unhealthinessLevel === 'min') unhealthinessValue = MINIMUM_WAGE * 0.10;
            if (pos.unhealthinessLevel === 'med') unhealthinessValue = MINIMUM_WAGE * 0.20;
            if (pos.unhealthinessLevel === 'max') unhealthinessValue = MINIMUM_WAGE * 0.40;

            // 4. Night Shift (Adicional Noturno) - % on Base Salary (usually)
            const nightShiftValue = pos.nightShift ? (base * pos.nightShiftPercent) : 0;

            // Gross Salary
            const gross = base + hazardValue + unhealthinessValue + nightShiftValue;

            totalBaseSalary += base * pos.vacancies;
            totalGrossSalary += gross * pos.vacancies;
            totalPositions += pos.vacancies;

            return { ...pos, gross, hazardValue, unhealthinessValue, nightShiftValue };
        });

        // Charges (Encargos)
        // Group A
        const groupAPercent = Object.values(LABOR_CHARGES.groupA).reduce((a, b) => a + b, 0);
        const groupAValue = totalGrossSalary * groupAPercent;

        // Group B
        const groupBPercent = Object.values(LABOR_CHARGES.groupB).reduce((a, b) => a + b, 0);
        const groupBValue = totalGrossSalary * groupBPercent;

        const totalCharges = groupAValue + groupBValue;

        // Benefits
        const medicalPlan = BENEFIT_OPTIONS.medical.find(p => p.id === selectedMedicalPlan);
        const wellhubPlan = BENEFIT_OPTIONS.wellhub.find(p => p.id === selectedWellhubPlan);

        const medicalCost = (medicalPlan?.value || 0) * totalPositions;
        const wellhubCost = (wellhubPlan?.value || 0) * totalPositions;
        const customBenefitsCost = customBenefits.reduce((sum, item) => sum + item.value, 0) * totalPositions;

        const totalBenefits = medicalCost + wellhubCost + customBenefitsCost;

        // Exams
        const totalExams = EXAM_OPTIONS.reduce((sum, item) => sum + item.value, 0) * totalPositions;

        // Subtotal for Fees (Salaries + Charges + Benefits + Exams)
        const costBasis = totalGrossSalary + totalCharges + totalBenefits + totalExams;

        // Fees
        const backupFeeValue = costBasis * backupFeePercent;

        // Admin Fee Basis: Cost Basis + Backup Fee
        const adminFeeBasis = costBasis + backupFeeValue;
        const adminFeeValue = adminFeeBasis * adminFeePercent;

        // Total Operational Cost (Custo Total)
        // Custo total por celetista administrado (soma dos valores totais)
        const totalOperationalCost = adminFeeBasis + adminFeeValue;

        // Recruitment Cost (One-time or amortized? Usually one-time. Let's keep it separate or add to first month? 
        // User said "Custo de equipe de recrutamento... igual como fizemos na calculadora de recrutamento".
        // For this calculator, it seems to be a monthly fee calculator ("Mão de obra"). 
        // Usually recruitment is charged separately or amortized. Let's display it but maybe not add to the monthly recurring total unless requested.
        // For now, let's calculate it but keep it distinct from the monthly "Gross NF".

        // Taxes (Tributos)
        // User: "ISS... PIS... COFINS... IRRF... CSLL... TOTAL - Tributos % - R$"
        // These taxes are usually on the Gross NF (Faturamento).
        // Gross NF = Total Operational Cost / (1 - Total Tax Rate)? Or is it added on top?
        // User: "Subtotal NF Serviço Bruto"
        // User: "Total Líquido a receber"
        // Usually: Net = Gross - Taxes.
        // If "Total Líquido a receber" is what we want to receive (the cost + profit), then Gross = Net / (1 - Taxes).

        const totalTaxRate =
            LABOR_TAX_RATES.iss +
            LABOR_TAX_RATES.pis +
            LABOR_TAX_RATES.cofins +
            LABOR_TAX_RATES.irrf +
            LABOR_TAX_RATES.csll;

        // If we treat "Total Operational Cost" as the Net Liquid we want:
        const grossNF = totalOperationalCost / (1 - totalTaxRate);
        const totalTaxes = grossNF * totalTaxRate;

        setResult({
            positionsCalculated,
            totalBaseSalary,
            totalGrossSalary,
            groupAValue,
            groupAPercent,
            groupBValue,
            groupBPercent,
            totalCharges,
            totalBenefits,
            totalExams,
            costBasis,
            backupFeeValue,
            adminFeeValue,
            totalOperationalCost,
            grossNF,
            totalTaxes,
            totalTaxRate
        });
    };

    const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const fmtPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32 animate-fade-in">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Calculadora CLT / Mão de Obra</h1>
                        <p className="text-gray-500 mt-1">Precificação de mão de obra administrada e temporária</p>
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

                    {/* LEFT COLUMN - INPUTS */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. POSITIONS */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Users size={18} /> 1. Cargos e Salários
                            </h2>

                            <div className="space-y-4">
                                {positions.map((pos, idx) => (
                                    <div key={pos.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-sm font-bold text-gray-700">Cargo {idx + 1}</h3>
                                            {positions.length > 1 && (
                                                <button
                                                    onClick={() => setPositions(positions.filter(p => p.id !== pos.id))}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Cargo</label>
                                                <input
                                                    type="text"
                                                    value={pos.roleName}
                                                    onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, roleName: e.target.value } : p))}
                                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                    placeholder="Ex: Analista Administrativo"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd Vagas</label>
                                                    <input
                                                        type="number"
                                                        value={pos.vacancies}
                                                        onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, vacancies: Number(e.target.value) } : p))}
                                                        className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salário Base</label>
                                                    <input
                                                        type="number"
                                                        value={pos.baseSalary}
                                                        onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, baseSalary: Number(e.target.value) } : p))}
                                                        className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Periculosidade</label>
                                                <select
                                                    value={pos.hazardPay}
                                                    onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, hazardPay: Number(e.target.value) as any } : p))}
                                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                >
                                                    <option value={0}>Não se aplica</option>
                                                    <option value={0.30}>30%</option>
                                                    <option value={0.40}>40%</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Insalubridade</label>
                                                <select
                                                    value={pos.unhealthinessLevel}
                                                    onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, unhealthinessLevel: e.target.value as any } : p))}
                                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                >
                                                    <option value="none">Não se aplica</option>
                                                    <option value="min">Mínimo (10%)</option>
                                                    <option value="med">Médio (20%)</option>
                                                    <option value="max">Máximo (40%)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adicional Noturno</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={pos.nightShift}
                                                        onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, nightShift: e.target.checked } : p))}
                                                        className="w-4 h-4 text-metarh-medium rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">Sim</span>
                                                    {pos.nightShift && (
                                                        <input
                                                            type="number"
                                                            value={pos.nightShiftPercent * 100}
                                                            onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, nightShiftPercent: Number(e.target.value) / 100 } : p))}
                                                            className="w-16 p-1 text-sm border border-gray-300 rounded"
                                                            placeholder="%"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => setPositions([...positions, {
                                        id: `pos-${Date.now()}`,
                                        roleName: '',
                                        baseSalary: 0,
                                        vacancies: 1,
                                        hazardPay: 0,
                                        unhealthinessLevel: 'none',
                                        nightShift: false,
                                        nightShiftPercent: 0.20
                                    }])}
                                    className="flex items-center gap-2 text-sm font-bold text-metarh-medium hover:underline"
                                >
                                    <Plus size={16} /> Adicionar Cargo
                                </button>
                            </div>
                        </div>

                        {/* 2. BENEFITS & EXAMS */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Sparkles size={18} /> 2. Benefícios e Exames
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plano Médico</label>
                                    <select
                                        value={selectedMedicalPlan}
                                        onChange={(e) => setSelectedMedicalPlan(e.target.value)}
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                    >
                                        {BENEFIT_OPTIONS.medical.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.name} - {fmtCurrency(opt.value)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Wellhub (Gympass)</label>
                                    <select
                                        value={selectedWellhubPlan}
                                        onChange={(e) => setSelectedWellhubPlan(e.target.value)}
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                    >
                                        {BENEFIT_OPTIONS.wellhub.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.name} - {fmtCurrency(opt.value)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Outros Benefícios</label>
                                {customBenefits.map((item, idx) => (
                                    <div key={item.id} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => {
                                                const newBenefits = [...customBenefits];
                                                newBenefits[idx].name = e.target.value;
                                                setCustomBenefits(newBenefits);
                                            }}
                                            className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                                            placeholder="Nome do benefício"
                                        />
                                        <input
                                            type="number"
                                            value={item.value}
                                            onChange={(e) => {
                                                const newBenefits = [...customBenefits];
                                                newBenefits[idx].value = Number(e.target.value);
                                                setCustomBenefits(newBenefits);
                                            }}
                                            className="w-24 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                                            placeholder="Valor"
                                        />
                                        <button onClick={() => setCustomBenefits(customBenefits.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setCustomBenefits([...customBenefits, { id: `ben-${Date.now()}`, name: '', value: 0 }])}
                                    className="text-xs font-bold text-metarh-medium hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> Adicionar Benefício
                                </button>
                            </div>

                            <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                                <h3 className="text-xs font-bold text-gray-700 uppercase mb-3">Exames Clínicos (Padrão)</h3>
                                <div className="space-y-2">
                                    {EXAM_OPTIONS.map(exam => (
                                        <div key={exam.id} className="flex justify-between text-sm text-gray-600">
                                            <span>{exam.name}</span>
                                            <span className="font-mono">{fmtCurrency(exam.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 3. FEES & RECRUITMENT */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <DollarSign size={18} /> 3. Taxas e Recrutamento
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Taxa de Backup (%)</label>
                                    <input
                                        type="number"
                                        value={backupFeePercent * 100}
                                        onChange={(e) => setBackupFeePercent(Number(e.target.value) / 100)}
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Taxa Administrativa (%)</label>
                                    <input
                                        type="number"
                                        value={adminFeePercent * 100}
                                        onChange={(e) => setAdminFeePercent(Number(e.target.value) / 100)}
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Recrutamento e Seleção</label>
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="recruitmentType"
                                            value="indication"
                                            checked={recruitmentType === 'indication'}
                                            onChange={() => setRecruitmentType('indication')}
                                            className="text-metarh-medium"
                                        />
                                        <span className="text-sm text-gray-700">Indicação do Cliente (Sem custo)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="recruitmentType"
                                            value="selection"
                                            checked={recruitmentType === 'selection'}
                                            onChange={() => setRecruitmentType('selection')}
                                            className="text-metarh-medium"
                                        />
                                        <span className="text-sm text-gray-700">Recrutamento METARH</span>
                                    </label>
                                </div>

                                {recruitmentType === 'selection' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo do Recrutamento (Único)</label>
                                        <input
                                            type="number"
                                            value={recruitmentCost}
                                            onChange={(e) => setRecruitmentCost(Number(e.target.value))}
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                            placeholder="R$ 0,00"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN - RESULTS */}
                    <div className="lg:col-span-1">
                        <div className="bg-metarh-dark text-white p-8 rounded-[2.5rem] shadow-xl sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <BarChart3 size={24} className="text-metarh-lime" /> Resultado
                            </h2>

                            {result && (
                                <div className="space-y-4 text-sm">

                                    {/* Salaries */}
                                    <div className="pb-4 border-b border-white/10">
                                        <div className="flex justify-between text-gray-300">
                                            <span>Total Salários Base</span>
                                            <span>{fmtCurrency(result.totalBaseSalary)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-white mt-1">
                                            <span>Total Salários Bruto</span>
                                            <span>{fmtCurrency(result.totalGrossSalary)}</span>
                                        </div>
                                    </div>

                                    {/* Charges */}
                                    <div className="pb-4 border-b border-white/10">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Encargos</p>
                                        <div className="flex justify-between text-gray-300 text-xs">
                                            <span>Grupo A ({fmtPercent(result.groupAPercent)})</span>
                                            <span>{fmtCurrency(result.groupAValue)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300 text-xs">
                                            <span>Grupo B ({fmtPercent(result.groupBPercent)})</span>
                                            <span>{fmtCurrency(result.groupBValue)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-white mt-1">
                                            <span>Total Encargos</span>
                                            <span>{fmtCurrency(result.totalCharges)}</span>
                                        </div>
                                    </div>

                                    {/* Benefits & Exams */}
                                    <div className="pb-4 border-b border-white/10">
                                        <div className="flex justify-between text-gray-300">
                                            <span>Total Benefícios</span>
                                            <span>{fmtCurrency(result.totalBenefits)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-300">
                                            <span>Total Exames</span>
                                            <span>{fmtCurrency(result.totalExams)}</span>
                                        </div>
                                    </div>

                                    {/* Fees */}
                                    <div className="pb-4 border-b border-white/10">
                                        <div className="flex justify-between text-gray-300">
                                            <span>Taxa Backup ({fmtPercent(backupFeePercent)})</span>
                                            <span>{fmtCurrency(result.backupFeeValue)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-metarh-lime mt-1">
                                            <span>Taxa Administrativa ({fmtPercent(adminFeePercent)})</span>
                                            <span>{fmtCurrency(result.adminFeeValue)}</span>
                                        </div>
                                    </div>

                                    {/* Operational Cost */}
                                    <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                                        <p className="text-xs text-gray-300 uppercase font-bold mb-1">Custo Total Operacional</p>
                                        <p className="text-2xl font-bold text-white">{fmtCurrency(result.totalOperationalCost)}</p>
                                        <p className="text-[10px] text-gray-400 text-right">Por mês</p>
                                    </div>

                                    {/* Taxes */}
                                    <div className="text-xs text-gray-400 space-y-1">
                                        <p className="font-bold uppercase text-gray-500">Impostos ({fmtPercent(result.totalTaxRate)})</p>
                                        <div className="flex justify-between">
                                            <span>Total Tributos</span>
                                            <span>{fmtCurrency(result.totalTaxes)}</span>
                                        </div>
                                    </div>

                                    {/* Final Gross NF */}
                                    <div className="bg-metarh-lime p-4 rounded-2xl text-metarh-dark shadow-lg mt-4">
                                        <p className="text-xs uppercase font-bold mb-1 opacity-80">Valor Bruto da NF</p>
                                        <p className="text-3xl font-bold">{fmtCurrency(result.grossNF)}</p>
                                    </div>

                                    {recruitmentType === 'selection' && recruitmentCost > 0 && (
                                        <div className="mt-4 p-3 bg-purple-900/50 rounded-xl border border-purple-500/30">
                                            <p className="text-xs text-purple-200 uppercase font-bold">Custo Setup (R&S)</p>
                                            <p className="text-xl font-bold text-white">{fmtCurrency(recruitmentCost)}</p>
                                            <p className="text-[10px] text-purple-300">Cobrança única</p>
                                        </div>
                                    )}

                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
