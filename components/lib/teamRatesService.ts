export interface TeamRate {
  id: string;
  rate_type: 'senior' | 'plena' | 'junior';
  hourly_rate: number;
  updated_at: string;
  updated_by?: string;
}

export interface TeamRates {
  senior: number;
  plena: number;
  junior: number;
}

const DEFAULT_RATES: TeamRates = {
  senior: 150,
  plena: 100,
  junior: 60
};

const TEAM_RATES_KEY = 'metarh_team_rates';

export async function getTeamRates(): Promise<TeamRates> {
  try {
    const stored = localStorage.getItem(TEAM_RATES_KEY);
    if (stored) {
      return { ...DEFAULT_RATES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Error reading team rates from localStorage:', e);
  }
  return DEFAULT_RATES;
}

export async function updateTeamRate(rateType: 'senior' | 'plena' | 'junior', hourlyRate: number): Promise<boolean> {
  try {
    const current = await getTeamRates();
    const updated = { ...current, [rateType]: hourlyRate };
    localStorage.setItem(TEAM_RATES_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error(`Error saving ${rateType} rate:`, error);
    return false;
  }
}

export async function updateAllTeamRates(rates: TeamRates): Promise<boolean> {
  try {
    localStorage.setItem(TEAM_RATES_KEY, JSON.stringify(rates));
    return true;
  } catch (error) {
    console.error('Error saving team rates:', error);
    return false;
  }
}
