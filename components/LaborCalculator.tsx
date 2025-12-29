import React, { useState, useEffect } from 'react';
import {
    Calculator, DollarSign, Users, BarChart3, Plus, Trash2, AlertCircle,
    FileText, Loader2, Sparkles, ChevronDown, ChevronUp, Settings, Briefcase, Clock, Info,
    Shield, Laptop, Smartphone, Car, CheckCircle2
} from 'lucide-react';
import { SupabaseStatus } from './SupabaseStatus';
import {
    LABOR_CHARGES, LABOR_TAX_RATES, BENEFIT_OPTIONS, EXAM_OPTIONS, MINIMUM_WAGE
} from '../constants';
import { getTeamRates, TeamRates } from './lib/teamRatesService';
import { getAppSettings, AppSettings } from './lib/settingsService';
import { generatePDF } from './lib/pdfGenerator';

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
    discountBase?: 'salary' | 'benefit'; // Para Vale Transporte: desconto sobre salário base ou valor fornecido
}

// Novas interfaces para seções de custo adicionais
export interface EpiItem {
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
    frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
}

export interface NotebookItem {
    id: string;
    model: string;
    quantity: number;
    unitCost: number;
}

export interface CellPhoneItem {
    id: string;
    model: string;
    quantity: number;
    monthlyCost: number; // Custo mensal do plano
}

export interface VehicleItem {
    id: string;
    type: string;
    quantity: number;
    monthlyCost: number; // Aluguel + combustível + manutenção
}


interface LaborCalculatorProps {
    onCancel: () => void;
}

