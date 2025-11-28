import { supabase } from './supabase';

export interface ProposalData {
    id?: string;
    created_at?: string;
    updated_at?: string;

    // Basic Info
    role_name: string;
    vacancies: number;
    salary: number;

    // Coefficients
    weight_complexity: number;
    // weight_job_level: number; // Removed
    // weight_location: number; // Removed
    // weight_work_model: number; // Removed
    // weight_urgency: number; // Removed
    // weight_profile_difficulty: number; // Removed

    // Team
    demanded_days: number;
    qty_senior: number;
    qty_plena: number;
    qty_junior: number;

    // Fixed Items
    fixed_items: any[];

    // Margins
    profit_margin_pct: number;
    admin_fee_pct: number;

    // Results
    results?: any;

    // User tracking
    user_id?: string;
}

/**
 * Save a new proposal or update an existing one
 */
export async function saveProposal(data: ProposalData) {
    try {
        const { data: proposal, error } = await supabase
            .from('proposals')
            .upsert({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data: proposal };
    } catch (error) {
        console.error('Error saving proposal:', error);
        return { success: false, error };
    }
}

/**
 * Get all proposals for the current user
 */
export async function getProposals() {
    try {
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching proposals:', error);
        return { success: false, error };
    }
}

/**
 * Get a single proposal by ID
 */
export async function getProposal(id: string) {
    try {
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching proposal:', error);
        return { success: false, error };
    }
}

/**
 * Delete a proposal by ID
 */
export async function deleteProposal(id: string) {
    try {
        const { error } = await supabase
            .from('proposals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting proposal:', error);
        return { success: false, error };
    }
}
