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

export interface BenefitItem {
    id: string;
    name: string;
    type: 'daily' | 'monthly' | 'plan_selection' | 'custom';
    quantity: number;
    unitValue: number;
    days?: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    selectedPlanId?: string;
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



    // New Benefits Structure (Unified)
    const [benefitsList, setBenefitsList] = useState<BenefitItem[]>([
        { id: 'transport', name: 'Vale Transporte', type: 'daily', quantity: 1, unitValue: BENEFIT_OPTIONS.others.transport.defaultValue, days: 22, discountType: 'percentage', discountValue: 0.05 }, // 5% na imagem
        { id: 'meal', name: 'Refeição', type: 'daily', quantity: 1, unitValue: BENEFIT_OPTIONS.others.meal.defaultValue, days: 22, discountType: 'percentage', discountValue: 0.05 }, // 5% na imagem
        { id: 'exam-aso', name: 'Exames Clínicos - ASO', type: 'monthly', quantity: 1, unitValue: EXAM_OPTIONS.find(e => e.id === 'exam-aso')?.value || 0, discountType: 'percentage', discountValue: 0.05 },
        { id: 'exam-comp', name: 'Exames Médicos Complementares', type: 'monthly', quantity: 0, unitValue: 0, discountType: 'percentage', discountValue: 0.05 },
        { id: 'exam-pcmso', name: 'PCMSO', type: 'monthly', quantity: 1, unitValue: EXAM_OPTIONS.find(e => e.id === 'exam-pcmso')?.value || 0, discountType: 'percentage', discountValue: 0.01 },
        { id: 'medical', name: 'Plano Médico', type: 'plan_selection', quantity: 1, unitValue: 0, discountType: 'percentage', discountValue: 0.02, selectedPlanId: BENEFIT_OPTIONS.medical[2].id }, // Default Sulamerica Executivo
        { id: 'dental', name: 'Plano Odontológico', type: 'plan_selection', quantity: 1, unitValue: 0, discountType: 'fixed', discountValue: 0, selectedPlanId: BENEFIT_OPTIONS.dental[0].id },
        { id: 'pharmacy', name: 'Auxílio Farmácia | Omni', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.pharmacy.defaultValue, discountType: 'fixed', discountValue: 0 },
        { id: 'wellhub', name: 'Wellhub (Gympass)', type: 'plan_selection', quantity: 0, unitValue: 0, discountType: 'percentage', discountValue: 0, selectedPlanId: BENEFIT_OPTIONS.wellhub[0].id },
        { id: 'food', name: 'Vale Alimentação', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.food.defaultValue, discountType: 'percentage', discountValue: 0.01 },
        { id: 'lifeInsurance', name: 'Seguro de Vida', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.lifeInsurance.defaultValue, discountType: 'fixed', discountValue: 0 },
        { id: 'gpsPoint', name: 'Controle de Ponto GPS', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.gpsPoint.defaultValue, discountType: 'fixed', discountValue: 0 },
        { id: 'plr', name: 'PLR', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.plr.defaultValue, discountType: 'fixed', discountValue: 0 },
    ]);

    // Charges Config (Detailed)
    const [satRate, setSatRate] = useState<number>(LABOR_CHARGES.groupA.sat);
    // Removed showChargesConfig (Always visible)

    // Fees (Removed Backup Fee)
    const [adminFeePercent, setAdminFeePercent] = useState<number>(0.10); // Taxa Administrativa default 10%

    // Operational Costs (ex-Recruitment)
    const [operationalAdminDays, setOperationalAdminDays] = useState<number>(0); // Dias para Operação Administrativa
    const [extraCosts, setExtraCosts] = useState<{ id: string, name: string, value: number }[]>([]); // Custos Extras

