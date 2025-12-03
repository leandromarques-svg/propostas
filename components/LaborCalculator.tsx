import React, { useState, useEffect } from 'react';
import {
    Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle,
    FileText, Loader2, Sparkles, ChevronDown, ChevronUp, Settings, Briefcase, Clock, Info
} from 'lucide-react';
import { SupabaseStatus } from './SupabaseStatus';
import {
    LABOR_CHARGES, LABOR_TAX_RATES, BENEFIT_OPTIONS, EXAM_OPTIONS, MINIMUM_WAGE
} from '../constants';
import { getTeamRates, TeamRates } from './lib/teamRatesService';
import { getAppSettings, AppSettings } from './lib/settingsService';
import { Logo } from './Logo';

interface LaborPosition {
    id: string;
    roleName: string;
    baseSalary: number;
    vacancies: number;
    hazardPay: 0 | 0.30 | 0.40; // Periculosidade
    unhealthinessLevel: 'none' | 'min' | 'med' | 'max'; // Insalubridade
    nightShift: boolean;
    nightShiftPercent: number; // Default 0.20
    isHourly: boolean; // Horista
    isDailyWorker: boolean; // Diarista
    hoursPerMonth: number; // Divisor de horas (Referência)
    daysPerMonth: number; // Divisor de dias (Referência)
    hoursQuantity: number; // Quantidade de horas a pagar
    daysQuantity: number; // Quantidade de dias a pagar
}

interface LaborCalculatorProps {
    onCancel: () => void;
}

