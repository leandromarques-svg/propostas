import { supabase } from '../../lib/supabase';
import { BENEFIT_OPTIONS, MINIMUM_WAGE, LABOR_CHARGES, LABOR_TAX_RATES, EXAM_OPTIONS, TAX_RATES } from '../../constants';

export interface AppSettings {
    minimum_wage: number;
    sat_rate: number;
    benefit_options: {
        medical: { id: string; name: string; value: number }[];
        dental: { id: string; name: string; value: number }[];
        wellhub: { id: string; name: string; value: number }[];
        others?: {
            transport?: number;
            meal?: number;
            food?: number;
            lifeInsurance?: number;
            pharmacy?: number;
            gpsPoint?: number;
            plr?: number;
            healthCare?: number;
            operationalTeam?: number;
            adminOperations?: number;
        };
        custom?: { id: string; name: string; value: number; category: string }[];
    };
    labor_charges_config: typeof LABOR_CHARGES;
    labor_tax_rates_config: typeof LABOR_TAX_RATES;
    general_tax_rates: typeof TAX_RATES;
    exam_options_list: typeof EXAM_OPTIONS;
}

const DEFAULT_SETTINGS: AppSettings = {
    minimum_wage: MINIMUM_WAGE,
    sat_rate: LABOR_CHARGES.groupA.sat,
    benefit_options: {
        medical: BENEFIT_OPTIONS.medical,
        dental: BENEFIT_OPTIONS.dental,
        wellhub: BENEFIT_OPTIONS.wellhub,
        others: {
            transport: BENEFIT_OPTIONS.others.transport.defaultValue,
            meal: BENEFIT_OPTIONS.others.meal.defaultValue,
            food: BENEFIT_OPTIONS.others.food.defaultValue,
            lifeInsurance: BENEFIT_OPTIONS.others.lifeInsurance.defaultValue,
            pharmacy: BENEFIT_OPTIONS.others.pharmacy.defaultValue,
            gpsPoint: BENEFIT_OPTIONS.others.gpsPoint.defaultValue,
            plr: BENEFIT_OPTIONS.others.plr.defaultValue,
            healthCare: BENEFIT_OPTIONS.others.healthCare.defaultValue,
            operationalTeam: BENEFIT_OPTIONS.others.operationalTeam.defaultValue,
            adminOperations: BENEFIT_OPTIONS.others.adminOperations.defaultValue
        }
    },
    labor_charges_config: LABOR_CHARGES,
    labor_tax_rates_config: LABOR_TAX_RATES,
    general_tax_rates: TAX_RATES,
    exam_options_list: EXAM_OPTIONS
};

export const getAppSettings = async (): Promise<AppSettings> => {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('*');

        if (error) throw error;

        const settings: any = { ...DEFAULT_SETTINGS };

        if (data) {
            data.forEach((item: any) => {
                if (item.key === 'minimum_wage') settings.minimum_wage = Number(item.value);
                if (item.key === 'sat_rate') settings.sat_rate = Number(item.value);

                // Handle complex objects
                if (item.key === 'labor_charges_config') settings.labor_charges_config = item.value;
                if (item.key === 'labor_tax_rates_config') settings.labor_tax_rates_config = item.value;
                if (item.key === 'general_tax_rates') settings.general_tax_rates = item.value;
                if (item.key === 'exam_options_list') settings.exam_options_list = item.value;

                // Handle Benefits - merging lists
                if (item.key === 'benefit_options') {
                    // Legacy structure support
                    settings.benefit_options = { ...settings.benefit_options, ...item.value };
                }
                if (item.key === 'benefit_options_medical') settings.benefit_options.medical = item.value;
                if (item.key === 'benefit_options_dental') settings.benefit_options.dental = item.value;
                if (item.key === 'benefit_options_wellhub') settings.benefit_options.wellhub = item.value;
            });
        }

        return settings;
    } catch (error) {
        console.error('Error fetching app settings:', error);
        return DEFAULT_SETTINGS;
    }
};

export const updateAppSetting = async (key: string, value: any) => {
    try {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key, value });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error(`Error updating setting ${key}:`, error);
        throw error;
    }
};
