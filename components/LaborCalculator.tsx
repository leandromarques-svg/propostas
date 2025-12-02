import React, { useState, useEffect } from 'react';
import {
    Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle,
    FileText, Loader2, Sparkles, ChevronDown, ChevronUp, Settings, Briefcase
} from 'lucide-react';
import { SupabaseStatus } from './SupabaseStatus';
import {
    LABOR_CHARGES, LABOR_TAX_RATES, BENEFIT_OPTIONS, EXAM_OPTIONS, MINIMUM_WAGE
} from '../constants';
import { getTeamRates, TeamRates } from './lib/teamRatesService';

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
    const [recruitmentCostPercent, setRecruitmentCostPercent] = useState<number>(20); // Percentage default 20%

    // Recruitment Team State
    const [qtySenior, setQtySenior] = useState(0);
    const [qtyPlena, setQtyPlena] = useState(0);
    const [qtyJunior, setQtyJunior] = useState(0);
    const [demandedDays, setDemandedDays] = useState(0);
    const [teamRates, setTeamRates] = useState<TeamRates>({ senior: 150, plena: 100, junior: 60 });

    // Benefits Selection
    const [selectedMedicalPlan, setSelectedMedicalPlan] = useState<string>(BENEFIT_OPTIONS.medical[0].id);
    const [selectedDentalPlan, setSelectedDentalPlan] = useState<string>(BENEFIT_OPTIONS.dental[0].id);
    const [selectedWellhubPlan, setSelectedWellhubPlan] = useState<string>(BENEFIT_OPTIONS.wellhub[0].id);

    // Standard Benefits Toggle & Config
    const [hasTransport, setHasTransport] = useState(true);
    const [transportDays, setTransportDays] = useState(22);

    const [hasMeal, setHasMeal] = useState(true);
    const [mealDays, setMealDays] = useState(22);

    const [hasFood, setHasFood] = useState(true);
    const [hasLifeInsurance, setHasLifeInsurance] = useState(true);
    const [hasPharmacy, setHasPharmacy] = useState(true);
    const [hasGpsPoint, setHasGpsPoint] = useState(true);
    const [hasPlr, setHasPlr] = useState(true);

    // Custom Benefits
    const [customBenefits, setCustomBenefits] = useState<{ id: string, name: string, value: number }[]>([]);

    // Charges Config (Detailed)
    const [satRate, setSatRate] = useState<number>(LABOR_CHARGES.groupA.sat);
    const [showChargesConfig, setShowChargesConfig] = useState(false);

    // Fees
    const [backupFeePercent, setBackupFeePercent] = useState<number>(0.05); // Taxa de Backup default 5%
    const [adminFeePercent, setAdminFeePercent] = useState<number>(0.10); // Taxa Administrativa default 10%

    // Results State
    const [result, setResult] = useState<any>(null);

    // Load team rates
    useEffect(() => {
        const loadRates = async () => {
            const rates = await getTeamRates();
            setTeamRates(rates);
        };
        loadRates();
    }, []);

    // --- CALCULATIONS ---
    useEffect(() => {
        calculateLaborPricing();
    }, [
        positions, recruitmentType, recruitmentCostPercent,
        selectedMedicalPlan, selectedDentalPlan, selectedWellhubPlan,
        customBenefits, backupFeePercent, adminFeePercent,
        hasTransport, transportDays, hasMeal, mealDays, hasFood, hasLifeInsurance, hasPharmacy, hasGpsPoint, hasPlr,
        satRate, qtySenior, qtyPlena, qtyJunior, demandedDays, teamRates
    ]);

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

        // Charges (Encargos) - Detailed Calculation
        // Group A
        const groupAPercent =
            LABOR_CHARGES.groupA.inss +
            LABOR_CHARGES.groupA.sesi_sesc +
            LABOR_CHARGES.groupA.senai_senac +
            LABOR_CHARGES.groupA.incra +
            satRate + // Dynamic SAT
            LABOR_CHARGES.groupA.salario_educacao +
            LABOR_CHARGES.groupA.sebrae +
            LABOR_CHARGES.groupA.fgts;

        // Group B
        const groupBPercent = Object.values(LABOR_CHARGES.groupB).reduce((a, b) => a + b, 0);

        const groupAValue = totalGrossSalary * groupAPercent;
        const groupBValue = totalGrossSalary * groupBPercent;
        const totalCharges = groupAValue + groupBValue;

        // Benefits
        const medicalPlan = BENEFIT_OPTIONS.medical.find(p => p.id === selectedMedicalPlan);
        const dentalPlan = BENEFIT_OPTIONS.dental.find(p => p.id === selectedDentalPlan);
        const wellhubPlan = BENEFIT_OPTIONS.wellhub.find(p => p.id === selectedWellhubPlan);

        const medicalCost = (medicalPlan?.value || 0) * totalPositions;
        const dentalCost = (dentalPlan?.value || 0) * totalPositions;
        const wellhubCost = (wellhubPlan?.value || 0) * totalPositions;

        // Standard Benefits
        const transportCost = hasTransport ? (BENEFIT_OPTIONS.others.transport.defaultValue * transportDays) * totalPositions : 0;
        const mealCost = hasMeal ? (BENEFIT_OPTIONS.others.meal.defaultValue * mealDays) * totalPositions : 0;
        const foodCost = hasFood ? BENEFIT_OPTIONS.others.food.defaultValue * totalPositions : 0;
        const lifeInsuranceCost = hasLifeInsurance ? BENEFIT_OPTIONS.others.lifeInsurance.defaultValue * totalPositions : 0;
        const pharmacyCost = hasPharmacy ? BENEFIT_OPTIONS.others.pharmacy.defaultValue * totalPositions : 0;
        const gpsPointCost = hasGpsPoint ? BENEFIT_OPTIONS.others.gpsPoint.defaultValue * totalPositions : 0;
        const plrCost = hasPlr ? BENEFIT_OPTIONS.others.plr.defaultValue * totalPositions : 0;

        const customBenefitsCost = customBenefits.reduce((sum, item) => sum + item.value, 0) * totalPositions;

        const totalBenefits = medicalCost + dentalCost + wellhubCost +
            transportCost + mealCost + foodCost + lifeInsuranceCost +
            pharmacyCost + gpsPointCost + plrCost + customBenefitsCost;

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
        const totalOperationalCost = adminFeeBasis + adminFeeValue;

        // Recruitment Cost (Setup Fee)
        // Calculated as % of Total Base Salary
        const recruitmentFeeValue = totalBaseSalary * (recruitmentCostPercent / 100);

        // Recruitment Team Cost (Internal Cost)
        const hoursPerDay = 9;
        const projectHours = demandedDays * hoursPerDay;
        const teamCost = (
            (qtySenior * teamRates.senior) +
            (qtyPlena * teamRates.plena) +
            (qtyJunior * teamRates.junior)
        ) * projectHours;


        // Taxes (Tributos)
        const totalTaxRate =
            LABOR_TAX_RATES.iss +
            LABOR_TAX_RATES.pis +
            LABOR_TAX_RATES.cofins +
            LABOR_TAX_RATES.irrf +
            LABOR_TAX_RATES.csll;

        // Gross NF
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
            totalTaxRate,
            recruitmentFeeValue,
            teamCost
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
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={pos.nightShiftPercent * 100}
                                                                onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, nightShiftPercent: Number(e.target.value) / 100 } : p))}
                                                                className="w-16 p-1 text-sm border border-gray-300 rounded text-right"
                                                                placeholder="%"
                                                            />
                                                            <span className="text-gray-500 font-bold">%</span>
                                                        </div>
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

                                {/* Total Gross Salary Display */}
                                {result && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <div className="bg-metarh-medium/10 px-4 py-2 rounded-lg border border-metarh-medium/20">
                                            <span className="text-xs font-bold text-gray-600 uppercase mr-2">Total Salário Bruto:</span>
                                            <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.totalGrossSalary)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. CHARGES CONFIGURATION */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <button
                                onClick={() => setShowChargesConfig(!showChargesConfig)}
                                className="w-full flex justify-between items-center text-lg font-bold text-metarh-dark mb-2"
                            >
                                <span className="flex items-center gap-2"><Settings size={18} /> 2. Configuração de Encargos</span>
                                {showChargesConfig ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {showChargesConfig && (
                                <div className="mt-4 grid md:grid-cols-2 gap-6 animate-fade-in">
                                    {/* Group A */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-2">Grupo A</h3>
                                        <div className="space-y-2 text-xs text-gray-600">
                                            <div className="flex justify-between"><span>INSS</span><span>{fmtPercent(LABOR_CHARGES.groupA.inss)}</span></div>
                                            <div className="flex justify-between"><span>SESI/SESC</span><span>{fmtPercent(LABOR_CHARGES.groupA.sesi_sesc)}</span></div>
                                            <div className="flex justify-between"><span>SENAI/SENAC</span><span>{fmtPercent(LABOR_CHARGES.groupA.senai_senac)}</span></div>
                                            <div className="flex justify-between"><span>INCRA</span><span>{fmtPercent(LABOR_CHARGES.groupA.incra)}</span></div>
                                            <div className="flex justify-between items-center bg-white p-1 rounded border border-gray-200">
                                                <span className="font-bold text-metarh-medium">SAT (Ajustável)</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={(satRate * 100).toFixed(2)}
                                                        onChange={(e) => setSatRate(Number(e.target.value) / 100)}
                                                        className="w-16 p-1 text-right border-none bg-transparent outline-none font-bold"
                                                    />
                                                    <span>%</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between"><span>Salário Educação</span><span>{fmtPercent(LABOR_CHARGES.groupA.salario_educacao)}</span></div>
                                            <div className="flex justify-between"><span>SEBRAE</span><span>{fmtPercent(LABOR_CHARGES.groupA.sebrae)}</span></div>
                                            <div className="flex justify-between"><span>FGTS</span><span>{fmtPercent(LABOR_CHARGES.groupA.fgts)}</span></div>
                                            <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 mt-2">
                                                <span>Total Grupo A</span>
                                                <span>{fmtPercent(result?.groupAPercent || 0)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Group B */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-2">Grupo B</h3>
                                        <div className="space-y-2 text-xs text-gray-600">
                                            <div className="flex justify-between"><span>Férias + 1/3</span><span>{fmtPercent(LABOR_CHARGES.groupB.ferias_abono)}</span></div>
                                            <div className="flex justify-between"><span>INSS s/ Férias</span><span>{fmtPercent(LABOR_CHARGES.groupB.inss_ferias)}</span></div>
                                            <div className="flex justify-between"><span>FGTS s/ Férias</span><span>{fmtPercent(LABOR_CHARGES.groupB.fgts_ferias)}</span></div>
                                            <div className="flex justify-between"><span>13º Salário</span><span>{fmtPercent(LABOR_CHARGES.groupB.decimo_terceiro)}</span></div>
                                            <div className="flex justify-between"><span>INSS s/ 13º</span><span>{fmtPercent(LABOR_CHARGES.groupB.inss_decimo_terceiro)}</span></div>
                                            <div className="flex justify-between"><span>FGTS s/ 13º</span><span>{fmtPercent(LABOR_CHARGES.groupB.fgts_decimo_terceiro)}</span></div>
                                            <div className="flex justify-between"><span>Aviso Prévio</span><span>{fmtPercent(LABOR_CHARGES.groupB.aviso_previo)}</span></div>
                                            <div className="flex justify-between"><span>Depósito Rescisão</span><span>{fmtPercent(LABOR_CHARGES.groupB.deposito_rescisao)}</span></div>
                                            <div className="flex justify-between"><span>Auxílio Doença</span><span>{fmtPercent(LABOR_CHARGES.groupB.auxilio_doenca)}</span></div>
                                            <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 mt-2">
                                                <span>Total Grupo B</span>
                                                <span>{fmtPercent(result?.groupBPercent || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Highlighted Total Charges */}
                            <div className="mt-4 bg-metarh-medium/10 border border-metarh-medium/30 rounded-xl p-4 flex justify-between items-center">
                                <span className="text-sm font-bold text-metarh-dark uppercase">Total de Encargos (A + B)</span>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-metarh-medium">
                                        {fmtPercent((result?.groupAPercent || 0) + (result?.groupBPercent || 0))}
                                    </span>
                                    {result && (
                                        <div className="text-xs text-gray-500 font-bold">
                                            {fmtCurrency(result.totalCharges)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. BENEFITS */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Sparkles size={18} /> 3. Benefícios
                            </h2>

                            {/* Standard Benefits */}
                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Benefícios Padrão</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Vale Transporte */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasTransport}
                                                    onChange={(e) => setHasTransport(e.target.checked)}
                                                    className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
                                                />
                                                <span className="text-sm font-bold text-gray-700">{BENEFIT_OPTIONS.others.transport.name}</span>
                                            </label>
                                            <span className="text-xs text-gray-500">{fmtCurrency(BENEFIT_OPTIONS.others.transport.defaultValue)}/dia</span>
                                        </div>
                                        {hasTransport && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-500">Dias/Mês:</span>
                                                <input
                                                    type="number"
                                                    value={transportDays}
                                                    onChange={(e) => setTransportDays(Number(e.target.value))}
                                                    className="w-16 p-1 text-sm border border-gray-300 rounded"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Vale Refeição */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={hasMeal}
                                                    onChange={(e) => setHasMeal(e.target.checked)}
                                                    className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
                                                />
                                                <span className="text-sm font-bold text-gray-700">{BENEFIT_OPTIONS.others.meal.name}</span>
                                            </label>
                                            <span className="text-xs text-gray-500">{fmtCurrency(BENEFIT_OPTIONS.others.meal.defaultValue)}/dia</span>
                                        </div>
                                        {hasMeal && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-500">Dias/Mês:</span>
                                                <input
                                                    type="number"
                                                    value={mealDays}
                                                    onChange={(e) => setMealDays(Number(e.target.value))}
                                                    className="w-16 p-1 text-sm border border-gray-300 rounded"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Vale Alimentação */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasFood}
                                                onChange={(e) => setHasFood(e.target.checked)}
                                                className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
                                            />
                                            <span className="text-sm font-bold text-gray-700">{BENEFIT_OPTIONS.others.food.name}</span>
                                        </label>
                                        <span className="text-xs text-gray-500">{fmtCurrency(BENEFIT_OPTIONS.others.food.defaultValue)}</span>
                                    </div>

                                    {/* Seguro de Vida */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasLifeInsurance}
                                                onChange={(e) => setHasLifeInsurance(e.target.checked)}
                                                className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
                                            />
                                            <span className="text-sm font-bold text-gray-700">{BENEFIT_OPTIONS.others.lifeInsurance.name}</span>
                                        </label>
                                        <span className="text-xs text-gray-500">{fmtCurrency(BENEFIT_OPTIONS.others.lifeInsurance.defaultValue)}</span>
                                    </div>

                                    {/* Auxílio Farmácia */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasPharmacy}
                                                onChange={(e) => setHasPharmacy(e.target.checked)}
                                                className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
                                            />
                                            <span className="text-sm font-bold text-gray-700">{BENEFIT_OPTIONS.others.pharmacy.name}</span>
                                        </label>
                                        <span className="text-xs text-gray-500">{fmtCurrency(BENEFIT_OPTIONS.others.pharmacy.defaultValue)}</span>
                                    </div>

                                    {/* Controle de Ponto */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasGpsPoint}
                                                onChange={(e) => setHasGpsPoint(e.target.checked)}
                                                className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
                                            />
                                            <span className="text-sm font-bold text-gray-700">{BENEFIT_OPTIONS.others.gpsPoint.name}</span>
                                        </label>
                                        <span className="text-xs text-gray-500">{fmtCurrency(BENEFIT_OPTIONS.others.gpsPoint.defaultValue)}</span>
                                    </div>

                                    {/* PLR */}
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={hasPlr}
                                                onChange={(e) => setHasPlr(e.target.checked)}
                                                className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
                                            />
                                            <span className="text-sm font-bold text-gray-700">{BENEFIT_OPTIONS.others.plr.name}</span>
                                        </label>
                                        <span className="text-xs text-gray-500">{fmtCurrency(BENEFIT_OPTIONS.others.plr.defaultValue)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Medical Plan */}
                                <div className="grid md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <label className="text-xs font-bold text-gray-500 uppercase md:col-span-1">Plano Médico</label>
                                    <div className="md:col-span-2 flex gap-4">
                                        <select
                                            value={selectedMedicalPlan}
                                            onChange={(e) => setSelectedMedicalPlan(e.target.value)}
                                            className="flex-1 p-2 bg-white rounded-lg border border-gray-300 text-sm"
                                        >
                                            {BENEFIT_OPTIONS.medical.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                        <div className="w-32 p-2 bg-white rounded-lg border border-gray-300 text-sm font-bold text-right text-gray-700 flex items-center justify-end">
                                            {fmtCurrency(BENEFIT_OPTIONS.medical.find(p => p.id === selectedMedicalPlan)?.value || 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Dental Plan */}
                                <div className="grid md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <label className="text-xs font-bold text-gray-500 uppercase md:col-span-1">Plano Odontológico</label>
                                    <div className="md:col-span-2 flex gap-4">
                                        <select
                                            value={selectedDentalPlan}
                                            onChange={(e) => setSelectedDentalPlan(e.target.value)}
                                            className="flex-1 p-2 bg-white rounded-lg border border-gray-300 text-sm"
                                        >
                                            {BENEFIT_OPTIONS.dental.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                        <div className="w-32 p-2 bg-white rounded-lg border border-gray-300 text-sm font-bold text-right text-gray-700 flex items-center justify-end">
                                            {fmtCurrency(BENEFIT_OPTIONS.dental.find(p => p.id === selectedDentalPlan)?.value || 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Wellhub */}
                                <div className="grid md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <label className="text-xs font-bold text-gray-500 uppercase md:col-span-1">Wellhub (Gympass)</label>
                                    <div className="md:col-span-2 flex gap-4">
                                        <select
                                            value={selectedWellhubPlan}
                                            onChange={(e) => setSelectedWellhubPlan(e.target.value)}
                                            className="flex-1 p-2 bg-white rounded-lg border border-gray-300 text-sm"
                                        >
                                            {BENEFIT_OPTIONS.wellhub.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                        <div className="w-32 p-2 bg-white rounded-lg border border-gray-300 text-sm font-bold text-right text-gray-700 flex items-center justify-end">
                                            {fmtCurrency(BENEFIT_OPTIONS.wellhub.find(p => p.id === selectedWellhubPlan)?.value || 0)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Outros Benefícios (Personalizado)</label>
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
                        </div>

                        {/* 4. EXAMS (Separate Box) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <FileText size={18} /> 4. Exames Clínicos
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="space-y-2">
                                    {EXAM_OPTIONS.map(exam => (
                                        <div key={exam.id} className="flex justify-between text-sm text-gray-600 border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                            <span>{exam.name}</span>
                                            <span className="font-mono font-bold">{fmtCurrency(exam.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 5. FEES (Separate Box) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <DollarSign size={18} /> 5. Taxas
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Taxa de Backup (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={backupFeePercent * 100}
                                            onChange={(e) => setBackupFeePercent(Number(e.target.value) / 100)}
                                            className="w-20 p-2 bg-white rounded-lg border border-gray-300 text-sm font-bold text-center"
                                        />
                                        <span className="text-gray-500 font-bold">%</span>
                                        <div className="flex-1 text-right">
                                            <span className="text-sm font-bold text-gray-700">{fmtCurrency(result?.backupFeeValue || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Taxa Administrativa (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={adminFeePercent * 100}
                                            onChange={(e) => setAdminFeePercent(Number(e.target.value) / 100)}
                                            className="w-20 p-2 bg-white rounded-lg border border-gray-300 text-sm font-bold text-center"
                                        />
                                        <span className="text-gray-500 font-bold">%</span>
                                        <div className="flex-1 text-right">
                                            <span className="text-sm font-bold text-gray-700">{fmtCurrency(result?.adminFeeValue || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. RECRUITMENT (Separate Box) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Briefcase size={18} /> 6. Recrutamento e Seleção
                            </h2>

                            <div className="flex gap-4 mb-6">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <input
                                        type="radio"
                                        name="recruitmentType"
                                        value="indication"
                                        checked={recruitmentType === 'indication'}
                                        onChange={() => setRecruitmentType('indication')}
                                        className="text-metarh-medium accent-metarh-medium"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Indicação do Cliente (Sem custo)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <input
                                        type="radio"
                                        name="recruitmentType"
                                        value="selection"
                                        checked={recruitmentType === 'selection'}
                                        onChange={() => setRecruitmentType('selection')}
                                        className="text-metarh-medium accent-metarh-medium"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Recrutamento METARH</span>
                                </label>
                            </div>

                            {recruitmentType === 'selection' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Team Inputs (from Pricing Calculator) */}
                                    <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-xs font-bold text-gray-700 uppercase">Equipe de Recrutamento</label>
                                            <div className="w-40">
                                                <label className="block text-[10px] font-bold text-metarh-medium uppercase mb-1">Dias Demandados</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={demandedDays || ''}
                                                        onChange={(e) => setDemandedDays(Number(e.target.value))}
                                                        className="w-full px-3 py-2 rounded-lg border border-metarh-medium/30 focus:ring-2 focus:ring-metarh-medium outline-none text-center font-bold bg-white"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                        = {demandedDays * 9}h úteis
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipe Senior</label>
                                                <input
                                                    type="number"
                                                    value={qtySenior}
                                                    onChange={(e) => setQtySenior(Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipe Plena</label>
                                                <input
                                                    type="number"
                                                    value={qtyPlena}
                                                    onChange={(e) => setQtyPlena(Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipe Junior</label>
                                                <input
                                                    type="number"
                                                    value={qtyJunior}
                                                    onChange={(e) => setQtyJunior(Number(e.target.value))}
                                                    className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                />
                                            </div>
                                        </div>

                                        {/* Team Cost Display */}
                                        <div className="mt-4 bg-white/50 border border-purple-100 rounded-lg p-3 flex justify-between items-center">
                                            <span className="text-xs font-bold text-purple-900 uppercase">Custo da Equipe</span>
                                            <span className="text-lg font-bold text-purple-700">{fmtCurrency(result?.teamCost || 0)}</span>
                                        </div>
                                    </div>

                                    {/* Recruitment Fee Percentage */}
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold text-gray-700 uppercase">Taxa de Recrutamento (%)</label>
                                            <span className="text-xs text-gray-500">Sobre o salário base total</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={recruitmentCostPercent}
                                                onChange={(e) => setRecruitmentCostPercent(Number(e.target.value))}
                                                className="w-24 p-2 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-400 outline-none font-bold text-center text-purple-900"
                                                placeholder="%"
                                            />
                                            <span className="text-lg font-bold text-purple-900">%</span>
                                            <div className="flex-1 text-right">
                                                <span className="block text-xs text-gray-500">Valor Estimado (Setup)</span>
                                                <span className="text-lg font-bold text-purple-700">
                                                    {fmtCurrency(result?.recruitmentFeeValue || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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

                                    {recruitmentType === 'selection' && (
                                        <div className="mt-4 space-y-2">
                                            {result.recruitmentFeeValue > 0 && (
                                                <div className="p-3 bg-purple-900/50 rounded-xl border border-purple-500/30">
                                                    <p className="text-xs text-purple-200 uppercase font-bold">Custo Setup (R&S - {recruitmentCostPercent}%)</p>
                                                    <p className="text-xl font-bold text-white">{fmtCurrency(result.recruitmentFeeValue)}</p>
                                                    <p className="text-[10px] text-purple-300">Cobrança única</p>
                                                </div>
                                            )}
                                            {result.teamCost > 0 && (
                                                <div className="p-3 bg-purple-900/30 rounded-xl border border-purple-500/20">
                                                    <p className="text-xs text-purple-200 uppercase font-bold">Custo Equipe R&S</p>
                                                    <p className="text-lg font-bold text-white">{fmtCurrency(result.teamCost)}</p>
                                                    <p className="text-[10px] text-purple-300">Custo interno estimado</p>
                                                </div>
                                            )}
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
