import { supabase } from '../../lib/supabase';

export interface BenefitPlan {
  id: string;
  name: string;
  value: number;
  category: string;
}

export async function getBenefitPlans(category: string): Promise<BenefitPlan[]> {
  const { data, error } = await supabase
    .from('benefit_plans')
    .select('*')
    .eq('category', category);
  if (error) throw error;
  return data || [];
}

export async function addBenefitPlan(plan: Omit<BenefitPlan, 'id'>): Promise<BenefitPlan> {
  const { data, error } = await supabase
    .from('benefit_plans')
    .insert(plan)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBenefitPlan(plan: BenefitPlan): Promise<boolean> {
  const { error } = await supabase
    .from('benefit_plans')
    .update(plan)
    .eq('id', plan.id);
  if (error) throw error;
  return true;
}

export async function deleteBenefitPlan(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('benefit_plans')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}
