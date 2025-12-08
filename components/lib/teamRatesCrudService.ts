import { supabase } from '../../lib/supabase';

export interface TeamRateItem {
  id: string;
  rate_type: string;
  hourly_rate: number;
}

export async function getTeamRateItems(): Promise<TeamRateItem[]> {
  const { data, error } = await supabase
    .from('team_rates')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function addTeamRateItem(item: Omit<TeamRateItem, 'id'>): Promise<TeamRateItem> {
  const { data, error } = await supabase
    .from('team_rates')
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeamRateItem(item: TeamRateItem): Promise<boolean> {
  const { error } = await supabase
    .from('team_rates')
    .update(item)
    .eq('id', item.id);
  if (error) throw error;
  return true;
}

export async function deleteTeamRateItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_rates')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}