    // ISS Selection
    const [selectedCity, setSelectedCity] = useState<string>('São Paulo - SP');

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

            }
        };
        loadData();
    }, []);

    // --- CALCULATIONS ---
    useEffect(() => {
        calculateLaborPricing();
    }, [
        positions, recruitmentType, provisioningMode,
        benefitsList, // Updated dependency
        adminFeePercent,
        satRate, qtySenior, qtyPlena, qtyJunior, demandedDays, teamRates, appSettings,
        operationalAdminDays, extraCosts, selectedCity,
    ]);

    const calculateBenefitRow = (item: BenefitItem) => {
        let unitValue = item.unitValue;

        // Se for plano selecionável, pega o valor do plano selecionado
        if (item.type === 'plan_selection' && item.selectedPlanId) {
            if (item.id === 'medical') unitValue = BENEFIT_OPTIONS.medical.find(p => p.id === item.selectedPlanId)?.value || 0;
            if (item.id === 'dental') unitValue = BENEFIT_OPTIONS.dental.find(p => p.id === item.selectedPlanId)?.value || 0;
            if (item.id === 'wellhub') unitValue = BENEFIT_OPTIONS.wellhub.find(p => p.id === item.selectedPlanId)?.value || 0;
        }

        const providedValue = item.type === 'daily'
            ? (item.quantity * unitValue * (item.days || 0))
            : (item.quantity * unitValue);

        let collabDiscount = 0;
        if (item.discountType === 'percentage') {
            collabDiscount = providedValue * item.discountValue;
        } else {
            collabDiscount = item.discountValue;
        }

        const clientCost = providedValue - collabDiscount;

        return { unitValue, providedValue, collabDiscount, clientCost };
    };

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

        // Benefits - New Logic
        let totalBenefits = 0;
        let totalExams = 0;

        benefitsList.forEach(item => {
            const { clientCost } = calculateBenefitRow(item);

            // Check if it's an exam
            if (item.id.startsWith('exam-')) {
                totalExams += clientCost * totalPositions;
            } else {
                totalBenefits += clientCost * totalPositions;
            }
        });





        // Subtotal for Fees (Salaries + Charges + Benefits + Exams)
        const costBasis = totalGrossSalary + totalCharges + totalBenefits + totalExams;

        // Fees (Removed Backup Fee)
        const adminFeeValue = costBasis * adminFeePercent;
        const totalFees = adminFeeValue;

        // Total Operational Cost (Custo Total)
        const totalOperationalCost = costBasis + adminFeeValue;

        // Operational Costs (New Structure)
        // 1. Recruitment Team Cost
        const hoursPerDay = 9;
        const projectHours = demandedDays * hoursPerDay;
        const recruitmentTeamCost = (
            (qtySenior * teamRates.senior) +
            (qtyPlena * teamRates.plena) +
            (qtyJunior * teamRates.junior)
        ) * projectHours;

        // 2. Administrative Operation Cost (R$ 745/hour)
        const operationalAdminHourlyRate = 745;
        const operationalAdminCost = operationalAdminDays * hoursPerDay * operationalAdminHourlyRate;

        // 3. Extra Costs
        const extraCostTotal = extraCosts.reduce((sum, item) => sum + item.value, 0);

        // Total Operational Cost (Custo Operacional)
        const totalOperationalCostValue = recruitmentTeamCost + operationalAdminCost + extraCostTotal;


        // Taxes (Tributos) - ISS now varies by city
        const issRateOptions = [
            { city: 'São Paulo - SP', rate: 0.05 },
            { city: 'Barueri - SP', rate: 0.02 },
            { city: 'Outra Localidade (5%)', rate: 0.05 },
        ];
        const selectedIssRate = issRateOptions.find(opt => opt.city === selectedCity)?.rate || 0.05;

        const totalTaxRate =
            selectedIssRate +
            LABOR_TAX_RATES.pis +
            LABOR_TAX_RATES.cofins +
            LABOR_TAX_RATES.irrf +
            LABOR_TAX_RATES.csll;

        // Gross NF
        const grossNF = totalOperationalCost / (1 - totalTaxRate);
        const totalTaxes = grossNF * totalTaxRate;

        // Individual Taxes
        const issValue = grossNF * selectedIssRate;
        const pisValue = grossNF * LABOR_TAX_RATES.pis;
        const cofinsValue = grossNF * LABOR_TAX_RATES.cofins;
        const irrfValue = grossNF * LABOR_TAX_RATES.irrf;
        const csllValue = grossNF * LABOR_TAX_RATES.csll;

        // NEW TOTALS as requested
        // Total Bruto (NF) = Total Salário Bruto + Total Encargos + Total Benefícios + Total Exames + Total Taxas + Total Custo Operacional + Total Tributos
        const totalBrutoNF = totalGrossSalary + totalCharges + totalBenefits + totalExams + totalFees + totalOperationalCostValue + totalTaxes;

        // Total Líquido (Recebido) = Valor Bruto da NF - Retenção IR (15,5%)
        const retentionIR = 0.155;
        const totalLiquido = grossNF - (grossNF * retentionIR);

        // Lucro L. Operacional = Líquido Recebido - Custo Operacional (Se houver) - Tributos
        const lucroOperacional = totalLiquido - totalOperationalCostValue - totalTaxes;

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
            adminFeeValue,
            totalFees,
            totalOperationalCost,
            grossNF,
            totalTaxes,
            totalTaxRate,
            // Operational Costs breakdown
            recruitmentTeamCost,
            operationalAdminCost,
            extraCostTotal,
            totalOperationalCostValue,
            // Individual taxes
            issValue,
            pisValue,
            cofinsValue,
            irrfValue,
            csllValue,
            // New totals
            totalBrutoNF,
            totalLiquido,
            lucroOperacional
        });
    };

    const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const fmtPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

    const updateBenefit = (id: string, field: keyof BenefitItem, value: any) => {
        setBenefitsList(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32 animate-fade-in overflow-x-hidden">
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

                        {/* 3. BENEFITS (Unified Table) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Sparkles size={18} /> 3. Benefícios
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-metarh-dark text-white uppercase text-xs">
                                        <tr>
                                            <th className="p-3 rounded-tl-xl">Benefícios</th>
                                            <th className="p-3 text-center">Quantidade</th>
                                            <th className="p-3 text-right">Valor Unit.</th>
                                            <th className="p-3 text-center">Dias</th>
                                            <th className="p-3 text-right">Valor Fornecido</th>
                                            <th className="p-3 text-center">% | $ Descontos</th>
                                            <th className="p-3 text-right">Valor Desc Colab.</th>
                                            <th className="p-3 text-right rounded-tr-xl">Valor Cliente c/ Desc Colab.</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {benefitsList.map((item) => {
                                            const { unitValue, providedValue, collabDiscount, clientCost } = calculateBenefitRow(item);
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 font-medium text-gray-800 min-w-[200px]">
                                                        {item.type === 'custom' ? (
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => updateBenefit(item.id, 'name', e.target.value)}
                                                                className="w-full p-1 border border-gray-200 rounded bg-white text-sm"
                                                            />
                                                        ) : (
                                                            <div>{item.name}</div>
                                                        )}
                                                        {item.type === 'plan_selection' && (
                                                            <select
                                                                value={item.selectedPlanId}
                                                                onChange={(e) => updateBenefit(item.id, 'selectedPlanId', e.target.value)}
                                                                className="mt-1 w-full p-1 text-xs border border-gray-200 rounded bg-white text-gray-600"
                                                            >
                                                                {item.id === 'medical' && BENEFIT_OPTIONS.medical.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                                {item.id === 'dental' && BENEFIT_OPTIONS.dental.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                                {item.id === 'wellhub' && BENEFIT_OPTIONS.wellhub.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateBenefit(item.id, 'quantity', Number(e.target.value))}
                                                            className="w-12 p-1 text-center border border-gray-200 rounded bg-white focus:ring-2 focus:ring-metarh-medium/20 outline-none"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="p-3 text-right">
                                                        {item.type === 'plan_selection' ? (
                                                            <span className="text-gray-600">{fmtCurrency(unitValue)}</span>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                value={item.unitValue}
                                                                onChange={(e) => updateBenefit(item.id, 'unitValue', Number(e.target.value))}
                                                                className="w-20 p-1 text-right border border-gray-200 rounded bg-white focus:ring-2 focus:ring-metarh-medium/20 outline-none"
                                                                step="0.01"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {item.type === 'daily' ? (
                                                            <input
                                                                type="number"
                                                                value={item.days}
                                                                onChange={(e) => updateBenefit(item.id, 'days', Number(e.target.value))}
                                                                className="w-12 p-1 text-center border border-gray-200 rounded bg-white focus:ring-2 focus:ring-metarh-medium/20 outline-none"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right font-medium text-gray-700">
                                                        {fmtCurrency(providedValue)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={item.discountType === 'percentage' ? Number((item.discountValue * 100).toFixed(2)) : item.discountValue}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    updateBenefit(item.id, 'discountValue', item.discountType === 'percentage' ? val / 100 : val);
                                                                }}
                                                                className="w-16 p-1 text-center border border-gray-200 rounded bg-white focus:ring-2 focus:ring-metarh-medium/20 outline-none"
                                                                step={item.discountType === 'percentage' ? "0.1" : "0.01"}
                                                            />
                                                            <button
                                                                onClick={() => updateBenefit(item.id, 'discountType', item.discountType === 'percentage' ? 'fixed' : 'percentage')}
                                                                className="text-xs font-bold text-metarh-medium hover:bg-metarh-medium/10 px-1 rounded w-6"
                                                                title={item.discountType === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                                                            >
                                                                {item.discountType === 'percentage' ? '%' : '$'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right text-red-500">
                                                        -{fmtCurrency(collabDiscount)}
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-metarh-dark bg-gray-50/50">
                                                        {fmtCurrency(clientCost)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        {item.type === 'custom' && (
                                                            <button
                                                                onClick={() => setBenefitsList(prev => prev.filter(i => i.id !== item.id))}
                                                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex justify-between items-center">
                                <button
                                    onClick={() => setBenefitsList([...benefitsList, {
                                        id: `custom-${Date.now()}`,
                                        name: 'Novo Benefício',
                                        type: 'custom',
                                        quantity: 1,
                                        unitValue: 0,
                                        discountType: 'fixed',
                                        discountValue: 0
                                    }])}
                                    className="text-xs font-bold text-metarh-medium hover:underline flex items-center gap-1"
                                >
                                    <Plus size={14} /> Adicionar Item
                                </button>

                                {result && (
                                    <div className="flex gap-4">
                                        <div className="bg-metarh-medium/10 px-4 py-2 rounded-2xl border border-metarh-medium/20">
                                            <span className="text-xs font-bold text-gray-600 uppercase mr-2">Total Benefícios:</span>
                                            <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.totalBenefits + result.totalExams)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 5. FEES */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <DollarSign size={18} /> 5. Taxas
                            </h2>

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

                        {/* 6. CUSTO OPERACIONAL */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <Briefcase size={18} /> 6. Custo Operacional
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
                                    <span className="text-sm font-bold text-gray-700">Sem Custo Operacional</span>
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
                                    <span className="text-sm font-bold text-gray-700">Com Custo Operacional</span>
                                </label>
                            </div>

                            {recruitmentType === 'selection' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* 1. Recrutamento e Seleção */}
                                    <div className="bg-purple-50/50 p-4 rounded-3xl border border-purple-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-xs font-bold text-gray-700 uppercase">1. Recrutamento e Seleção</label>
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
                                        {result && (
                                            <div className="mt-3 bg-white p-2 rounded-2xl border border-purple-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-600">Subtotal:</span>
                                                    <span className="text-sm font-bold text-purple-700">{fmtCurrency(result.recruitmentTeamCost || 0)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. Operação Administrativa */}
                                    <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 uppercase">2. Operação Administrativa</label>
                                                <p className="text-[10px] text-gray-500 mt-1">Time único de operações: R$ 745,00/hora</p>
                                            </div>
                                            <div className="w-40">
                                                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Dias Demandados</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={operationalAdminDays || ''}
                                                        onChange={(e) => setOperationalAdminDays(Number(e.target.value))}
                                                        className="w-full px-3 py-2 rounded-2xl border border-blue-300/30 focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold bg-white"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                        = {operationalAdminDays * 9}h úteis
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {result && (
                                            <div className="mt-3 bg-white p-2 rounded-2xl border border-blue-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-600">Subtotal:</span>
                                                    <span className="text-sm font-bold text-blue-700">{fmtCurrency(result.operationalAdminCost || 0)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Custos Extras */}
                                    <div className="bg-orange-50/50 p-4 rounded-3xl border border-orange-100">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-3">3. Custos Extras (Alimentável)</label>
                                        {extraCosts.map((item, idx) => (
                                            <div key={item.id} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newCosts = [...extraCosts];
                                                        newCosts[idx].name = e.target.value;
                                                        setExtraCosts(newCosts);
                                                    }}
                                                    className="flex-1 p-2 bg-white rounded-2xl border border-gray-200 text-sm"
                                                    placeholder="Nome do custo"
                                                />
                                                <input
                                                    type="number"
                                                    value={item.value}
                                                    onChange={(e) => {
                                                        const newCosts = [...extraCosts];
                                                        newCosts[idx].value = Number(e.target.value);
                                                        setExtraCosts(newCosts);
                                                    }}
                                                    className="w-32 p-2 bg-white rounded-2xl border border-gray-200 text-sm"
                                                    placeholder="Valor (R$)"
                                                />
                                                <button
                                                    onClick={() => setExtraCosts(extraCosts.filter((_, i) => i !== idx))}
                                                    className="text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => setExtraCosts([...extraCosts, { id: `extra-${Date.now()}`, name: '', value: 0 }])}
                                            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Adicionar Custo Extra
                                        </button>
                                        {result && extraCosts.length > 0 && (
                                            <div className="mt-3 bg-white p-2 rounded-2xl border border-orange-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-gray-600">Subtotal:</span>
                                                    <span className="text-sm font-bold text-orange-700">{fmtCurrency(result.extraCostTotal || 0)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Total Custo Operacional Display */}
                            {result && recruitmentType === 'selection' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                    <div className="bg-gradient-to-r from-purple-50 to-orange-50 px-6 py-3 rounded-2xl border-2 border-purple-200">
                                        <span className="text-xs font-bold text-purple-900 uppercase mr-2">Total Custo Operacional:</span>
                                        <span className="text-xl font-bold text-purple-700">{fmtCurrency(result.totalOperationalCostValue || 0)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 7. TRIBUTOS (Separate Box) */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                                <DollarSign size={18} /> 7. Tributos
                            </h2>

                            {/* ISS City Selector */}
                            <div className="mb-4 bg-blue-50 p-4 rounded-3xl border border-blue-100">
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Cidade (Para cálculo do ISS)</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full p-3 bg-white rounded-2xl border border-gray-300 text-sm font-bold text-metarh-dark focus:ring-2 focus:ring-blue-400 outline-none"
                                >
                                    <option value="São Paulo - SP">São Paulo - SP (5%)</option>
                                    <option value="Barueri - SP">Barueri - SP (2%)</option>
                                    <option value="Outra Localidade (5%)">Outra Localidade (5%)</option>
                                </select>
                                <p className="text-[10px] text-gray-500 mt-2">A alíquota de ISS varia conforme a cidade</p>
                            </div>

                            {result && (
                                <div className="space-y-3">
                                    <div className="bg-gray-50 p-4 rounded-3xl border border-gray-200">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>ISS - {selectedCity}</span>
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
                                        <div className="flex justify-between font-bold text-metarh-lime">
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
                                        <p className="text-[10px] opacity-70 mt-1">Custo Base + Taxas + Tributos</p>
                                    </div>

                                    {/* NEW TOTALS - As requested */}
                                    <div className="mt-4 space-y-3">
                                        {/* Total Líquido - Green background (same style as PricingCalculator) */}
                                        <div className="bg-green-900/30 p-4 rounded-3xl border border-green-500/20">
                                            <p className="text-xs text-green-200 uppercase font-bold mb-1">Total Líquido (Recebido)</p>
                                            <p className="text-3xl font-bold text-white">{fmtCurrency(result.totalLiquido || 0)}</p>
                                            <p className="text-[10px] text-green-300 mt-1">Valor Bruto da NF - Retenção IR (15,5%)</p>
                                        </div>

                                        {/* Lucro L. Operacional - Emphasis on % with legend below */}
                                        <div className="bg-yellow-900/30 p-4 rounded-3xl border border-yellow-500/20">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-xs text-yellow-200 uppercase font-bold">Lucro L. Operacional</p>
                                                <div className="text-center">
                                                    <span className="text-2xl font-bold bg-yellow-500/30 text-yellow-100 px-3 py-1 rounded-full block">
                                                        {fmtPercent(result.totalLiquido > 0 ? result.lucroOperacional / result.totalLiquido : 0)}
                                                    </span>
                                                    <p className="text-[9px] text-yellow-300 mt-1">% do Líquido</p>
                                                </div>
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
