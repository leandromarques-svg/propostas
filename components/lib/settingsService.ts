import { supabase } from '../../lib/supabase';
import { BENEFIT_OPTIONS, MINIMUM_WAGE, LABOR_CHARGES } from '../../constants';

export interface AppSettings {
    minimum_wage: number;
    sat_rate: number;
    benefit_options: {
        medical: { id: string; name: string; value: number }[];
        dental: { id: string; name: string; value: number }[];
        wellhub: { id: string; name: string; value: number }[];
    };
}

const DEFAULT_SETTINGS: AppSettings = {
    minimum_wage: MINIMUM_WAGE,
    sat_rate: LABOR_CHARGES.groupA.sat,
    benefit_options: {
        medical: BENEFIT_OPTIONS.medical,
        dental: BENEFIT_OPTIONS.dental,
        wellhub: BENEFIT_OPTIONS.wellhub
    }
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
                if (item.key === 'benefit_options') settings.benefit_options = item.value;
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