type ProvisioningMode = 'full' | 'semi' | 'none';

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
        nightShiftPercent: 0.20,
        isHourly: false,
        isDailyWorker: false,
        hoursPerMonth: 220,
        daysPerMonth: 22,
        hoursQuantity: 0,
        daysQuantity: 0
    }]);

    const [provisioningMode, setProvisioningMode] = useState<ProvisioningMode>('full');

    const [recruitmentType, setRecruitmentType] = useState<'indication' | 'selection'>('selection');
    // Removed recruitmentCostPercent

    // Recruitment Team State
    const [qtySenior, setQtySenior] = useState(0);
    const [qtyPlena, setQtyPlena] = useState(0);
    const [qtyJunior, setQtyJunior] = useState(0);
    const [demandedDays, setDemandedDays] = useState(0);
    const [teamRates, setTeamRates] = useState<TeamRates>({ senior: 150, plena: 100, junior: 60 });
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

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
    // Removed showChargesConfig (Always visible)

    // Fees
    const [backupFeePercent, setBackupFeePercent] = useState<number>(0.05); // Taxa de Backup default 5%
    const [adminFeePercent, setAdminFeePercent] = useState<number>(0.10); // Taxa Administrativa default 10%

    // Results State
    const [result, setResult] = useState<any>(null);

    // Load team rates and app settings
    useEffect(() => {
        const loadData = async () => {
            const [rates, settings] = await Promise.all([
                getTeamRates(),
                getAppSettings()
            ]);
            setTeamRates(rates);
            setAppSettings(settings);

            // Update defaults from settings
            if (settings) {
                setSatRate(settings.sat_rate);

                // Update benefit defaults if not already set (optional, but good for initial load)
                // For now, we just ensure the options are available for selection
                if (settings.benefit_options.medical.length > 0) setSelectedMedicalPlan(settings.benefit_options.medical[0].id);
                if (settings.benefit_options.dental.length > 0) setSelectedDentalPlan(settings.benefit_options.dental[0].id);
                if (settings.benefit_options.wellhub.length > 0) setSelectedWellhubPlan(settings.benefit_options.wellhub[0].id);
            }
        };
        loadData();
    }, []);

    // --- CALCULATIONS ---
    useEffect(() => {
        calculateLaborPricing();
    }, [
        positions, recruitmentType, provisioningMode,
        selectedMedicalPlan, selectedDentalPlan, selectedWellhubPlan,
        customBenefits, backupFeePercent, adminFeePercent,
        hasTransport, transportDays, hasMeal, mealDays, hasFood, hasLifeInsurance, hasPharmacy, hasGpsPoint, hasPlr,
        satRate, qtySenior, qtyPlena, qtyJunior, demandedDays, teamRates, appSettings,
        // Add exams to dependency if we make them dynamic state
    ]);

    const calculateLaborPricing = () => {
        let totalBaseSalary = 0;
        let totalGrossSalary = 0;
        let totalPositions = 0;

        const positionsCalculated = positions.map(pos => {
            // 1. Base Salary
            const base = pos.baseSalary;

            // Hourly and Daily Rate Calculations (Reference)
            // Hourly and Daily Rate Calculations (Standard 220h / 22d)
            const hourlyRate = base / 220;
            const dailyRate = base / 22;

            // 2. Hazard Pay (Periculosidade) - % on Base Salary (or calculated base?)
            // Usually Hazard Pay is on the base salary. If hourly, it should be on the hourly earnings?
            // Let's assume it applies to the "Effective Base" (earnings).

            // 3. Unhealthiness (Insalubridade) - % on Minimum Wage
            let unhealthinessValue = 0;
            const minimumWage = appSettings?.minimum_wage || MINIMUM_WAGE;
            if (pos.unhealthinessLevel === 'min') unhealthinessValue = minimumWage * 0.10;
            if (pos.unhealthinessLevel === 'med') unhealthinessValue = minimumWage * 0.20;
            if (pos.unhealthinessLevel === 'max') unhealthinessValue = minimumWage * 0.40;

            // 4. Night Shift (Adicional Noturno) - % on Base Salary (usually)
            // If hourly, on hourly earnings.

            // 5. Hourly/Daily Worker Additional Value
            let effectiveBase = base; // Default to monthly base

            if (pos.isHourly) {
                // hoursPerMonth is the quantity of hours to be paid
                effectiveBase = hourlyRate * pos.hoursPerMonth;
            } else if (pos.isDailyWorker) {
                // daysPerMonth is the quantity of days to be paid
                effectiveBase = dailyRate * pos.daysPerMonth;
            }

            const hazardValue = effectiveBase * pos.hazardPay;
            const nightShiftValue = pos.nightShift ? (effectiveBase * pos.nightShiftPercent) : 0;

            // Gross Salary
            const gross = effectiveBase + hazardValue + unhealthinessValue + nightShiftValue;

            totalBaseSalary += effectiveBase * pos.vacancies;
            totalGrossSalary += gross * pos.vacancies;
            totalPositions += pos.vacancies;

            return { ...pos, gross, hazardValue, unhealthinessValue, nightShiftValue, hourlyRate, dailyRate, effectiveBase };
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

        // Group B Logic based on Provisioning Mode
        let groupBPercent = 0;
        let groupBItems = { ...LABOR_CHARGES.groupB }; // Copy to modify if needed

        if (provisioningMode === 'none') {
            groupBPercent = 0;
            // Zero out items for display
            Object.keys(groupBItems).forEach(k => groupBItems[k as keyof typeof groupBItems] = 0);
        } else if (provisioningMode === 'semi') {
            // Remove: Aviso Prévio, Depósito Rescisão, Auxílio Doença
            // Note: User said "Aviso Prévio Indenizado + FGTS + INSS".
            // Usually 'aviso_previo' covers the cost.
            // We will zero out specific keys.
            groupBItems.aviso_previo = 0;
            groupBItems.deposito_rescisao = 0;
            groupBItems.auxilio_doenca = 0;
            // Recalculate sum
            groupBPercent = Object.values(groupBItems).reduce((a, b) => a + b, 0);
        } else {
            // Full
            groupBPercent = Object.values(LABOR_CHARGES.groupB).reduce((a, b) => a + b, 0);
        }

        const groupAValue = totalGrossSalary * groupAPercent;
        const groupBValue = totalGrossSalary * groupBPercent;
        const totalCharges = groupAValue + groupBValue;

        // Benefits - Use dynamic values from appSettings
        const medicalOptions = appSettings?.benefit_options.medical || BENEFIT_OPTIONS.medical;
        const dentalOptions = appSettings?.benefit_options.dental || BENEFIT_OPTIONS.dental;
        const wellhubOptions = appSettings?.benefit_options.wellhub || BENEFIT_OPTIONS.wellhub;
        const othersOptions = appSettings?.benefit_options.others || {};

        const medicalPlan = medicalOptions.find(p => p.id === selectedMedicalPlan);
        const dentalPlan = dentalOptions.find(p => p.id === selectedDentalPlan);
        const wellhubPlan = wellhubOptions.find(p => p.id === selectedWellhubPlan);

        const medicalCost = (medicalPlan?.value || 0) * totalPositions;
        const dentalCost = (dentalPlan?.value || 0) * totalPositions;
        const wellhubCost = (wellhubPlan?.value || 0) * totalPositions;

        // Standard Benefits - Use dynamic values
        const transportCost = hasTransport ? ((othersOptions.transport || BENEFIT_OPTIONS.others.transport.defaultValue) * transportDays) * totalPositions : 0;
        const mealCost = hasMeal ? ((othersOptions.meal || BENEFIT_OPTIONS.others.meal.defaultValue) * mealDays) * totalPositions : 0;
        const foodCost = hasFood ? (othersOptions.food || BENEFIT_OPTIONS.others.food.defaultValue) * totalPositions : 0;
        const lifeInsuranceCost = hasLifeInsurance ? (othersOptions.lifeInsurance || BENEFIT_OPTIONS.others.lifeInsurance.defaultValue) * totalPositions : 0;
        const pharmacyCost = hasPharmacy ? (othersOptions.pharmacy || BENEFIT_OPTIONS.others.pharmacy.defaultValue) * totalPositions : 0;
        const gpsPointCost = hasGpsPoint ? (othersOptions.gpsPoint || BENEFIT_OPTIONS.others.gpsPoint.defaultValue) * totalPositions : 0;
        const plrCost = hasPlr ? (othersOptions.plr || BENEFIT_OPTIONS.others.plr.defaultValue) * totalPositions : 0;

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
        const totalFees = backupFeeValue + adminFeeValue;

        // Total Operational Cost (Custo Total)
        const totalOperationalCost = adminFeeBasis + adminFeeValue;

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

        // Individual Taxes
        const issValue = grossNF * LABOR_TAX_RATES.iss;
        const pisValue = grossNF * LABOR_TAX_RATES.pis;
        const cofinsValue = grossNF * LABOR_TAX_RATES.cofins;
        const irrfValue = grossNF * LABOR_TAX_RATES.irrf;
        const csllValue = grossNF * LABOR_TAX_RATES.csll;

        // NEW TOTALS as requested
        // Total Bruto (NF) = Total Salário Bruto + Total Encargos + Total Benefícios + Total Exames + Total Taxas + Total Recrutamento + Total Tributos
        const totalBrutoNF = totalGrossSalary + totalCharges + totalBenefits + totalExams + totalFees + teamCost + totalTaxes;

        // Total Líquido = Total Salário Bruto - retenção IR (15,5%)
        const retentionIR = 0.155;
        const totalLiquido = totalGrossSalary - (totalGrossSalary * retentionIR);

        // Lucro L. Operacional = Líquido Recebido - Total Recrutamento - Tributos
        const liquidoRecebido = grossNF - totalTaxes; // Net amount received after taxes
        const lucroOperacional = liquidoRecebido - teamCost - totalTaxes;

        setResult({
            positionsCalculated,
            totalBaseSalary,
            totalGrossSalary,
            groupAValue,
            groupAPercent,
            groupBValue,
            groupBPercent,
            groupBItems, // Pass modified items for display
            totalCharges,
            totalBenefits,
            totalExams,
            costBasis,
            backupFeeValue,
            adminFeeValue,
            totalFees,
            totalOperationalCost,
            grossNF,
            totalTaxes,
            totalTaxRate,
            teamCost,
            // Individual taxes
            issValue,
            pisValue,
            cofinsValue,
            irrfValue,
            csllValue,
            // New totals
            totalBrutoNF,
            totalLiquido,
            lucroOperacional,
            liquidoRecebido
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
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Calculadora de Gestão de Mão de Obra</h1>
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

                {/* Provisioning Mode Selection */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap gap-4 justify-center">
                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${provisioningMode === 'full' ? 'bg-metarh-medium text-white border-metarh-medium' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                        <input
                            type="radio"
                            name="provisioningMode"
                            value="full"
                            checked={provisioningMode === 'full'}
                            onChange={() => setProvisioningMode('full')}
                            className="hidden"
                        />
                        <span className="font-bold text-sm">Contrato Provisionado</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${provisioningMode === 'semi' ? 'bg-metarh-medium text-white border-metarh-medium' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                        <input
                            type="radio"
                            name="provisioningMode"
                            value="semi"
                            checked={provisioningMode === 'semi'}
                            onChange={() => setProvisioningMode('semi')}
                            className="hidden"
                        />
                        <span className="font-bold text-sm">Contrato Semi Provisionado</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${provisioningMode === 'none' ? 'bg-metarh-medium text-white border-metarh-medium' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                        <input
                            type="radio"
                            name="provisioningMode"
                            value="none"
                            checked={provisioningMode === 'none'}
                            onChange={() => setProvisioningMode('none')}
                            className="hidden"
                        />
                        <span className="font-bold text-sm">Não Provisionado</span>
                    </label>
                </div>

                {/* Contract Types Explanation */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 mb-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Info size={20} className="text-blue-600" />
                        Entenda os Tipos de Contratos
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Provisionado */}
                        <div className={`bg-white p-4 rounded-3xl border-2 transition-all ${provisioningMode === 'full' ? 'border-metarh-medium shadow-md' : 'border-gray-200'}`}>
                            <h4 className="font-bold text-gray-800 mb-2">Provisionado</h4>
                            <p className="text-xs text-gray-600 mb-3">Inclui todas as provisões trabalhistas (Grupo A + Grupo B completo)</p>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-bold text-green-700 mb-1">✓ Pontos Positivos:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                        <li>• Maior segurança jurídica</li>
                                        <li>• Cobertura total de encargos</li>
                                        <li>• Previsibilidade de custos</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-700 mb-1">✗ Pontos Negativos:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                        <li>• Custo mais elevado</li>
                                        <li>• Menor flexibilidade</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Semi Provisionado */}
                        <div className={`bg-white p-4 rounded-3xl border-2 transition-all ${provisioningMode === 'semi' ? 'border-metarh-medium shadow-md' : 'border-gray-200'}`}>
                            <h4 className="font-bold text-gray-800 mb-2">Semi Provisionado</h4>
                            <p className="text-xs text-gray-600 mb-3">Exclui Aviso Prévio, Depósito Rescisão e Auxílio Doença</p>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-bold text-green-700 mb-1">✓ Pontos Positivos:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                        <li>• Custo intermediário</li>
                                        <li>• Equilíbrio risco/custo</li>
                                        <li>• Boa previsibilidade</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-700 mb-1">✗ Pontos Negativos:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                        <li>• Risco parcial de rescisão</li>
                                        <li>• Requer gestão ativa</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Não Provisionado */}
                        <div className={`bg-white p-4 rounded-3xl border-2 transition-all ${provisioningMode === 'none' ? 'border-metarh-medium shadow-md' : 'border-gray-200'}`}>
                            <h4 className="font-bold text-gray-800 mb-2">Não Provisionado</h4>
                            <p className="text-xs text-gray-600 mb-3">Apenas Grupo A (encargos sociais obrigatórios)</p>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-bold text-green-700 mb-1">✓ Pontos Positivos:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                        <li>• Menor custo mensal</li>
                                        <li>• Maior flexibilidade</li>
                                        <li>• Fluxo de caixa otimizado</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-700 mb-1">✗ Pontos Negativos:</p>
                                    <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                        <li>• Alto risco trabalhista</li>
                                        <li>• Custos imprevistos</li>
                                        <li>• Requer reserva financeira</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
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
                                    <div key={pos.id} className="bg-gray-50 p-4 rounded-3xl border border-gray-200 relative">
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
                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
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
                                                        className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salário Base (Mensal)</label>
                                                    <input
                                                        type="number"
                                                        value={pos.baseSalary}
                                                        onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, baseSalary: Number(e.target.value) } : p))}
                                                        className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                        placeholder="Referência"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hourly Mode Toggle */}
                                        <div className="mt-4 flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                                            <label className="flex items-center gap-2 cursor-pointer min-w-[100px]">
                                                <input
                                                    type="checkbox"
                                                    checked={pos.isHourly}
                                                    onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, isHourly: e.target.checked, isDailyWorker: e.target.checked ? false : p.isDailyWorker } : p))}
                                                    className="w-5 h-5 text-metarh-medium rounded-lg accent-metarh-medium transition-all"
                                                />
                                                <span className="text-sm font-bold text-gray-700">Horista</span>
                                            </label>

                                            {pos.isHourly && (
                                                <div className="flex-1 flex flex-wrap items-center gap-4 animate-fade-in">
                                                    {/* Custo/Hora */}
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Custo/Hora</span>
                                                        <span className="text-sm font-bold text-metarh-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                            {fmtCurrency(pos.baseSalary / 220)}
                                                        </span>
                                                    </div>

                                                    {/* Qtd Input */}
                                                    <div className="flex flex-col flex-1 min-w-[120px]">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">QTDE horas/mês</span>
                                                        <input
                                                            type="number"
                                                            value={pos.hoursPerMonth}
                                                            onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, hoursPerMonth: Number(e.target.value) } : p))}
                                                            className="w-full p-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-metarh-medium outline-none transition-all"
                                                            placeholder="0"
                                                        />
                                                    </div>

                                                    {/* Total */}
                                                    <div className="flex flex-col items-end min-w-[100px]">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Custo Total</span>
                                                        <span className="text-lg font-bold text-metarh-dark">
                                                            {fmtCurrency((pos.baseSalary / 220) * pos.hoursPerMonth)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Daily Worker Mode Toggle */}
                                        <div className="mt-2 flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
                                            <label className="flex items-center gap-2 cursor-pointer min-w-[100px]">
                                                <input
                                                    type="checkbox"
                                                    checked={pos.isDailyWorker}
                                                    onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, isDailyWorker: e.target.checked, isHourly: e.target.checked ? false : p.isHourly } : p))}
                                                    className="w-5 h-5 text-metarh-medium rounded-lg accent-metarh-medium transition-all"
                                                />
                                                <span className="text-sm font-bold text-gray-700">Diarista</span>
                                            </label>

                                            {pos.isDailyWorker && (
                                                <div className="flex-1 flex flex-wrap items-center gap-4 animate-fade-in">
                                                    {/* Custo/Dia */}
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Custo/Dia</span>
                                                        <span className="text-sm font-bold text-metarh-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                            {fmtCurrency(pos.baseSalary / 22)}
                                                        </span>
                                                    </div>

                                                    {/* Qtd Input */}
                                                    <div className="flex flex-col flex-1 min-w-[120px]">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">QTDE dias/mês</span>
                                                        <input
                                                            type="number"
                                                            value={pos.daysPerMonth}
                                                            onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, daysPerMonth: Number(e.target.value) } : p))}
                                                            className="w-full p-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-metarh-medium outline-none transition-all"
                                                            placeholder="0"
                                                        />
                                                    </div>

                                                    {/* Total */}
                                                    <div className="flex flex-col items-end min-w-[100px]">
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Custo Total</span>
                                                        <span className="text-lg font-bold text-metarh-dark">
                                                            {fmtCurrency((pos.baseSalary / 22) * pos.daysPerMonth)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Periculosidade</label>
                                                <select
                                                    value={pos.hazardPay}
                                                    onChange={(e) => setPositions(positions.map(p => p.id === pos.id ? { ...p, hazardPay: Number(e.target.value) as any } : p))}
                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm text-metarh-dark font-medium"
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
                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm text-metarh-dark font-medium"
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
                                                        className="w-4 h-4 text-metarh-medium rounded accent-metarh-medium"
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
                                        nightShiftPercent: 0.20,
                                        isHourly: false,
                                        isDailyWorker: false,
                                        hoursPerMonth: 220,
                                        daysPerMonth: 22,
                                        hoursQuantity: 0,
                                        daysQuantity: 0
                                    }])}
                                    className="flex items-center gap-2 text-sm font-bold text-metarh-medium hover:underline"
                                >
                                    <Plus size={16} /> Adicionar Cargo
                                </button>

                                {/* Total Gross Salary Display */}
                                {result && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <div className="bg-metarh-medium/10 px-4 py-2 rounded-2xl border border-metarh-medium/20">
                                            <span className="text-xs font-bold text-gray-600 uppercase mr-2">Total Salário Bruto:</span>
                                            <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.totalGrossSalary)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. CHARGES (ENCARGOS) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Settings size={18} /> 2. Encargos
                            </h2>

                            <div className="mt-4 grid md:grid-cols-2 gap-6 animate-fade-in">
                                {/* Group A */}
                                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-2">Encargos Sociais Obrigatórios - Grupo A</h3>
                                    <div className="space-y-2 text-xs text-gray-600">
                                        <div className="flex justify-between">
                                            <span>INSS</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(LABOR_CHARGES.groupA.inss)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * LABOR_CHARGES.groupA.inss || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>SESI/SESC</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(LABOR_CHARGES.groupA.sesi_sesc)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * LABOR_CHARGES.groupA.sesi_sesc || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>SENAI/SENAC</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(LABOR_CHARGES.groupA.senai_senac)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * LABOR_CHARGES.groupA.senai_senac || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>INCRA</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(LABOR_CHARGES.groupA.incra)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * LABOR_CHARGES.groupA.incra || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Seguro Acidente Trabalho - SAT</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(satRate)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * satRate || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Salário Educação</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(LABOR_CHARGES.groupA.salario_educacao)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * LABOR_CHARGES.groupA.salario_educacao || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>SEBRAE</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(LABOR_CHARGES.groupA.sebrae)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * LABOR_CHARGES.groupA.sebrae || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>FGTS</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(LABOR_CHARGES.groupA.fgts)}</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * LABOR_CHARGES.groupA.fgts || 0)}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 mt-2">
                                            <span>Total Grupo A</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(result?.groupAPercent || 0)}</span>
                                                <span>{fmtCurrency(result?.groupAValue || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Group B */}
                                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-2">Encargos Trabalhistas | Provisões - Grupo B</h3>
                                    <div className="space-y-2 text-xs text-gray-600">
                                        {result?.groupBItems && Object.entries(result.groupBItems).map(([key, val]) => (
                                            <div key={key} className={`flex justify-between ${val === 0 ? 'opacity-50' : ''}`}>
                                                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                                <div className="flex gap-2">
                                                    <span>{fmtPercent(val as number)}</span>
                                                    <span className="font-bold text-gray-800">{fmtCurrency(result?.totalGrossSalary * (val as number) || 0)}</span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 mt-2">
                                            <span>Total Grupo B</span>
                                            <div className="flex gap-2">
                                                <span>{fmtPercent(result?.groupBPercent || 0)}</span>
                                                <span>{fmtCurrency(result?.groupBValue || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Highlighted Total Charges */}
                            <div className="mt-4 bg-metarh-medium/10 border border-metarh-medium/30 rounded-3xl p-4 flex justify-between items-center">
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
                                    <div className="bg-gray-50 p-3 rounded-3xl border border-gray-200">
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
                                            <div className="space-y-2 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Dias:</span>
                                                    <input
                                                        type="number"
                                                        value={transportDays}
                                                        onChange={(e) => setTransportDays(Number(e.target.value))}
                                                        className="w-16 p-1 text-sm border border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                                    <span className="text-xs text-gray-600 font-bold">Total:</span>
                                                    <span className="text-sm font-bold text-metarh-medium">
                                                        {fmtCurrency(BENEFIT_OPTIONS.others.transport.defaultValue * transportDays)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vale Refeição */}
                                    <div className="bg-gray-50 p-3 rounded-3xl border border-gray-200">
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
                                            <div className="space-y-2 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">Dias:</span>
                                                    <input
                                                        type="number"
                                                        value={mealDays}
                                                        onChange={(e) => setMealDays(Number(e.target.value))}
                                                        className="w-16 p-1 text-sm border border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                                    <span className="text-xs text-gray-600 font-bold">Total:</span>
                                                    <span className="text-sm font-bold text-metarh-medium">
                                                        {fmtCurrency(BENEFIT_OPTIONS.others.meal.defaultValue * mealDays)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vale Alimentação */}
                                    <div className="bg-gray-50 p-3 rounded-3xl border border-gray-200 flex items-center justify-between">
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
                                    <div className="bg-gray-50 p-3 rounded-3xl border border-gray-200 flex items-center justify-between">
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
                                    <div className="bg-gray-50 p-3 rounded-3xl border border-gray-200 flex items-center justify-between">
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
                                    <div className="bg-gray-50 p-3 rounded-3xl border border-gray-200 flex items-center justify-between">
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
                                    <div className="bg-gray-50 p-3 rounded-3xl border border-gray-200 flex items-center justify-between">
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
                                <div className="grid md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-3xl border border-gray-200">
                                    <label className="text-xs font-bold text-gray-500 uppercase md:col-span-1">Plano Médico</label>
                                    <div className="md:col-span-2 flex gap-4">
                                        <select
                                            value={selectedMedicalPlan}
                                            onChange={(e) => setSelectedMedicalPlan(e.target.value)}
                                            className="flex-1 p-2 bg-white rounded-2xl border border-gray-300 text-sm text-metarh-dark font-medium"
                                        >
                                            {BENEFIT_OPTIONS.medical.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                        <div className="w-32 p-2 bg-white rounded-2xl border border-gray-300 text-sm font-bold text-right text-gray-700 flex items-center justify-end">
                                            {fmtCurrency(BENEFIT_OPTIONS.medical.find(p => p.id === selectedMedicalPlan)?.value || 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Dental Plan */}
                                <div className="grid md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-3xl border border-gray-200">
                                    <label className="text-xs font-bold text-gray-500 uppercase md:col-span-1">Plano Odontológico</label>
                                    <div className="md:col-span-2 flex gap-4">
                                        <select
                                            value={selectedDentalPlan}
                                            onChange={(e) => setSelectedDentalPlan(e.target.value)}
                                            className="flex-1 p-2 bg-white rounded-2xl border border-gray-300 text-sm text-metarh-dark font-medium"
                                        >
                                            {BENEFIT_OPTIONS.dental.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                        <div className="w-32 p-2 bg-white rounded-2xl border border-gray-300 text-sm font-bold text-right text-gray-700 flex items-center justify-end">
                                            {fmtCurrency(BENEFIT_OPTIONS.dental.find(p => p.id === selectedDentalPlan)?.value || 0)}
                                        </div>
                                    </div>
                                </div>

                                {/* Wellhub */}
                                <div className="grid md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-3xl border border-gray-200">
                                    <label className="text-xs font-bold text-gray-500 uppercase md:col-span-1">Wellhub (Gympass)</label>
                                    <div className="md:col-span-2 flex gap-4">
                                        <select
                                            value={selectedWellhubPlan}
                                            onChange={(e) => setSelectedWellhubPlan(e.target.value)}
                                            className="flex-1 p-2 bg-white rounded-2xl border border-gray-300 text-sm text-metarh-dark font-medium"
                                        >
                                            {BENEFIT_OPTIONS.wellhub.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                        <div className="w-32 p-2 bg-white rounded-2xl border border-gray-300 text-sm font-bold text-right text-gray-700 flex items-center justify-end">
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
                                            className="flex-1 p-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm"
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
                                            className="w-24 p-2 bg-gray-50 rounded-2xl border border-gray-200 text-sm"
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

                            {/* Total Benefits Display */}
                            {result && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <div className="bg-metarh-medium/10 px-4 py-2 rounded-2xl border border-metarh-medium/20">
                                        <span className="text-xs font-bold text-gray-600 uppercase mr-2">Total Benefícios:</span>
                                        <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.totalBenefits)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. EXAMS (Separate Box) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <FileText size={18} /> 4. Exames Clínicos
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-3xl">
                                <div className="space-y-2">
                                    {EXAM_OPTIONS.map(exam => (
                                        <div key={exam.id} className="flex justify-between text-sm text-gray-600 border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                            <span>{exam.name}</span>
                                            <span className="font-mono font-bold">{fmtCurrency(exam.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Exams Display */}
                            {result && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <div className="bg-metarh-medium/10 px-4 py-2 rounded-2xl border border-metarh-medium/20">
                                        <span className="text-xs font-bold text-gray-600 uppercase mr-2">Total Exames:</span>
                                        <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.totalExams)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 5. FEES (Separate Box) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <DollarSign size={18} /> 5. Taxas
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Taxa de Backup (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={backupFeePercent * 100}
                                            onChange={(e) => setBackupFeePercent(Number(e.target.value) / 100)}
                                            className="w-20 p-2 bg-white rounded-2xl border border-gray-300 text-sm font-bold text-center"
                                        />
                                        <span className="text-gray-500 font-bold">%</span>
                                        <div className="flex-1 text-right">
                                            <span className="text-sm font-bold text-gray-700">{fmtCurrency(result?.backupFeeValue || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Taxa Administrativa (%)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={adminFeePercent * 100}
                                            onChange={(e) => setAdminFeePercent(Number(e.target.value) / 100)}
                                            className="w-20 p-2 bg-white rounded-2xl border border-gray-300 text-sm font-bold text-center"
                                        />
                                        <span className="text-gray-500 font-bold">%</span>
                                        <div className="flex-1 text-right">
                                            <span className="text-sm font-bold text-gray-700">{fmtCurrency(result?.adminFeeValue || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Total Fees Display */}
                            {result && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <div className="bg-metarh-medium/10 px-4 py-2 rounded-2xl border border-metarh-medium/20">
                                        <span className="text-xs font-bold text-gray-600 uppercase mr-2">Total Taxas:</span>
                                        <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.totalFees)}</span>
                                    </div>
                                </div>
                            )}
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
                                    <div className="bg-purple-50/50 p-4 rounded-3xl border border-purple-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-xs font-bold text-gray-700 uppercase">Equipe de Recrutamento</label>
                                            <div className="w-40">
                                                <label className="block text-[10px] font-bold text-metarh-medium uppercase mb-1">Dias Demandados</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={demandedDays || ''}
                                                        onChange={(e) => setDemandedDays(Number(e.target.value))}
                                                        className="w-full px-3 py-2 rounded-2xl border border-metarh-medium/30 focus:ring-2 focus:ring-metarh-medium outline-none text-center font-bold bg-white"
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
                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipe Plena</label>
                                                <input
                                                    type="number"
                                                    value={qtyPlena}
                                                    onChange={(e) => setQtyPlena(Number(e.target.value))}
                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Equipe Junior</label>
                                                <input
                                                    type="number"
                                                    value={qtyJunior}
                                                    onChange={(e) => setQtyJunior(Number(e.target.value))}
                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Total Recruitment Display */}
                            {result && recruitmentType === 'selection' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <div className="bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100">
                                        <span className="text-xs font-bold text-purple-900 uppercase mr-2">Total Recrutamento:</span>
                                        <span className="text-lg font-bold text-purple-700">{fmtCurrency(result.teamCost)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 7. TRIBUTOS (Separate Box) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <DollarSign size={18} /> 7. Tributos
                            </h2>

                            {result && (
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>ISS ({fmtPercent(LABOR_TAX_RATES.iss)})</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result.issValue || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>PIS ({fmtPercent(LABOR_TAX_RATES.pis)})</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result.pisValue || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>COFINS ({fmtPercent(LABOR_TAX_RATES.cofins)})</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result.cofinsValue || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>IRRF ({fmtPercent(LABOR_TAX_RATES.irrf)})</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result.irrfValue || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>CSLL ({fmtPercent(LABOR_TAX_RATES.csll)})</span>
                                                <span className="font-bold text-gray-800">{fmtCurrency(result.csllValue || 0)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Tributos */}
                                    <div className="bg-red-50 border border-red-100 rounded-3xl p-4 flex justify-between items-center">
                                        <span className="text-sm font-bold text-red-900 uppercase">Total Tributos ({fmtPercent(result.totalTaxRate)})</span>
                                        <span className="text-2xl font-bold text-red-700">{fmtCurrency(result.totalTaxes)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN - RESULTS */}
                    <div className="lg:col-span-1">
                        <div className="bg-metarh-dark text-white p-8 rounded-[2.5rem] shadow-xl lg:sticky lg:top-4">
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

                                    {/* Taxes */}
                                    <div className="text-xs text-gray-400 space-y-1 pb-4 border-b border-white/10">
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

                                    {/* NEW TOTALS - As requested */}
                                    <div className="mt-4 space-y-3">
                                        {/* Total Líquido - Green background */}
                                        <div className="bg-green-600 p-4 rounded-3xl border-2 border-green-500 shadow-lg">
                                            <p className="text-xs text-white uppercase font-bold mb-1">Total Líquido (Recebido)</p>
                                            <p className="text-3xl font-bold text-white">{fmtCurrency(result.totalLiquido || 0)}</p>
                                            <p className="text-[10px] text-green-100 mt-1">Total Bruto (NF) - Retenção IR (15,5%)</p>
                                        </div>

                                        {/* Lucro L. Operacional - Emphasis on % */}
                                        <div className="bg-yellow-900/30 p-4 rounded-3xl border border-yellow-500/20">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-xs text-yellow-200 uppercase font-bold">Lucro L. Operacional</p>
                                                <span className="text-2xl font-bold bg-yellow-500/30 text-yellow-100 px-3 py-1 rounded-full">
                                                    {fmtPercent(result.totalLiquido > 0 ? result.lucroOperacional / result.totalLiquido : 0)}
                                                </span>
                                            </div>
                                            <p className="text-xl font-bold text-white">{fmtCurrency(result.lucroOperacional || 0)}</p>
                                            <p className="text-[10px] text-yellow-300 mt-1">Líquido Recebido - Recrutamento - Tributos</p>
                                        </div>
                                    </div>

                                    {recruitmentType === 'selection' && result.teamCost > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <div className="p-3 bg-purple-900/30 rounded-3xl border border-purple-500/20">
                                                <p className="text-xs text-purple-200 uppercase font-bold">Custo Equipe R&S</p>
                                                <p className="text-lg font-bold text-white">{fmtCurrency(result.teamCost)}</p>
                                                <p className="text-[10px] text-purple-300">Custo interno estimado</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Dica do Especialista - Same logic as PricingCalculator */}
                                    {(() => {
                                        const netLiquid = result.grossNF * 0.845; // Total Líquido (após retenção IR 15.5%)
                                        const realProfit = netLiquid - result.totalOperationalCost - result.totalTaxes;
                                        const profitMarginPercentage = netLiquid > 0 ? (realProfit / netLiquid) * 100 : 0;

                                        return (
                                            <div className={`mt-6 p-4 rounded-2xl border-2 ${realProfit < 0
                                                ? 'bg-red-500/10 border-red-400'
                                                : profitMarginPercentage < 10
                                                    ? 'bg-orange-500/10 border-orange-400'
                                                    : profitMarginPercentage <= 35
                                                        ? 'bg-yellow-500/10 border-yellow-400'
                                                        : 'bg-green-500/10 border-green-400'
                                                }`}>
                                                <p className="text-xs font-bold mb-2 flex items-center gap-1">
                                                    {realProfit < 0 ? '🚨' :
                                                        profitMarginPercentage < 10 ? '😅' :
                                                            profitMarginPercentage <= 35 ? '😉' : '🚀'}
                                                    <span className="text-white">Dica do Especialista</span>
                                                </p>
                                                <p className="text-xs text-gray-300 leading-relaxed">
                                                    {realProfit < 0
                                                        ? 'Prejuízo à vista! Abortar missão ou renegociar urgente! A gente não trabalha de graça não, né? 🚨'
                                                        : profitMarginPercentage < 10
                                                            ? 'Eita! Margem apertada. Tente aumentar a taxa ou rever os custos fixos. Senão a gente paga pra trabalhar! 😅'
                                                            : profitMarginPercentage <= 35
                                                                ? 'Margem ok, mas dá pra melhorar. Que tal um chorinho na taxa? Ou cortar uns custos fixos? 😉'
                                                                : 'Aí sim! Margem top (acima de 35%). O comercial tá voando! Pode fechar sem medo. 🚀'
                                                    }
                                                </p>
                                            </div>
                                        );
                                    })()}

                                    {/* Botão Gerar PDF */}
                                    <button
                                        onClick={() => {
                                            alert('Funcionalidade de Gerar PDF será implementada em breve!');
                                            // TODO: Integrar com pdfGenerator.ts
                                        }}
                                        className="w-full py-3 bg-white text-metarh-dark font-bold rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mt-4"
                                    >
                                        <FileText size={18} /> Gerar PDF
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
