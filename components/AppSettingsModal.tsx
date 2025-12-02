import React, { useState, useEffect } from 'react';
import { X, DollarSign, Save, Loader2, Settings, Users, Briefcase, Heart } from 'lucide-react';
import { getTeamRates, updateAllTeamRates, TeamRates } from './lib/teamRatesService';
import { getAppSettings, updateAppSetting, AppSettings } from './lib/settingsService';
import { supabase } from '../lib/supabase';

interface AppSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'team' | 'general' | 'benefits';

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
        benefit_options: { medical: [], dental: [], wellhub: [] }
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
                await updateAppSetting('benefit_options', generalSettings.benefit_options);
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
                <div className="bg-metarh-dark text-white p-6 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="text-metarh-lime" /> Configurar Valores
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-4 gap-4 sticky top-[88px] z-10">
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'team' ? 'border-metarh-medium text-metarh-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users size={18} /> Equipe
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'general' ? 'border-metarh-medium text-metarh-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Briefcase size={18} /> Valores Gerais
                    </button>
                    <button
                        onClick={() => setActiveTab('benefits')}
                        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'benefits' ? 'border-metarh-medium text-metarh-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Heart size={18} /> Benefícios
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin text-metarh-medium" size={48} />
                        </div>
                    ) : (
                        <div className="space-y-6">

                            {/* TEAM TAB */}
                            {activeTab === 'team' && (
                                <div className="space-y-6 animate-fade-in">
                                    <p className="text-gray-600">Valores por hora para cálculo de equipe de recrutamento.</p>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sênior</label>
                                            <input
                                                type="number"
                                                value={teamRates.senior}
                                                onChange={(e) => setTeamRates({ ...teamRates, senior: Number(e.target.value) })}
                                                className="w-full p-2 rounded-lg border border-purple-200 font-bold"
                                            />
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pleno</label>
                                            <input
                                                type="number"
                                                value={teamRates.plena}
                                                onChange={(e) => setTeamRates({ ...teamRates, plena: Number(e.target.value) })}
                                                className="w-full p-2 rounded-lg border border-blue-200 font-bold"
                                            />
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Júnior</label>
                                            <input
                                                type="number"
                                                value={teamRates.junior}
                                                onChange={(e) => setTeamRates({ ...teamRates, junior: Number(e.target.value) })}
                                                className="w-full p-2 rounded-lg border border-green-200 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* GENERAL TAB */}
                            {activeTab === 'general' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Salário Mínimo Nacional</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                                <input
                                                    type="number"
                                                    value={generalSettings.minimum_wage}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, minimum_wage: Number(e.target.value) })}
                                                    className="w-full pl-10 p-3 rounded-lg border border-gray-300 font-bold text-lg"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Usado para cálculo de insalubridade.</p>
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Taxa SAT (Seguro Acidente Trabalho)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={(generalSettings.sat_rate * 100).toFixed(2)}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, sat_rate: Number(e.target.value) / 100 })}
                                                    className="w-full p-3 rounded-lg border border-gray-300 font-bold text-lg pr-10"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Taxa padrão aplicada aos encargos (Grupo A).</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BENEFITS TAB */}
                            {activeTab === 'benefits' && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Medical */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Planos Médicos</h3>
                                        <div className="grid gap-4">
                                            {generalSettings.benefit_options.medical.map((plan, idx) => (
                                                <div key={plan.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                                                    <input
                                                        type="text"
                                                        value={plan.name}
                                                        onChange={(e) => {
                                                            const newPlans = [...generalSettings.benefit_options.medical];
                                                            newPlans[idx].name = e.target.value;
                                                            setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, medical: newPlans } });
                                                        }}
                                                        className="flex-1 p-2 border border-gray-300 rounded text-sm font-medium"
                                                    />
                                                    <div className="relative w-32">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                                        <input
                                                            type="number"
                                                            value={plan.value}
                                                            onChange={(e) => {
                                                                const newPlans = [...generalSettings.benefit_options.medical];
                                                                newPlans[idx].value = Number(e.target.value);
                                                                setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, medical: newPlans } });
                                                            }}
                                                            className="w-full pl-6 p-2 border border-gray-300 rounded text-sm font-bold text-right"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Dental */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Planos Odontológicos</h3>
                                        <div className="grid gap-4">
                                            {generalSettings.benefit_options.dental.map((plan, idx) => (
                                                <div key={plan.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                                                    <input
                                                        type="text"
                                                        value={plan.name}
                                                        onChange={(e) => {
                                                            const newPlans = [...generalSettings.benefit_options.dental];
                                                            newPlans[idx].name = e.target.value;
                                                            setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, dental: newPlans } });
                                                        }}
                                                        className="flex-1 p-2 border border-gray-300 rounded text-sm font-medium"
                                                    />
                                                    <div className="relative w-32">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                                        <input
                                                            type="number"
                                                            value={plan.value}
                                                            onChange={(e) => {
                                                                const newPlans = [...generalSettings.benefit_options.dental];
                                                                newPlans[idx].value = Number(e.target.value);
                                                                setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, dental: newPlans } });
                                                            }}
                                                            className="w-full pl-6 p-2 border border-gray-300 rounded text-sm font-bold text-right"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Wellhub */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Wellhub (Gympass)</h3>
                                        <div className="grid gap-4">
                                            {generalSettings.benefit_options.wellhub.map((plan, idx) => (
                                                <div key={plan.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                                                    <input
                                                        type="text"
                                                        value={plan.name}
                                                        onChange={(e) => {
                                                            const newPlans = [...generalSettings.benefit_options.wellhub];
                                                            newPlans[idx].name = e.target.value;
                                                            setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, wellhub: newPlans } });
                                                        }}
                                                        className="flex-1 p-2 border border-gray-300 rounded text-sm font-medium"
                                                    />
                                                    <div className="relative w-32">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                                        <input
                                                            type="number"
                                                            value={plan.value}
                                                            onChange={(e) => {
                                                                const newPlans = [...generalSettings.benefit_options.wellhub];
                                                                newPlans[idx].value = Number(e.target.value);
                                                                setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, wellhub: newPlans } });
                                                            }}
                                                            className="w-full pl-6 p-2 border border-gray-300 rounded text-sm font-bold text-right"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

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
                    )}
                </div>
            </div>
        </div>
    );
};
