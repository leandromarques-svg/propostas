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
    try {
        // First, check if the record exists
        const { data: existing, error: selectError } = await supabase
            .from('team_rates')
            .select('id, rate_type, hourly_rate')
            .eq('rate_type', rateType)
            .maybeSingle();

        if (selectError) {
            console.error(`Error checking existing ${rateType} rate:`, selectError);
            throw new Error(`Erro ao verificar taxa existente: ${selectError.message}`);
        }

        let result;

        if (existing) {
            // Update existing record - DON'T use .select() to avoid RLS issues
            console.log(`Updating existing ${rateType} rate from ${existing.hourly_rate} to ${hourlyRate}`);
            result = await supabase
                .from('team_rates')
                .update({
                    hourly_rate: hourlyRate,
                    updated_at: new Date().toISOString()
                })
                .eq('rate_type', rateType);
        } else {
            // Insert new record - DON'T use .select() to avoid RLS issues
            console.log(`Inserting new ${rateType} rate: ${hourlyRate}`);
            result = await supabase
                .from('team_rates')
                .insert({
                    rate_type: rateType,
                    hourly_rate: hourlyRate,
                    updated_at: new Date().toISOString()
                });
        }

        if (result.error) {
            console.error(`Error saving ${rateType} rate:`, result.error);

            // Check if it's a permission error
            if (result.error.code === 'PGRST301' || result.error.message.includes('policy')) {
                throw new Error(`Erro de permissão: Você precisa ser admin para alterar os valores. Verifique se seu usuário tem is_admin=true no Supabase.`);
            }

            throw new Error(`Erro ao salvar: ${result.error.message}`);
        }

        // Success - the operation completed without error
        console.log(`✅ Successfully saved ${rateType} rate: ${hourlyRate}`);
        return true;

    } catch (error: any) {
        console.error(`❌ Error in updateTeamRate for ${rateType}:`, error);
        throw error;
    }
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