type ProvisioningMode = 'full' | 'semi' | 'none' | 'temporary';

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

    // Estados para notebooks, cellPhones e vehicles
    const [notebooks, setNotebooks] = useState<NotebookItem[]>([]);
    const [cellPhones, setCellPhones] = useState<CellPhoneItem[]>([]);
    const [vehicles, setVehicles] = useState<VehicleItem[]>([]);

    const [provisioningMode, setProvisioningMode] = useState<ProvisioningMode>('full');
    // Contrato Temporário: tempo mínimo 90 dias, máximo 120 dias, sem Sistema S
    const [temporaryContractDays, setTemporaryContractDays] = useState<number>(90);

    const [recruitmentType, setRecruitmentType] = useState<'indication' | 'selection'>('selection');
    const [clientName, setClientName] = useState('');
    const [clientCnpj, setClientCnpj] = useState('');

    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);

        // Mask: XX.XXX.XXX/XXXX-XX
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');

        setClientCnpj(value);
    };

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
        // Alimentação e Transporte
        { id: 'transport', name: 'Vale Transporte', type: 'daily', quantity: 1, unitValue: BENEFIT_OPTIONS.others.transport.defaultValue, days: 22, discountType: 'percentage', discountValue: 0.06, discountBase: 'salary' }, // 6% padrão sobre salário base
        { id: 'meal', name: 'Refeição', type: 'daily', quantity: 1, unitValue: BENEFIT_OPTIONS.others.meal.defaultValue, days: 22, discountType: 'percentage', discountValue: 0.05 },
        { id: 'food', name: 'Vale Alimentação', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.food.defaultValue, discountType: 'percentage', discountValue: 0.01 },
        // Saúde e Bem estar  
        { id: 'medical', name: 'Plano Médico', type: 'plan_selection', quantity: 1, unitValue: 0, discountType: 'percentage', discountValue: 0.02, selectedPlanId: BENEFIT_OPTIONS.medical[2].id },
        { id: 'dental', name: 'Plano Odontológico', type: 'plan_selection', quantity: 1, unitValue: 0, discountType: 'fixed', discountValue: 0, selectedPlanId: BENEFIT_OPTIONS.dental[0].id },
        { id: 'pharmacy', name: 'Auxílio Farmácia | Omni', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.pharmacy.defaultValue, discountType: 'fixed', discountValue: 0 },
        { id: 'healthCare', name: 'Saúde da Gente', type: 'monthly', quantity: 0, unitValue: BENEFIT_OPTIONS.others.healthCare?.defaultValue || 40, discountType: 'fixed', discountValue: 0 },
        { id: 'wellhub', name: 'Wellhub Bem estar', type: 'monthly', quantity: 1, unitValue: 29.90, discountType: 'fixed', discountValue: 29.90 }, // Wellhub fixo, desconto integral colaborador
        // Outros
        { id: 'lifeInsurance', name: 'Seguro de Vida', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.lifeInsurance.defaultValue, discountType: 'fixed', discountValue: 0 },
        { id: 'gpsPoint', name: 'Controle de Ponto GPS', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.gpsPoint.defaultValue, discountType: 'fixed', discountValue: 0 },
        { id: 'plr', name: 'PLR', type: 'monthly', quantity: 1, unitValue: BENEFIT_OPTIONS.others.plr.defaultValue, discountType: 'fixed', discountValue: 0 },
        // Exames (sem desconto, custo integral do cliente)
        { id: 'exam-aso', name: 'Exames Clínicos - ASO', type: 'monthly', quantity: 1, unitValue: EXAM_OPTIONS.find(e => e.id === 'exam-aso')?.value || 0, discountType: 'fixed', discountValue: 0 },
        { id: 'exam-comp', name: 'Exames Médicos Complementares', type: 'monthly', quantity: 0, unitValue: 0, discountType: 'fixed', discountValue: 0 },
        { id: 'exam-pcmso', name: 'PCMSO', type: 'monthly', quantity: 1, unitValue: EXAM_OPTIONS.find(e => e.id === 'exam-pcmso')?.value || 0, discountType: 'fixed', discountValue: 0 },
    ]);

    // Custos Operacionais: EPI, Materiais de Trabalho, Notebooks, Celulares, Veículos
    const [operationalItems, setOperationalItems] = useState<(
        EpiItem & { type?: 'epi' | 'material' | 'notebook' | 'cellphone' | 'vehicle' }
    )[]>([
        { id: 'epi-1', name: 'Capacete', quantity: 0, unitCost: 50, frequency: 'annually', type: 'epi' },
        { id: 'epi-2', name: 'Luvas', quantity: 0, unitCost: 15, frequency: 'quarterly', type: 'epi' },
        { id: 'epi-3', name: 'Óculos de Proteção', quantity: 0, unitCost: 30, frequency: 'annually', type: 'epi' },
        // Adicione materiais de trabalho, notebooks, celulares, veículos conforme necessário
    ]);
    // Outras despesas
    const [otherExpenses, setOtherExpenses] = useState<number>(0);


    // Charges Config (Detailed)
    const [satRate, setSatRate] = useState<number>(LABOR_CHARGES.groupA.sat);
    // Removed showChargesConfig (Always visible)

    // Fees (Removed Backup Fee)
    const [adminFeePercent, setAdminFeePercent] = useState<number>(0.10); // Taxa Administrativa default 10%
    const [calculationMode, setCalculationMode] = useState<'5_columns' | 'final_rate'>('5_columns'); // 5 Colunas (Sobre Custo) vs Taxa Final (Sobre Faturamento)


    // Operational Costs (ex-Recruitment)
    // Valor digitável para Operação Administrativa
    const [operationalAdminCost, setOperationalAdminCost] = useState<number>(0);
    const [operationalAdminDays, setOperationalAdminDays] = useState<number>(0); // Dias de operação administrativa
    const [extraCosts, setExtraCosts] = useState<{ id: string, name: string, value: number }[]>([]); // Custos Extras

    // ISS Selection
    const [selectedCity, setSelectedCity] = useState<string>('São Paulo - SP');

    const [result, setResult] = useState<any>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);

    // Section Confirmation State
    const [confirmedSections, setConfirmedSections] = useState<Record<string, boolean>>({
        roles: false,
        charges: false,
        benefits: false,
        exams: false,
        operational: false,
        op_recruitment: false,
        op_admin: false,
        op_extras: false,
        epi: false,
        materials: false,
        taxes: false,
        fees: false
    });

    const toggleSection = (section: string) => {
        setConfirmedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const allSectionsConfirmed = Object.entries(confirmedSections).every(([key, value]) => {
        // Skip operational subsections if recruitmentType is 'indication'
        if (recruitmentType === 'indication' && ['op_recruitment', 'op_admin', 'op_extras', 'operational'].includes(key)) return true;
        return value;
    });


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

                // Add custom benefits from settings
                if (settings.benefit_options.custom && settings.benefit_options.custom.length > 0) {
                    setBenefitsList(prev => {
                        const existingIds = new Set(prev.map(p => p.id));
                        const newItems = settings.benefit_options.custom
                            ?.filter((c: any) => !existingIds.has(c.id))
                            .map((c: any) => ({
                                id: c.id,
                                name: c.name,
                                type: 'custom',
                                quantity: 1,
                                unitValue: c.value,
                                discountType: 'fixed',
                                discountValue: 0,
                                days: 0,
                                discountBase: 'benefit'
                            } as BenefitItem)) || [];

                        return [...prev, ...newItems];
                    });
                }
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

    const calculateBenefitRow = (item: BenefitItem, averageBaseSalary: number = 0) => {
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

        // Regra Wellhub: sempre sem desconto, cliente paga valor integral
        if (item.id === 'wellhub') {
            collabDiscount = 0;
        }
        // Regra de Vale Transporte: comportamento configurável
        else if (item.id === 'transport') {
            // Sempre 6% do salário base
            const base = averageBaseSalary;
            let computedDiscount = 0;
            if (base > 0) {
                computedDiscount = base * 0.06;
            }
            // Limita desconto ao valor fornecido
            if (computedDiscount >= providedValue) {
                collabDiscount = providedValue;
            } else {
                collabDiscount = computedDiscount;
            }
        }
        // Regra de VR e VA: Limite de 20% do valor fornecido
        else if (['meal', 'food'].includes(item.id)) {
            if (item.discountType === 'percentage') {
                // Limita percentual a 20%
                const maxDiscountPercent = 0.20;
                const effectiveDiscount = Math.min(item.discountValue, maxDiscountPercent);
                collabDiscount = providedValue * effectiveDiscount;
            } else {
                // Limita valor fixo a 20% do fornecido
                const maxDiscountValue = providedValue * 0.20;
                collabDiscount = Math.min(item.discountValue, maxDiscountValue);
            }
        }
        // Outros benefícios
        else {
            if (item.discountType === 'percentage') {
                collabDiscount = providedValue * item.discountValue;
            } else {
                collabDiscount = item.discountValue;
            }
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


        // Contrato Temporário: encargos proporcionais ao período, sem Sistema S
        let groupBPercent = 0;
        let groupBItems = { ...LABOR_CHARGES.groupB };
        let months = 12;
        if (provisioningMode === 'temporary') {
            months = Math.max(3, Math.min(4, Math.round(temporaryContractDays / 30)));
            // Remove Sistema S (já não está em groupA)
            // Proporcionalizar encargos
            Object.keys(groupBItems).forEach(k => {
                groupBItems[k as keyof typeof groupBItems] = groupBItems[k as keyof typeof groupBItems] * (months / 12);
            });
            groupBPercent = Object.values(groupBItems).reduce((a, b) => a + b, 0);
        } else if (provisioningMode === 'none') {
            groupBPercent = 0;
            Object.keys(groupBItems).forEach(k => groupBItems[k as keyof typeof groupBItems] = 0);
        } else if (provisioningMode === 'semi') {
            groupBItems.aviso_previo = 0;
            groupBItems.deposito_rescisao = 0;
            groupBItems.auxilio_doenca = 0;
            groupBPercent = Object.values(groupBItems).reduce((a, b) => a + b, 0);
        } else {
            groupBPercent = Object.values(LABOR_CHARGES.groupB).reduce((a, b) => a + b, 0);
        }

        // Proporcionalizar salários, benefícios e encargos para temporário
        const proportional = (value: number) => provisioningMode === 'temporary' ? value * (months / 12) : value;

        const groupAValue = proportional(totalGrossSalary * groupAPercent);
        const groupBValue = proportional(totalGrossSalary * groupBPercent);
        const totalCharges = groupAValue + groupBValue;

        // Benefits - New Logic
        let totalBenefits = 0;
        let totalExams = 0;
        const benefitsBreakdown: Array<any> = [];

        // Calculate average base salary for VT discount calculation
        const averageBaseSalary = totalPositions > 0 ? totalBaseSalary / totalPositions : 0;

        benefitsList.forEach(item => {
            const { unitValue, providedValue, collabDiscount, clientCost } = calculateBenefitRow(item, averageBaseSalary);

            benefitsBreakdown.push({
                id: item.id,
                name: item.name,
                type: item.type,
                unitValue,
                providedValue,
                collabDiscount,
                clientCost,
                discountBase: item.discountBase || 'salary',
                discountType: item.discountType,
                discountValue: item.discountValue
            });

            // Proporcionalizar benefícios para temporário
            const benefitValue = proportional(clientCost * totalPositions);
            if (item.id.startsWith('exam-')) {
                totalExams += benefitValue;
            } else {
                totalBenefits += benefitValue;
            }
        });





        // Subtotal for Fees (Salaries + Charges + Benefits + Exams)
        const costBasis = proportional(totalGrossSalary) + totalCharges + totalBenefits + totalExams;

        // Fees (Removed Backup Fee)
        // Fees calculation moved to end


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

        // 4. EPI Costs (materiais de segurança)
        const epiCostTotal = operationalItems.filter(item => item.type === 'epi').reduce((sum, item) => {
            const frequencyMultiplier = {
                'monthly': 1,
                'quarterly': 1 / 3,
                'annually': 1 / 12,
                'one-time': 0 // Custo único não conta no mensal
            }[item.frequency];
            return sum + (item.quantity * item.unitCost * frequencyMultiplier * totalPositions);
        }, 0);

        // 5. Notebooks Cost (custo mensal)
        const notebooksCostTotal = notebooks.reduce((sum, item) => {
            return sum + (item.quantity * item.unitCost);
        }, 0);

        // 6. Cell Phones Cost (custo mensal do plano)
        const cellPhonesCostTotal = cellPhones.reduce((sum, item) => {
            return sum + (item.quantity * item.monthlyCost);
        }, 0);

        // 7. Vehicles Cost (custo mensal - aluguel + combustível + manutenção)
        const vehiclesCostTotal = vehicles.reduce((sum, item) => {
            return sum + (item.quantity * item.monthlyCost);
        }, 0);

        // Total Operational Cost (Custo Operacional)
        const totalOperationalCostValue = recruitmentTeamCost + operationalAdminCost + extraCostTotal +
            epiCostTotal + notebooksCostTotal + cellPhonesCostTotal + vehiclesCostTotal;



        // Taxes (Tributos) - ISS tabela ampliada
        const issRateOptions = [
            { city: 'São Paulo - SP', rate: 0.05 },
            { city: 'Barueri - SP', rate: 0.02 },
            { city: 'Campinas - SP', rate: 0.02 },
            { city: 'Rio de Janeiro - RJ', rate: 0.05 },
            { city: 'Belo Horizonte - MG', rate: 0.05 },
            { city: 'Curitiba - PR', rate: 0.05 },
            { city: 'Porto Alegre - RS', rate: 0.05 },
            { city: 'Salvador - BA', rate: 0.05 },
            { city: 'Outra Localidade (5%)', rate: 0.05 },
        ];
        const selectedIssRate = issRateOptions.find(opt => opt.city === selectedCity)?.rate || 0.05;

        // IRRF agora 1,5%
        const irrfRate = 0.015;
        const totalTaxRate =
            selectedIssRate +
            LABOR_TAX_RATES.pis +
            LABOR_TAX_RATES.cofins +
            irrfRate +
            LABOR_TAX_RATES.csll;

        // --- PRICING LOGIC (5 Colunas vs Taxa Final) ---
        let adminFeeValue = 0;
        let grossNF = 0;

        // Adiciona outras despesas ao custo operacional
        const totalOperationalCostValueWithOther = totalOperationalCostValue + otherExpenses;
        if (calculationMode === '5_columns') {
            // 5 Colunas: Fee is % of Cost Basis (Labor)
            adminFeeValue = costBasis * adminFeePercent;
            grossNF = (costBasis + totalOperationalCostValueWithOther + adminFeeValue) / (1 - totalTaxRate);
        } else {
            // Taxa Final: Fee is % of Gross Revenue (Markup)
            grossNF = (costBasis + totalOperationalCostValueWithOther) / (1 - totalTaxRate - adminFeePercent);
            adminFeeValue = grossNF * adminFeePercent;
        }

        const totalFees = adminFeeValue;
        const totalTaxes = grossNF * totalTaxRate;
        const totalOperationalCost = costBasis + totalOperationalCostValue + adminFeeValue; // For internal reference

        // Individual Taxes
        const issValue = grossNF * selectedIssRate;
        const pisValue = grossNF * LABOR_TAX_RATES.pis;
        const cofinsValue = grossNF * LABOR_TAX_RATES.cofins;
        const irrfValue = grossNF * irrfRate;
        const csllValue = grossNF * LABOR_TAX_RATES.csll;

        // NEW TOTALS
        // Total Bruto (NF)
        // Regra: Se "Taxa Final" (Item 9) for o modo selecionado, o valor da taxa não entra na soma exibida.
        const totalBrutoNF = calculationMode === 'final_rate' ? (grossNF - adminFeeValue) : grossNF;

        // Total Líquido (Recebido) = Valor Bruto da NF - Retenção IR (1,5%)
        const retentionIR = irrfRate;
        const totalLiquido = grossNF - (grossNF * retentionIR);

        // Lucro Líquido = Líquido Recebido - Tributos - Custo Operacional (inclui outras despesas)
        const lucroLiquido = totalLiquido - totalTaxes - totalOperationalCostValueWithOther;


        return {
            groupAValue,
            groupAPercent,
            groupBValue,
            groupBPercent,
            groupBItems, // Pass modified items for display
            totalCharges,
            totalBenefits,
            totalExams,
            benefitsBreakdown,
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
            epiCostTotal,
            notebooksCostTotal,
            cellPhonesCostTotal,
            vehiclesCostTotal,
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
            lucroOperacional: lucroLiquido
        };
    };

    // Auto-calculate and save result for PDF generation
    useEffect(() => {
        const calculatedResult = calculateLaborPricing();
        setResult(calculatedResult);
    }, [positions, benefitsList, operationalItems, notebooks, cellPhones, vehicles,
        provisioningMode, recruitmentType, qtySenior, qtyPlena, qtyJunior, demandedDays,
        teamRates, appSettings, adminFeePercent, calculationMode, selectedCity, extraCosts, operationalAdminDays]);

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

    // Benefits categorization helper
    const getCategoryInfo = (id: string) => {
        if (['transport', 'meal', 'food'].includes(id) || id.startsWith('transport_custom_')) return { name: 'Alimentação e Transporte', icon: '🍽️', color: 'orange' };
        if (['medical', 'dental', 'pharmacy', 'healthCare', 'wellhub'].includes(id) || id.startsWith('health_custom_')) return { name: 'Saúde e Bem estar', icon: '🏥', color: 'blue' };
        if (id.startsWith('exam-') || id.startsWith('exam_custom_')) return { name: 'Exames', icon: '🩺', color: 'purple' };
        return { name: 'Outros', icon: '🔧', color: 'gray' };
    };

    // Calculate average base salary for VT discount calculation
    const averageBaseSalary = React.useMemo(() => {
        let totalBaseSalary = 0;
        let totalVacancies = 0;
        positions.forEach(pos => {
            totalBaseSalary += pos.baseSalary * pos.vacancies;
            totalVacancies += pos.vacancies;
        });
        return totalVacancies > 0 ? totalBaseSalary / totalVacancies : 0;
    }, [positions]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-12 animate-fade-in overflow-x-hidden">
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

                <div className="space-y-8">

                    {/* Client Name & CNPJ Input */}

                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Briefcase size={16} /> Dados do Cliente
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Nome do Cliente</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Digite o nome..."
                                    className="w-full text-lg font-bold text-metarh-dark border-b-2 border-gray-100 focus:border-metarh-medium outline-none py-2 transition-colors placeholder-gray-300 bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">CNPJ</label>
                                <input
                                    type="text"
                                    value={clientCnpj}
                                    onChange={handleCnpjChange}
                                    placeholder="XX.XXX.XXX/0001-XX"
                                    maxLength={18}
                                    className="w-full text-lg font-bold text-metarh-dark border-b-2 border-gray-100 focus:border-metarh-medium outline-none py-2 transition-colors placeholder-gray-300 bg-transparent font-mono"
                                />
                            </div>
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
                            <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${provisioningMode === 'temporary' ? 'bg-metarh-medium text-white border-metarh-medium' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                                <input
                                    type="radio"
                                    name="provisioningMode"
                                    value="temporary"
                                    checked={provisioningMode === 'temporary'}
                                    onChange={() => setProvisioningMode('temporary')}
                                    className="hidden"
                                />
                                <span className="font-bold text-sm">Contrato Temporário</span>
                            </label>
                            {provisioningMode === 'temporary' && (
                                <div className="flex items-center gap-2 ml-4">
                                    <span className="text-xs font-medium">Duração:</span>
                                    <input
                                        type="number"
                                        min={90}
                                        max={120}
                                        value={temporaryContractDays}
                                        onChange={e => setTemporaryContractDays(Math.max(90, Math.min(120, Number(e.target.value))))}
                                        className="w-16 px-2 py-1 rounded border border-gray-300 text-center"
                                    />
                                    <span className="text-xs">dias</span>
                                </div>
                            )}
                        </div>

                        {/* Contract Types Explanation */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Info size={20} className="text-blue-600" />
                                Entenda os Tipos de Contratos
                            </h3>
                            <div className="grid md:grid-cols-4 gap-4">
                                {/* Provisionado */}
                                <div className={`bg-white p-4 rounded-3xl border-2 transition-all ${provisioningMode === 'full' ? 'border-metarh-medium shadow-md' : 'border-gray-200'}`}>
                                    <h4 className="font-bold text-gray-800 mb-2">Provisionado</h4>
                                    <p className="text-xs text-gray-600 mb-3">Inclui todas as provisões trabalhistas (Grupo A + Grupo B completo)</p>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs font-bold text-green-700 mb-1">✓ Pontos Positivos:</p>
                                            <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                                <li>• Segurança Financeira para METARH</li>
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

                                {/* Contrato Temporário */}
                                <div className={`bg-white p-4 rounded-3xl border-2 transition-all ${provisioningMode === 'temporary' ? 'border-metarh-medium shadow-md' : 'border-gray-200'}`}>
                                    <h4 className="font-bold text-gray-800 mb-2">Contrato Temporário</h4>
                                    <p className="text-xs text-gray-600 mb-3">Duração limitada (90 a 120 dias), sem Sistema S.</p>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs font-bold text-green-700 mb-1">✓ Pontos Positivos:</p>
                                            <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                                <li>• Atende demandas sazonais ou emergenciais</li>
                                                <li>• Reduz vínculo e obrigações de longo prazo</li>
                                                <li>• Processo de contratação mais ágil</li>
                                                <li>• Possibilidade de extensão do contrato</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-red-700 mb-1">✗ Pontos Negativos:</p>
                                            <ul className="text-xs text-gray-600 space-y-1 ml-3">
                                                <li>• Não inclui todos os benefícios do CLT</li>
                                                <li>• Menor engajamento do colaborador</li>
                                                <li>• Limitação de tempo para retenção de talentos</li>
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
                                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all ${confirmedSections.roles ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h2 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                                            <Users size={18} /> 1. Cargos e Salários
                                        </h2>
                                    </div>

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
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.roles ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.roles ? 'translate-x-3' : 'translate-x-0'}`} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${confirmedSections.roles ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {confirmedSections.roles ? 'Revisado' : 'Confirmar'}
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={confirmedSections.roles}
                                                        onChange={() => toggleSection('roles')}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <div className="bg-metarh-medium/10 px-4 py-2 rounded-2xl border border-metarh-medium/20">
                                                    <span className="text-xs font-bold text-gray-600 uppercase mr-2">Total Salário Bruto:</span>
                                                    <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.totalGrossSalary)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. CHARGES (ENCARGOS) */}
                                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all ${confirmedSections.charges ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h2 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                                            <Settings size={18} /> 2. Encargos
                                        </h2>
                                    </div>

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
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer select-none bg-white/50 px-3 py-1.5 rounded-full border border-metarh-medium/20">
                                                <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.charges ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.charges ? 'translate-x-3' : 'translate-x-0'}`} />
                                                </div>
                                                <span className={`text-xs font-bold ${confirmedSections.charges ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {confirmedSections.charges ? 'Revisado' : 'Confirmar'}
                                                </span>
                                                <input type="checkbox" checked={confirmedSections.charges} onChange={() => toggleSection('charges')} className="hidden" />
                                            </label>
                                            <span className="text-sm font-bold text-metarh-dark uppercase">Total de Encargos (A + B)</span>
                                        </div>
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

                                {/* 3. BENEFITS (Organized by Category) */}

                                {/* 3. BENEFITS (Organized by Category) */}
                                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all ${confirmedSections.benefits ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h2 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                                            <Sparkles size={18} /> 3. Benefícios
                                        </h2>
                                    </div>

                                    {/* Benefits organized by category */}
                                    <div className="space-y-6">
                                        {['Alimentação e Transporte', 'Saúde e Bem estar', 'Outros'].map(categoryName => {
                                            const categoryItems = benefitsList.filter(item => getCategoryInfo(item.id).name === categoryName);
                                            if (categoryItems.length === 0) return null;

                                            const categoryInfo = getCategoryInfo(categoryItems[0].id);
                                            let categorySubtotal = 0;

                                            return (
                                                <div key={categoryName} className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm mb-8">
                                                    {/* Category Header */}
                                                    <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center gap-3 backdrop-blur-sm">
                                                        <span className="text-2xl bg-white p-2 rounded-xl shadow-sm border border-gray-100">{categoryInfo.icon}</span>
                                                        <h3 className="text-lg font-bold text-gray-800">{categoryName}</h3>
                                                        <div className="ml-auto bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
                                                            {categoryItems.length} itens
                                                        </div>
                                                    </div>

                                                    <div className="p-2 md:p-6">
                                                        {/* Table Header - Visible only on larger screens */}
                                                        <div className="hidden md:grid grid-cols-12 gap-4 mb-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            <div className="col-span-3">Benefício</div>
                                                            <div className="col-span-1 text-center">Qtd</div>
                                                            <div className="col-span-2 text-center">Valor Unit.</div>
                                                            <div className="col-span-2 text-center">Dias</div>
                                                            <div className="col-span-2 text-center">Desconto</div>
                                                            <div className="col-span-2 text-right">Custo</div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            {categoryItems.map((item) => {
                                                                const { unitValue, providedValue, collabDiscount, clientCost } = calculateBenefitRow(item, averageBaseSalary);
                                                                categorySubtotal += clientCost * (result?.totalPositions || 1);

                                                                return (
                                                                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-metarh-medium/30 hover:shadow-md transition-all group">
                                                                        <div className="grid md:grid-cols-12 gap-4 items-center">

                                                                            {/* 1. Name & Selection */}
                                                                            <div className="col-span-12 md:col-span-3">
                                                                                <div className="flex flex-col">
                                                                                    {item.type === 'custom' ? (
                                                                                        <div className="flex items-center gap-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={item.name}
                                                                                                onChange={(e) => updateBenefit(item.id, 'name', e.target.value)}
                                                                                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-metarh-medium/20 outline-none transition-all"
                                                                                                placeholder="Nome"
                                                                                            />
                                                                                            <button onClick={() => setBenefitsList(prev => prev.filter(i => i.id !== item.id))} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                                                                <Trash2 size={16} />
                                                                                            </button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <span className="text-sm font-bold text-gray-700 pl-1">{item.name}</span>
                                                                                    )}

                                                                                    {item.type === 'plan_selection' && (
                                                                                        <select
                                                                                            value={item.selectedPlanId}
                                                                                            onChange={(e) => updateBenefit(item.id, 'selectedPlanId', e.target.value)}
                                                                                            className="mt-1 w-full p-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-600 focus:ring-2 focus:ring-metarh-medium/20 outline-none cursor-pointer hover:bg-white transition-colors"
                                                                                        >
                                                                                            {item.id === 'medical' && BENEFIT_OPTIONS.medical.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                                                            {item.id === 'dental' && BENEFIT_OPTIONS.dental.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                                                            {item.id === 'wellhub' && BENEFIT_OPTIONS.wellhub.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                                                                        </select>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* 2. Quantity */}
                                                                            <div className="col-span-4 md:col-span-1">
                                                                                <label className="md:hidden block text-[10px] font-bold text-gray-400 uppercase mb-1">Qtd</label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.quantity}
                                                                                    onChange={(e) => updateBenefit(item.id, 'quantity', Number(e.target.value))}
                                                                                    className="w-full p-2 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-metarh-medium/20 outline-none font-bold hover:bg-white transition-colors"
                                                                                    min="0"
                                                                                />
                                                                            </div>

                                                                            {/* 3. Value */}
                                                                            <div className="col-span-4 md:col-span-2">
                                                                                <label className="md:hidden block text-[10px] font-bold text-gray-400 uppercase mb-1">Valor</label>
                                                                                {item.type === 'plan_selection' ? (
                                                                                    <div className="w-full p-2 text-center bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 truncate font-bold">
                                                                                        {fmtCurrency(unitValue)}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="relative group/val">
                                                                                        <input
                                                                                            type="number"
                                                                                            value={item.unitValue}
                                                                                            onChange={(e) => updateBenefit(item.id, 'unitValue', Number(e.target.value))}
                                                                                            className="w-full p-2 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-metarh-medium/20 outline-none font-bold hover:bg-white transition-colors"
                                                                                            step="0.01"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                                {item.type === 'daily' && (item.days || 0) > 0 && (
                                                                                    <div className="absolute top-full left-0 w-full text-[9px] text-gray-400 text-center mt-1 hidden md:block pointer-events-none">
                                                                                        Total: {fmtCurrency(item.quantity * unitValue * (item.days || 0))}
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* 4. Days (if daily) */}
                                                                            <div className="col-span-4 md:col-span-2">
                                                                                <label className="md:hidden block text-[10px] font-bold text-gray-400 uppercase mb-1">Dias</label>
                                                                                {item.type === 'daily' ? (
                                                                                    <input
                                                                                        type="number"
                                                                                        value={item.days}
                                                                                        onChange={(e) => updateBenefit(item.id, 'days', Number(e.target.value))}
                                                                                        className="w-full p-2 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-metarh-medium/20 outline-none font-bold hover:bg-white transition-colors"
                                                                                        min="0"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="text-center text-gray-300">-</div>
                                                                                )}
                                                                            </div>

                                                                            {/* 5. Discount */}
                                                                            <div className="col-span-12 md:col-span-2">
                                                                                {!['wellhub', 'gpsPoint', 'plr'].includes(item.id) ? (
                                                                                    <div className="relative group/discount">
                                                                                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 hover:border-metarh-medium/30 transition-colors">
                                                                                            <input
                                                                                                type="number"
                                                                                                value={item.discountType === 'percentage' ? Number((item.discountValue * 100).toFixed(2)) : item.discountValue}
                                                                                                onChange={(e) => {
                                                                                                    let val = Number(e.target.value);
                                                                                                    if (item.discountType === 'percentage') {
                                                                                                        if (item.id === 'transport' && val > 6) val = 6;
                                                                                                        if (['meal', 'food'].includes(item.id) && val > 20) val = 20;
                                                                                                    } else {
                                                                                                        if (['meal', 'food'].includes(item.id)) {
                                                                                                            const calcProvidedValue = item.type === 'daily' ? (item.quantity * item.unitValue * (item.days || 0)) : (item.quantity * item.unitValue);
                                                                                                            const maxFixedDiscount = calcProvidedValue * 0.20;
                                                                                                            if (val > maxFixedDiscount) val = maxFixedDiscount;
                                                                                                        }
                                                                                                    }
                                                                                                    updateBenefit(item.id, 'discountValue', item.discountType === 'percentage' ? val / 100 : val);
                                                                                                }}
                                                                                                className="w-full bg-transparent text-center text-sm font-bold outline-none"
                                                                                            />
                                                                                            <button
                                                                                                onClick={() => updateBenefit(item.id, 'discountType', item.discountType === 'percentage' ? 'fixed' : 'percentage')}
                                                                                                className="text-[10px] font-bold text-gray-500 hover:text-metarh-medium px-1"
                                                                                            >
                                                                                                {item.discountType === 'percentage' ? '%' : 'R$'}
                                                                                            </button>
                                                                                        </div>
                                                                                        {/* Alinhamento removido: botão de alternância não é mais necessário */}
                                                                                        {collabDiscount > 0 && (
                                                                                            <div className="absolute top-full left-0 w-full text-[10px] text-red-400 text-center font-medium mt-1 pointer-events-none">
                                                                                                -{fmtCurrency(collabDiscount)}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-center text-gray-300 text-xs">Sem desconto</div>
                                                                                )}
                                                                            </div>

                                                                            {/* 6. Total Cost */}
                                                                            <div className="col-span-12 md:col-span-2 text-right">
                                                                                <div className="flex justify-between md:block items-center">
                                                                                    <span className="md:hidden text-xs font-bold text-gray-500 uppercase">Custo</span>
                                                                                    <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(clientCost)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Info Boxes (VT/VR) - Full Width inside row */}
                                                                        {(item.id === 'transport' || ['meal', 'food'].includes(item.id)) && (
                                                                            <div className="mt-3 pt-2 border-t border-gray-100 grid md:grid-cols-12 gap-4 items-start">
                                                                                <div className="md:col-span-4"></div>
                                                                                <div className="md:col-span-8">
                                                                                    {item.id === 'transport' && (
                                                                                        <div className="flex items-start gap-2 text-[10px] text-blue-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                                                                                            <Info size={12} className="mt-0.5 flex-shrink-0" />
                                                                                            <p>
                                                                                                <strong>Regra VT:</strong> 6% do salário base. Se desconto {'>'} valor, custo zero para o cliente.
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                    {['meal', 'food'].includes(item.id) && (
                                                                                        <div className="flex items-start gap-2 text-[10px] text-amber-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                                                                                            <Info size={12} className="mt-0.5 flex-shrink-0" />
                                                                                            <p><strong>Limite PAT:</strong> Desconto máx. de 20% do valor do benefício.</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>


                                                                );
                                                            })}
                                                        </div>

                                                    </div>

                                                    {/* Footer Actions & Subtotal */}
                                                    <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                                        <button
                                                            onClick={() => {
                                                                let prefix = 'other_custom_';
                                                                if (categoryName === 'Alimentação e Transporte') prefix = 'transport_custom_';
                                                                if (categoryName === 'Saúde e Bem estar') prefix = 'health_custom_';
                                                                if (categoryName === 'Exames') prefix = 'exam_custom_';

                                                                const newBenefit: BenefitItem = {
                                                                    id: `${prefix}${Date.now()}`,
                                                                    name: `Novo - ${categoryName}`,
                                                                    type: 'custom',
                                                                    quantity: 1,
                                                                    unitValue: 0,
                                                                    discountType: 'percentage',
                                                                    discountValue: 0,
                                                                    days: 0,
                                                                    discountBase: 'benefit'
                                                                };
                                                                setBenefitsList(prev => [...prev, newBenefit]);
                                                            }}
                                                            className="text-xs font-bold text-metarh-medium hover:text-metarh-dark flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-metarh-medium/10 transition-colors"
                                                        >
                                                            <Plus size={14} /> Adicionar Item
                                                        </button>

                                                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                                            <span className="text-xs font-bold text-gray-500 uppercase">Subtotal {categoryName}</span>
                                                            <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(categorySubtotal)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Total Benefits Display */}
                                    {
                                        result && (
                                            <div className="bg-gradient-to-r from-metarh-medium/10 to-metarh-dark/10 border-2 border-metarh-medium rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-metarh-dark uppercase">✨ Total Benefícios:</span>
                                                        <span className="text-3xl font-bold text-metarh-dark">{fmtCurrency(result.totalBenefits)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Soma dos subtotais de categorias (Custo Cliente)</p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                                        <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.benefits ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.benefits ? 'translate-x-3' : 'translate-x-0'}`} />
                                                        </div>
                                                        <span className={`text-xs font-bold ${confirmedSections.benefits ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {confirmedSections.benefits ? 'Revisado' : 'Confirmar'}
                                                        </span>
                                                        <input type="checkbox" checked={confirmedSections.benefits} onChange={() => toggleSection('benefits')} className="hidden" />
                                                    </label>
                                                </div>
                                            </div>
                                        )
                                    }
                                </div >

                                {/* 4. EXAMES */}
                                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all ${confirmedSections.exams ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h2 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                                            {/* Use the stethoscope icon for the section header */}
                                            <span className="text-xl">🩺</span> 4. Exames
                                        </h2>
                                    </div>

                                    {/* Items for Exames */}
                                    <div className="space-y-6">
                                        {['Exames'].map(categoryName => {
                                            const categoryItems = benefitsList.filter(item => getCategoryInfo(item.id).name === categoryName);
                                            if (categoryItems.length === 0) return (
                                                <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                                                    Nenhum exame selecionado
                                                </div>
                                            );

                                            const categoryInfo = getCategoryInfo(categoryItems[0].id);
                                            let categorySubtotal = 0;

                                            return (
                                                <div key={categoryName} className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm mb-4">
                                                    {/* Category Header */}
                                                    <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex items-center gap-3 backdrop-blur-sm">
                                                        <span className="text-2xl bg-white p-2 rounded-xl shadow-sm border border-gray-100">{categoryInfo.icon}</span>
                                                        <h3 className="text-lg font-bold text-gray-800">{categoryName}</h3>
                                                        <div className="ml-auto bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
                                                            {categoryItems.length} itens
                                                        </div>
                                                    </div>

                                                    <div className="p-2 md:p-6">
                                                        {/* Table Header */}
                                                        <div className="hidden md:grid grid-cols-12 gap-4 mb-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            <div className="col-span-3">Item</div>
                                                            <div className="col-span-1 text-center">Qtd</div>
                                                            <div className="col-span-2 text-center">Valor Unit.</div>
                                                            <div className="col-span-2 text-center">Dias</div>
                                                            <div className="col-span-2 text-center">Desconto</div>
                                                            <div className="col-span-2 text-right">Custo</div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            {categoryItems.map((item) => {
                                                                const { unitValue, clientCost, collabDiscount } = calculateBenefitRow(item, result?.totalBaseSalary / (result?.totalPositions || 1));
                                                                categorySubtotal += clientCost * (result?.totalPositions || 1);

                                                                return (
                                                                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-3 hover:border-metarh-medium/30 hover:shadow-md transition-all group">
                                                                        <div className="grid md:grid-cols-12 gap-4 items-center">
                                                                            {/* Name */}
                                                                            <div className="col-span-12 md:col-span-3">
                                                                                <div className="flex flex-col">
                                                                                    {item.type === 'custom' ? (
                                                                                        <div className="flex items-center gap-2">
                                                                                            <input
                                                                                                type="text"
                                                                                                value={item.name}
                                                                                                onChange={(e) => updateBenefit(item.id, 'name', e.target.value)}
                                                                                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none"
                                                                                                placeholder="Nome"
                                                                                            />
                                                                                            <button onClick={() => setBenefitsList(prev => prev.filter(i => i.id !== item.id))} className="text-gray-400 hover:text-red-500 p-2">
                                                                                                <Trash2 size={16} />
                                                                                            </button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <span className="text-sm font-bold text-gray-700 pl-1">{item.name}</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Quantity */}
                                                                            <div className="col-span-4 md:col-span-1">
                                                                                <input
                                                                                    type="number"
                                                                                    value={item.quantity}
                                                                                    onChange={(e) => updateBenefit(item.id, 'quantity', Number(e.target.value))}
                                                                                    className="w-full p-2 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                                                                                    min="0"
                                                                                />
                                                                            </div>

                                                                            {/* Value */}
                                                                            <div className="col-span-4 md:col-span-2">
                                                                                <div className="relative group/val">
                                                                                    <input
                                                                                        type="number"
                                                                                        value={item.unitValue}
                                                                                        onChange={(e) => updateBenefit(item.id, 'unitValue', Number(e.target.value))}
                                                                                        className="w-full p-2 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                                                                                        step="0.01"
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            {/* Days */}
                                                                            <div className="col-span-4 md:col-span-2">
                                                                                <div className="text-center text-gray-300">-</div>
                                                                            </div>

                                                                            {/* Discount */}
                                                                            <div className="col-span-12 md:col-span-2">
                                                                                <div className="relative group/discount">
                                                                                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                                                                                        <input
                                                                                            type="number"
                                                                                            value={item.discountType === 'percentage' ? Number((item.discountValue * 100).toFixed(2)) : item.discountValue}
                                                                                            onChange={(e) => updateBenefit(item.id, 'discountValue', item.discountType === 'percentage' ? Number(e.target.value) / 100 : Number(e.target.value))}
                                                                                            className="w-full bg-transparent text-center text-sm font-bold outline-none"
                                                                                        />
                                                                                        <button
                                                                                            onClick={() => updateBenefit(item.id, 'discountType', item.discountType === 'percentage' ? 'fixed' : 'percentage')}
                                                                                            className="text-[10px] font-bold text-gray-500 hover:text-metarh-medium px-1"
                                                                                        >
                                                                                            {item.discountType === 'percentage' ? '%' : 'R$'}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Cost */}
                                                                            <div className="col-span-12 md:col-span-2 text-right">
                                                                                <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(clientCost)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Category Footer - Add Custom Exam */}
                                                    <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                                                        <button
                                                            onClick={() => {
                                                                const newBenefit: BenefitItem = {
                                                                    id: `exam_custom_${Date.now()}`,
                                                                    name: `Novo - Exame`,
                                                                    type: 'custom',
                                                                    quantity: 1,
                                                                    unitValue: 0,
                                                                    discountType: 'percentage',
                                                                    discountValue: 0,
                                                                    days: 0,
                                                                    discountBase: 'benefit'
                                                                };
                                                                setBenefitsList(prev => [...prev, newBenefit]);
                                                            }}
                                                            className="text-xs font-bold text-metarh-medium hover:text-metarh-dark flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-metarh-medium/10 transition-colors"
                                                        >
                                                            <Plus size={14} /> Adicionar Exame
                                                        </button>
                                                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                                                            <span className="text-xs font-bold text-gray-500 uppercase">Subtotal</span>
                                                            <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(categorySubtotal)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Total Exams Confirmation */}
                                    {result && (
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-metarh-dark uppercase">💊 Total Exames:</span>
                                                    <span className="text-3xl font-bold text-metarh-dark">{fmtCurrency(result.totalExams)}</span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                                    <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.exams ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.exams ? 'translate-x-3' : 'translate-x-0'}`} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${confirmedSections.exams ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {confirmedSections.exams ? 'Revisado' : 'Confirmar'}
                                                    </span>
                                                    <input type="checkbox" checked={confirmedSections.exams} onChange={() => toggleSection('exams')} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 5. CUSTO OPERACIONAL */}
                                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all ${confirmedSections.operational ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h2 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                                            <Briefcase size={18} /> 5. Custo Operacional
                                        </h2>
                                    </div>

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
                                                            <div className="flex items-center gap-2">
                                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                    <div className={`w-6 h-4 rounded-full p-0.5 transition-colors ${confirmedSections.op_recruitment ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.op_recruitment ? 'translate-x-2' : 'translate-x-0'}`} />
                                                                    </div>
                                                                    <input type="checkbox" checked={confirmedSections.op_recruitment} onChange={() => toggleSection('op_recruitment')} className="hidden" />
                                                                </label>
                                                                <span className="text-xs font-bold text-gray-600">Subtotal:</span>
                                                            </div>
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
                                                            <div className="flex items-center gap-2">
                                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                    <div className={`w-6 h-4 rounded-full p-0.5 transition-colors ${confirmedSections.op_admin ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.op_admin ? 'translate-x-2' : 'translate-x-0'}`} />
                                                                    </div>
                                                                    <input type="checkbox" checked={confirmedSections.op_admin} onChange={() => toggleSection('op_admin')} className="hidden" />
                                                                </label>
                                                                <span className="text-xs font-bold text-gray-600">Subtotal:</span>
                                                            </div>
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
                                                            <div className="flex items-center gap-2">
                                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                                    <div className={`w-6 h-4 rounded-full p-0.5 transition-colors ${confirmedSections.op_extras ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.op_extras ? 'translate-x-2' : 'translate-x-0'}`} />
                                                                    </div>
                                                                    <input type="checkbox" checked={confirmedSections.op_extras} onChange={() => toggleSection('op_extras')} className="hidden" />
                                                                </label>
                                                                <span className="text-xs font-bold text-gray-600">Subtotal:</span>
                                                            </div>
                                                            <span className="text-sm font-bold text-orange-700">{fmtCurrency(result.extraCostTotal || 0)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total Custo Operacional Display - Novo padrão */}
                                    {result && recruitmentType === 'selection' && (
                                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-100 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-metarh-dark uppercase">💼 Total Custo Operacional:</span>
                                                    <span className="text-3xl font-bold text-metarh-dark">{fmtCurrency(result.totalOperationalCostValue || 0)}</span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                                    <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.operational ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.operational ? 'translate-x-3' : 'translate-x-0'}`} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${confirmedSections.operational ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {confirmedSections.operational ? 'Revisado' : 'Confirmar'}
                                                    </span>
                                                    <input type="checkbox" checked={confirmedSections.operational} onChange={() => toggleSection('operational')} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CUSTO OPERACIONAL */}
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 mt-8">
                                    <h2 className="text-2xl font-bold text-metarh-dark mb-6 flex items-center gap-2">
                                        <Briefcase size={22} /> Custo Operacional
                                    </h2>
                                    {/* Subitens: EPI, Material de Trabalho, Notebooks, Celulares, etc. */}
                                    <div className="space-y-8">
                                        {/* EPI - Materiais de Segurança */}
                                        <div>
                                            <h3 className="text-lg font-bold text-metarh-dark flex items-center gap-2 mb-2">
                                                <Shield size={18} /> EPI - Materiais de Segurança
                                            </h3>
                                            <div className="space-y-3">
                                                {operationalItems.filter(item => item.type === 'epi').map((item, idx) => (
                                                    <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                                        <div className="grid grid-cols-5 gap-3">
                                                            <div className="col-span-2">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item</label>
                                                                <input
                                                                    type="text"
                                                                    value={item.name}
                                                                    onChange={(e) => {
                                                                        const epiList = operationalItems.filter(i => i.type === 'epi');
                                                                        const newEpiList = [...epiList];
                                                                        newEpiList[idx].name = e.target.value;
                                                                        setOperationalItems([
                                                                            ...operationalItems.filter(i => i.type !== 'epi'),
                                                                            ...newEpiList
                                                                        ]);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    placeholder="Nome do EPI"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd</label>
                                                                <input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const epiList = operationalItems.filter(i => i.type === 'epi');
                                                                        const newEpiList = [...epiList];
                                                                        newEpiList[idx].quantity = Number(e.target.value);
                                                                        setOperationalItems([
                                                                            ...operationalItems.filter(i => i.type !== 'epi'),
                                                                            ...newEpiList
                                                                        ]);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    min="0"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo Unit.</label>
                                                                <input
                                                                    type="number"
                                                                    value={item.unitCost}
                                                                    onChange={(e) => {
                                                                        const epiList = operationalItems.filter(i => i.type === 'epi');
                                                                        const newEpiList = [...epiList];
                                                                        newEpiList[idx].unitCost = Number(e.target.value);
                                                                        setOperationalItems([
                                                                            ...operationalItems.filter(i => i.type !== 'epi'),
                                                                            ...newEpiList
                                                                        ]);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    step="0.01"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequência</label>
                                                                <select
                                                                    value={item.frequency}
                                                                    onChange={(e) => {
                                                                        const epiList = operationalItems.filter(i => i.type === 'epi');
                                                                        const newEpiList = [...epiList];
                                                                        newEpiList[idx].frequency = e.target.value as any;
                                                                        setOperationalItems([
                                                                            ...operationalItems.filter(i => i.type !== 'epi'),
                                                                            ...newEpiList
                                                                        ]);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                >
                                                                    <option value="monthly">Mensal</option>
                                                                    <option value="quarterly">Trimestral</option>
                                                                    <option value="annually">Anual</option>
                                                                    <option value="one-time">Única vez</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => setOperationalItems([...operationalItems, { id: `epi-${Date.now()}`, name: '', quantity: 0, unitCost: 0, frequency: 'monthly', type: 'epi' }])}
                                                    className="flex items-center gap-2 text-sm font-bold text-metarh-medium hover:underline"
                                                >
                                                    <Plus size={16} /> Adicionar EPI
                                                </button>
                                            </div>
                                            {result && (
                                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-metarh-dark uppercase">🛡️ Total EPI:</span>
                                                            <span className="text-3xl font-bold text-metarh-dark">{fmtCurrency(result.epiCostTotal || 0)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                                            <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.epi ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.epi ? 'translate-x-3' : 'translate-x-0'}`} />
                                                            </div>
                                                            <span className={`text-xs font-bold ${confirmedSections.epi ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {confirmedSections.epi ? 'Revisado' : 'Confirmar'}
                                                            </span>
                                                            <input type="checkbox" checked={confirmedSections.epi} onChange={() => toggleSection('epi')} className="hidden" />
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Material de Trabalho (Notebooks, Celulares, etc.) */}
                                        <div>
                                            <h3 className="text-lg font-bold text-metarh-dark flex items-center gap-2 mb-2">
                                                <Laptop size={18} /> Material de Trabalho
                                            </h3>
                                            {/* Notebooks */}
                                            <div className="mb-6">
                                                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                                                    <Laptop size={16} className="text-gray-400" /> Notebooks
                                                </h4>
                                                <div className="space-y-3">
                                                    {notebooks.map((item, idx) => (
                                                        <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex gap-3 items-start">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                                                                <input
                                                                    type="text"
                                                                    value={item.model}
                                                                    onChange={(e) => {
                                                                        const newItems = [...notebooks];
                                                                        newItems[idx].model = e.target.value;
                                                                        setNotebooks(newItems);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    placeholder="Ex: Dell Latitude 5420"
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd</label>
                                                                <input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const newItems = [...notebooks];
                                                                        newItems[idx].quantity = Number(e.target.value);
                                                                        setNotebooks(newItems);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    min="0"
                                                                />
                                                            </div>
                                                            <div className="w-32">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo</label>
                                                                <input
                                                                    type="number"
                                                                    value={item.unitCost}
                                                                    onChange={(e) => {
                                                                        const newItems = [...notebooks];
                                                                        newItems[idx].unitCost = Number(e.target.value);
                                                                        setNotebooks(newItems);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    step="0.01"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => setNotebooks(notebooks.filter((_, i) => i !== idx))}
                                                                className="text-red-400 hover:text-red-600 self-end pb-2"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setNotebooks([...notebooks, { id: `notebook-${Date.now()}`, model: '', quantity: 1, unitCost: 300 }])}
                                                        className="flex items-center gap-2 text-sm font-bold text-metarh-medium hover:underline"
                                                    >
                                                        <Plus size={16} /> Adicionar Notebook
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Celulares */}
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                                                    <Smartphone size={16} className="text-gray-400" /> Celulares
                                                </h4>
                                                <div className="space-y-3">
                                                    {cellPhones.map((item, idx) => (
                                                        <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex gap-3 items-start">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                                                                <input
                                                                    type="text"
                                                                    value={item.model}
                                                                    onChange={(e) => {
                                                                        const newItems = [...cellPhones];
                                                                        newItems[idx].model = e.target.value;
                                                                        setCellPhones(newItems);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    placeholder="Ex: Samsung Galaxy A54"
                                                                />
                                                            </div>
                                                            <div className="w-24">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd</label>
                                                                <input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const newItems = [...cellPhones];
                                                                        newItems[idx].quantity = Number(e.target.value);
                                                                        setCellPhones(newItems);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    min="0"
                                                                />
                                                            </div>
                                                            <div className="w-32">
                                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo/Mês</label>
                                                                <input
                                                                    type="number"
                                                                    value={item.monthlyCost}
                                                                    onChange={(e) => {
                                                                        const newItems = [...cellPhones];
                                                                        newItems[idx].monthlyCost = Number(e.target.value);
                                                                        setCellPhones(newItems);
                                                                    }}
                                                                    className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                    step="0.01"
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => setCellPhones(cellPhones.filter((_, i) => i !== idx))}
                                                                className="text-red-400 hover:text-red-600 self-end pb-2"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setCellPhones([...cellPhones, { id: `phone-${Date.now()}`, model: '', quantity: 1, monthlyCost: 172.39 }])}
                                                        className="flex items-center gap-2 text-sm font-bold text-metarh-medium hover:underline"
                                                    >
                                                        <Plus size={16} /> Adicionar Celular
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                        {/* Veículos */}
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                                                <Car size={16} className="text-gray-400" /> Veículos
                                            </h3>
                                            <div className="space-y-3">
                                                {vehicles.map((item, idx) => (
                                                    <div key={item.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex gap-3 items-start">
                                                        <div className="flex-1">
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Veículo</label>
                                                            <input
                                                                type="text"
                                                                value={item.type}
                                                                onChange={(e) => {
                                                                    const newItems = [...vehicles];
                                                                    newItems[idx].type = e.target.value;
                                                                    setVehicles(newItems);
                                                                }}
                                                                className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                placeholder="Ex: Sedan, SUV, Utilitário"
                                                            />
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd</label>
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const newItems = [...vehicles];
                                                                    newItems[idx].quantity = Number(e.target.value);
                                                                    setVehicles(newItems);
                                                                }}
                                                                className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                min="0"
                                                            />
                                                        </div>
                                                        <div className="w-40">
                                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custo Mensal Total</label>
                                                            <input
                                                                type="number"
                                                                value={item.monthlyCost}
                                                                onChange={(e) => {
                                                                    const newItems = [...vehicles];
                                                                    newItems[idx].monthlyCost = Number(e.target.value);
                                                                    setVehicles(newItems);
                                                                }}
                                                                className="w-full p-2 rounded-2xl border border-gray-300 text-sm"
                                                                step="0.01"
                                                                placeholder="Aluguel + Combustível"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => setVehicles(vehicles.filter((_, i) => i !== idx))}
                                                            className="text-red-400 hover:text-red-600 self-end pb-2"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => setVehicles([...vehicles, { id: `vehicle-${Date.now()}`, type: '', quantity: 1, monthlyCost: 3837.90 }])}
                                                    className="flex items-center gap-2 text-sm font-bold text-metarh-medium hover:underline"
                                                >
                                                    <Plus size={16} /> Adicionar Veículo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {result && (
                                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-100 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-metarh-dark uppercase">💻 Total Material de Trabalho:</span>
                                                    <span className="text-3xl font-bold text-metarh-dark">{fmtCurrency((result.notebooksCostTotal || 0) + (result.cellPhonesCostTotal || 0) + (result.vehiclesCostTotal || 0))}</span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                                    <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.materials ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.materials ? 'translate-x-3' : 'translate-x-0'}`} />
                                                    </div>
                                                    <span className={`text-xs font-bold ${confirmedSections.materials ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {confirmedSections.materials ? 'Revisado' : 'Confirmar'}
                                                    </span>
                                                    <input type="checkbox" checked={confirmedSections.materials} onChange={() => toggleSection('materials')} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>




                                {/* 8. TRIBUTOS */}
                                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all ${confirmedSections.taxes ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h2 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                                            <DollarSign size={18} /> 8. Tributos
                                        </h2>
                                    </div>

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
                                            <option value="Rio de Janeiro - RJ">Rio de Janeiro - RJ (5%)</option>
                                            <option value="Belo Horizonte - MG">Belo Horizonte - MG (5%)</option>
                                            <option value="Curitiba - PR">Curitiba - PR (5%)</option>
                                            <option value="Porto Alegre - RS">Porto Alegre - RS (5%)</option>
                                            <option value="Brasília - DF">Brasília - DF (5%)</option>
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
                                            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-100 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-metarh-dark uppercase">💰 Total Tributos:</span>
                                                        <span className="text-3xl font-bold text-metarh-dark">{fmtCurrency(result.totalTaxes)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Alíquota total: {fmtPercent(result.totalTaxRate)}</p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <label className="flex items-center gap-2 cursor-pointer select-none bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                                        <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.taxes ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.taxes ? 'translate-x-3' : 'translate-x-0'}`} />
                                                        </div>
                                                        <span className={`text-xs font-bold ${confirmedSections.taxes ? 'text-green-600' : 'text-gray-400'}`}>
                                                            {confirmedSections.taxes ? 'Revisado' : 'Confirmar'}
                                                        </span>
                                                        <input type="checkbox" checked={confirmedSections.taxes} onChange={() => toggleSection('taxes')} className="hidden" />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>


                            </div>

                            {/* RESULTS SECTION */}
                            <div className="space-y-6">
                                {/* 9. TAXAS E MARGENS - MOVED TO SIDERBAR */}
                                <div className={`bg-white p-6 rounded-[2rem] shadow-sm border transition-all ${confirmedSections.fees ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                        <h2 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                                            <BarChart3 size={18} /> 9. Taxas e Margens
                                        </h2>
                                    </div>
                                    <div className="space-y-4">
                                        {/* Input Admin Fee */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Taxa Administrativa (%)</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={adminFeePercent * 100}
                                                    onChange={(e) => setAdminFeePercent(Number(e.target.value) / 100)}
                                                    className="w-full p-3 rounded-2xl border border-gray-300 text-lg font-bold text-metarh-dark focus:ring-2 focus:ring-metarh-medium outline-none"
                                                />
                                                <span className="font-bold text-gray-500">%</span>
                                            </div>
                                        </div>
                                        {/* Calculation Mode */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modo de Cálculo</label>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => setCalculationMode('5_columns')}
                                                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-colors ${calculationMode === '5_columns' ? 'bg-metarh-medium text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    5 Colunas
                                                </button>
                                                <button
                                                    onClick={() => setCalculationMode('final_rate')}
                                                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-colors ${calculationMode === 'final_rate' ? 'bg-metarh-medium text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    Taxa Final
                                                </button>
                                            </div>
                                            <div className="mt-2 text-[10px] text-gray-400 leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                <p><strong className="text-gray-600">5 Colunas:</strong> Taxa aplicada sobre o <span className="font-semibold">Custo Total</span> (Labor + Ops).</p>
                                                <p className="mt-1"><strong className="text-gray-600">Taxa Final:</strong> Taxa aplicada sobre o <span className="font-semibold">Valor Bruto</span> (Markup). *Item não soma no Total NF.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <div className={`w-8 h-5 rounded-full p-1 transition-colors ${confirmedSections.fees ? 'bg-green-500' : 'bg-gray-200'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${confirmedSections.fees ? 'translate-x-3' : 'translate-x-0'}`} />
                                            </div>
                                            <span className={`text-xs font-bold ${confirmedSections.fees ? 'text-green-600' : 'text-gray-400'}`}>
                                                {confirmedSections.fees ? 'Revisado' : 'Confirmar'}
                                            </span>
                                            <input type="checkbox" checked={confirmedSections.fees} onChange={() => toggleSection('fees')} className="hidden" />
                                        </label>
                                        {result && (
                                            <div className="bg-metarh-medium/10 px-4 py-2 rounded-2xl border border-metarh-medium/20 text-right">
                                                <span className="text-xs font-bold text-gray-600 uppercase block">Valor da Taxa</span>
                                                <span className="text-lg font-bold text-metarh-dark">{fmtCurrency(result.adminFeeValue || 0)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>


                                <div className="bg-metarh-dark text-white p-8 rounded-[2.5rem] shadow-xl">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <BarChart3 size={24} className="text-metarh-lime" /> Resultado
                                    </h2>
                                    {result && (
                                        <div className="space-y-4 text-sm">
                                            {/* 1. Salários */}
                                            <div className="pb-4 border-b border-white/10">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>1. Salários Base</span>
                                                    <span>{fmtCurrency(result.totalBaseSalary)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-white mt-1">
                                                    <span>1.1 Salários Bruto</span>
                                                    <span>{fmtCurrency(result.totalGrossSalary)}</span>
                                                </div>
                                            </div>
                                            {/* 2. Encargos */}
                                            <div className="pb-4 border-b border-white/10">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">2. Encargos</p>
                                                <div className="flex justify-between text-gray-300 text-xs">
                                                    <span>2.1 Grupo A ({fmtPercent(result.groupAPercent)})</span>
                                                    <span>{fmtCurrency(result.groupAValue)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-300 text-xs">
                                                    <span>2.2 Grupo B ({fmtPercent(result.groupBPercent)})</span>
                                                    <span>{fmtCurrency(result.groupBValue)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-white mt-1">
                                                    <span>2.3 Total Encargos</span>
                                                    <span>{fmtCurrency(result.totalCharges)}</span>
                                                </div>
                                            </div>
                                            {/* 3. Benefícios */}
                                            <div className="pb-4 border-b border-white/10">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>3.1 Total Benefícios</span>
                                                    <span>{fmtCurrency(result.totalBenefits)}</span>
                                                </div>
                                                <div className="flex justify-between text-gray-300">
                                                    <span>3.2 Total Exames</span>
                                                    <span>{fmtCurrency(result.totalExams)}</span>
                                                </div>
                                            </div>
                                            {/* 4. Custos Operacionais */}
                                            <div className="pb-4 border-b border-white/10">
                                                <div className="flex justify-between text-gray-300">
                                                    <span>4. Total Custos Operacionais</span>
                                                    <span>{fmtCurrency(result.totalOperationalCostValue)}</span>
                                                </div>
                                            </div>
                                            {/* 5. Taxa Administrativa */}
                                            <div className="pb-4 border-b border-white/10">
                                                <div className="flex justify-between font-bold text-metarh-lime">
                                                    <span>5. Taxa Administrativa ({fmtPercent(adminFeePercent)})</span>
                                                    <span>{fmtCurrency(result.adminFeeValue)}</span>
                                                </div>
                                            </div>
                                            {/* 6. Impostos */}
                                            <div className="text-xs text-gray-400 space-y-1 pb-4 border-b border-white/10">
                                                <p className="font-bold uppercase text-gray-500">6. Impostos ({fmtPercent(result.totalTaxRate)})</p>
                                                <div className="flex justify-between">
                                                    <span>6.1 Total Tributos</span>
                                                    <span>{fmtCurrency(result.totalTaxes)}</span>
                                                </div>
                                            </div>
                                            {/* 7. Valor Bruto da NF */}
                                            <div className="bg-metarh-lime p-4 rounded-2xl text-metarh-dark shadow-lg mt-4">
                                                <p className="text-xs uppercase font-bold mb-1 opacity-80">7. Valor Bruto da NF</p>
                                                <p className="text-3xl font-bold">{fmtCurrency(result.totalBrutoNF)}</p>
                                                <p className="text-[10px] opacity-70 mt-1">
                                                    {calculationMode === 'final_rate'
                                                        ? 'Custo Base + Tributos (Taxa Final não inclusa na soma)'
                                                        : 'Custo Base + Taxas + Tributos'}
                                                </p>
                                            </div>
                                            {/* 8. Total Líquido e Lucro */}
                                            <div className="mt-4 space-y-3">
                                                <div className="bg-green-900/30 p-4 rounded-3xl border border-green-500/20">
                                                    <p className="text-xs text-green-200 uppercase font-bold mb-1">8.1 Total Líquido (Recebido)</p>
                                                    <p className="text-3xl font-bold text-white">{fmtCurrency(result.totalLiquido || 0)}</p>
                                                    <p className="text-[10px] text-green-300 mt-1">Valor Bruto da NF - Retenção IR (15,5%)</p>
                                                </div>
                                                <div className="bg-yellow-900/30 p-4 rounded-3xl border border-yellow-500/20">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-xs text-yellow-200 uppercase font-bold">8.2 Lucro L. Operacional</p>
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

                                                    <div className={`mt-6 p-4 rounded-2xl border-l-8 shadow-lg ${realProfit < 0
                                                        ? 'bg-red-500/20 border-red-500'
                                                        : profitMarginPercentage < 10
                                                            ? 'bg-orange-500/20 border-orange-500'
                                                            : profitMarginPercentage <= 35
                                                                ? 'bg-yellow-500/20 border-yellow-500'
                                                                : 'bg-green-500/20 border-green-500'
                                                        }`}>
                                                        <p className="text-sm font-bold mb-2 flex items-center gap-2 text-white">
                                                            {realProfit < 0 ? '🚨' :
                                                                profitMarginPercentage < 10 ? '😅' :
                                                                    profitMarginPercentage <= 35 ? '😉' : '🚀'}
                                                            <span className="uppercase tracking-wider">Dica do Especialista</span>
                                                        </p>
                                                        <p className="text-xs text-gray-200 leading-relaxed font-medium">
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
                                                onClick={() => setShowPdfModal(true)}
                                                disabled={!result || !allSectionsConfirmed}
                                                title={!result ? 'Gere os resultados antes de exportar' : !allSectionsConfirmed ? 'Confirme todas as seções (1-8) acima' : 'Gerar PDF'}
                                                className={`w-full py-3 font-bold rounded-full transition-all flex items-center justify-center gap-2 mt-4 
                                                ${allSectionsConfirmed ? 'bg-white text-metarh-dark hover:bg-gray-100' : 'bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600'}
                                            `}
                                            >
                                                <FileText size={18} />
                                                {allSectionsConfirmed ? 'Gerar PDF' : 'Revise todas as seções'}
                                            </button>

                                            {!allSectionsConfirmed && (
                                                <p className="text-[10px] text-center text-red-300 mt-2">
                                                    * É necessário marcar todas as seções como "Revisado" para gerar a proposta.
                                                </p>
                                            )}

                                            {/* PDF Modal */}
                                            {showPdfModal && (
                                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                                                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                            <FileText className="text-metarh-medium" /> Gerar PDF
                                                        </h3>
                                                        <p className="text-gray-600 mb-6">Escolha o tipo de documento que deseja gerar:</p>

                                                        <div className="space-y-3">
                                                            <button
                                                                onClick={() => {
                                                                    if (!result) {
                                                                        alert('Cálculo não finalizado — gere resultados antes de exportar o PDF.');
                                                                        return;
                                                                    }
                                                                    try {
                                                                        const ok = generatePDF('internal', result, clientName || 'Cliente', clientCnpj);
                                                                        if (!ok) {
                                                                            alert('Não foi possível gerar o PDF automaticamente. Verifique se o navegador bloqueou popups e permita popups para este site.');
                                                                        }
                                                                    } catch (err: any) {
                                                                        console.error('Erro gerando PDF interno:', err);
                                                                        alert('Erro ao gerar PDF. Verifique console para detalhes.');
                                                                    }
                                                                    setShowPdfModal(false);
                                                                }}
                                                                className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-between group transition-all"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                                                        <Settings size={20} className="text-gray-600" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className="font-bold text-gray-800">Ordem de Serviço</div>
                                                                        <div className="text-xs text-gray-500">Para uso interno (detalhado)</div>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown className="-rotate-90 text-gray-400" />
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    if (!result) {
                                                                        alert('Cálculo não finalizado — gere resultados antes de exportar o PDF.');
                                                                        return;
                                                                    }
                                                                    try {
                                                                        const ok = generatePDF('client', result, clientName || 'Cliente', clientCnpj);
                                                                        if (!ok) {
                                                                            alert('Não foi possível gerar o PDF automaticamente. Verifique se o navegador bloqueou popups e permita popups para este site.');
                                                                        }
                                                                    } catch (err: any) {
                                                                        console.error('Erro gerando PDF cliente:', err);
                                                                        alert('Erro ao gerar PDF. Verifique console para detalhes.');
                                                                    }
                                                                    setShowPdfModal(false);
                                                                }}

                                                                className="w-full p-4 bg-metarh-medium/5 hover:bg-metarh-medium/10 rounded-2xl border border-metarh-medium/20 flex items-center justify-between group transition-all"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-white p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                                                        <Briefcase size={20} className="text-metarh-medium" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <div className="font-bold text-metarh-dark">Proposta Comercial</div>
                                                                        <div className="text-xs text-metarh-medium">Para envio ao cliente</div>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown className="-rotate-90 text-metarh-medium" />
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => setShowPdfModal(false)}
                                                            className="w-full mt-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LaborCalculator;
