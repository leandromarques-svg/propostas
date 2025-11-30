import { supabase } from '../../lib/supabase';

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

export async function getTeamRates(): Promise<TeamRates> {
    const { data, error } = await supabase
        .from('team_rates')
        .select('*');

    if (error) {
        console.error('Error fetching team rates:', error);
        // Return default values if error
        return {
            senior: 150,
            plena: 100,
            junior: 60
        };
    }

    // Convert array to object
    const rates: TeamRates = {
        senior: 150,
        plena: 100,
        junior: 60
    };

    data.forEach((rate: any) => {
        if (rate.rate_type === 'senior') rates.senior = parseFloat(rate.hourly_rate);
        if (rate.rate_type === 'plena') rates.plena = parseFloat(rate.hourly_rate);
        if (rate.rate_type === 'junior') rates.junior = parseFloat(rate.hourly_rate);
    });

    return rates;
}

export async function updateTeamRate(rateType: 'senior' | 'plena' | 'junior', hourlyRate: number): Promise<boolean> {
    const { error } = await supabase
        .from('team_rates')
        .upsert({
            rate_type: rateType,
            hourly_rate: hourlyRate,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'rate_type'
        });

    if (error) {
        console.error(`Error updating ${rateType} rate:`, error);
        throw error;
    }

    return true;
}

export async function updateAllTeamRates(rates: TeamRates): Promise<boolean> {
    try {
        await updateTeamRate('senior', rates.senior);
        await updateTeamRate('plena', rates.plena);
        await updateTeamRate('junior', rates.junior);
        return true;
    } catch (error) {
        console.error('Error updating team rates:', error);
        throw error;
    }
}
