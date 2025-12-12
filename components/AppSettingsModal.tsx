import React, { useState, useEffect } from 'react';
import { X, DollarSign, Save, Loader2, Settings, Users, Briefcase, Heart } from 'lucide-react';
import { getTeamRates, updateAllTeamRates, TeamRates } from './lib/teamRatesService';
import { getAppSettings, updateAppSetting, AppSettings } from './lib/settingsService';
import { supabase } from '../lib/supabase';

interface AppSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'team' | 'general';

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('team');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Team Rates State
    const [teamRates, setTeamRates] = useState<TeamRates>({ senior: 0, plena: 0, junior: 0 });

    // General Settings State
    const [generalSettings, setGeneralSettings] = useState<AppSettings>({
        minimum_wage: 0,
        sat_rate: 0,
        benefit_options: { medical: [], dental: [], wellhub: [], custom: [] }
    });

    useEffect(() => {
        if (isOpen) {
            loadAllSettings();
        }
    }, [isOpen]);

    const loadAllSettings = async () => {
        setIsLoading(true);
        try {
            const [rates, settings] = await Promise.all([
                getTeamRates(),
                getAppSettings()
            ]);
            setTeamRates(rates);
            setGeneralSettings(settings);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (activeTab === 'team') {
                await updateAllTeamRates(teamRates);
            } else {
                // Save general settings
                await updateAppSetting('minimum_wage', generalSettings.minimum_wage);
                await updateAppSetting('sat_rate', generalSettings.sat_rate);
                // Ensure custom defaults to empty array if undefined
                const optionsToSave = {
                    ...generalSettings.benefit_options,
                    custom: generalSettings.benefit_options.custom || []
                };
                await updateAppSetting('benefit_options', optionsToSave);
            }
            alert('Configurações salvas com sucesso!');
            onClose();
        } catch (error: any) {
            alert(`Erro ao salvar: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-metarh-dark/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl custom-scrollbar flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-metarh-dark">Configurações do Sistema</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin text-metarh-medium" size={48} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-gray-600">Configurações disponíveis em breve.</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white p-4 -mx-8 -mb-8 rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-gray-300 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 rounded-xl bg-metarh-medium hover:bg-metarh-dark text-white font-bold shadow-lg transition-all flex items-center gap-2"
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};
