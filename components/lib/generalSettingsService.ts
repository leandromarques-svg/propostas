import { supabase } from '../../lib/supabase';

export interface GeneralSetting {
  id: string;
  key: string;
  value: number;
}

export async function getGeneralSettings(): Promise<GeneralSetting[]> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function addGeneralSetting(setting: Omit<GeneralSetting, 'id'>): Promise<GeneralSetting> {
  const { data, error } = await supabase
    .from('app_settings')
    .insert(setting)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGeneralSetting(setting: GeneralSetting): Promise<boolean> {
  const { error } = await supabase
    .from('app_settings')
    .update(setting)
    .eq('id', setting.id);
  if (error) throw error;
  return true;
}

export async function deleteGeneralSetting(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('app_settings')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}
