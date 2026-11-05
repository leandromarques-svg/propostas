import { BENEFIT_OPTIONS, MINIMUM_WAGE, LABOR_CHARGES } from '../../constants';

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
    };
  };
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
      plr: BENEFIT_OPTIONS.others.plr.defaultValue
    }
  }
};

const SETTINGS_KEY = 'metarh_app_settings';

export const getAppSettings = async (): Promise<AppSettings> => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error fetching app settings:', error);
  }
  return DEFAULT_SETTINGS;
};

export const updateAppSetting = async (key: string, value: any) => {
  try {
    const current = await getAppSettings();
    const updated = { ...current, [key]: value };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    throw error;
  }
};
