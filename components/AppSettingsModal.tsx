import { getBenefitPlans, addBenefitPlan, updateBenefitPlan, deleteBenefitPlan, BenefitPlan } from './lib/benefitsService';
    const [benefitPlans, setBenefitPlans] = useState<BenefitPlan[]>([]);
    const [newBenefitPlan, setNewBenefitPlan] = useState<{ name: string; value: number; category: string }>({ name: '', value: 0, category: 'medical' });
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Save, Loader2, Settings, Users, Briefcase, Heart } from 'lucide-react';
import { getTeamRates, updateAllTeamRates, TeamRates } from './lib/teamRatesService';
import { getTeamRateItems, addTeamRateItem, updateTeamRateItem, deleteTeamRateItem, TeamRateItem } from './lib/teamRatesCrudService';
import { getAppSettings, updateAppSetting, AppSettings } from './lib/settingsService';
import { getGeneralSettings, addGeneralSetting, updateGeneralSetting, deleteGeneralSetting, GeneralSetting } from './lib/generalSettingsService';
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
    const [teamRateItems, setTeamRateItems] = useState<TeamRateItem[]>([]);
    const [newTeamRate, setNewTeamRate] = useState<{ rate_type: string; hourly_rate: number }>({ rate_type: '', hourly_rate: 0 });

    // General Settings State
    const [generalSettings, setGeneralSettings] = useState<AppSettings>({
        minimum_wage: 0,
        sat_rate: 0,
        benefit_options: { medical: [], dental: [], wellhub: [], custom: [] }
    });
    const [generalSettingsList, setGeneralSettingsList] = useState<GeneralSetting[]>([]);
    const [newGeneralSetting, setNewGeneralSetting] = useState<{ key: string; value: number }>({ key: '', value: 0 });
    const [newCustomItem, setNewCustomItem] = useState({ name: '', value: 0, category: 'Outros' });

    useEffect(() => {
        if (isOpen) {
            loadAllSettings();
        }
    }, [isOpen]);

    const loadAllSettings = async () => {
        setIsLoading(true);
        try {
            const [rates, settings, rateItems, generalList, benefitList] = await Promise.all([
                getTeamRates(),
                getAppSettings(),
                getTeamRateItems(),
                getGeneralSettings(),
                getBenefitPlans('all')
            ]);
            setTeamRates(rates);
            setGeneralSettings(settings);
            setTeamRateItems(rateItems);
            setGeneralSettingsList(generalList);
            setBenefitPlans(benefitList);
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
                            {activeTab === 'benefits' && (
                                <div className="space-y-8 animate-fade-in">
                                    {/* Novo CRUD de benefícios já implementado */}
                                </div>
                            )}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Vale Transporte (Diário)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.benefit_options.others?.transport || 17.80}
                                                        onChange={(e) => setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                others: { ...generalSettings.benefit_options.others, transport: Number(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full pl-10 p-2 border border-gray-300 rounded font-bold text-right"
                                                    />
                                                </div>
                                            </div>

                                            {/* Vale Refeição */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Vale Refeição (Diário)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.benefit_options.others?.meal || 23.30}
                                                        onChange={(e) => setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                others: { ...generalSettings.benefit_options.others, meal: Number(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full pl-10 p-2 border border-gray-300 rounded font-bold text-right"
                                                    />
                                                </div>
                                            </div>

                                            {/* Vale Alimentação */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Vale Alimentação (Mensal)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.benefit_options.others?.food || 163.83}
                                                        onChange={(e) => setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                others: { ...generalSettings.benefit_options.others, food: Number(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full pl-10 p-2 border border-gray-300 rounded font-bold text-right"
                                                    />
                                                </div>
                                            </div>

                                            {/* Seguro de Vida */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Seguro de Vida</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.benefit_options.others?.lifeInsurance || 16.01}
                                                        onChange={(e) => setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                others: { ...generalSettings.benefit_options.others, lifeInsurance: Number(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full pl-10 p-2 border border-gray-300 rounded font-bold text-right"
                                                    />
                                                </div>
                                            </div>

                                            {/* Auxílio Farmácia */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Auxílio Farmácia | Omni</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.benefit_options.others?.pharmacy || 46.96}
                                                        onChange={(e) => setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                others: { ...generalSettings.benefit_options.others, pharmacy: Number(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full pl-10 p-2 border border-gray-300 rounded font-bold text-right"
                                                    />
                                                </div>
                                            </div>

                                            {/* Controle de Ponto */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Controle de Ponto GPS</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.benefit_options.others?.gpsPoint || 7.63}
                                                        onChange={(e) => setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                others: { ...generalSettings.benefit_options.others, gpsPoint: Number(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full pl-10 p-2 border border-gray-300 rounded font-bold text-right"
                                                    />
                                                </div>
                                            </div>

                                            {/* PLR */}
                                            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">PLR (Provisão Mensal)</label>
                                                <div className="relative max-w-sm">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.benefit_options.others?.plr || 330.88}
                                                        onChange={(e) => setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                others: { ...generalSettings.benefit_options.others, plr: Number(e.target.value) }
                                                            }
                                                        })}
                                                        className="w-full pl-10 p-2 border border-gray-300 rounded font-bold text-right"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Benefits */}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Itens Personalizados</h3>
                                        <div className="grid gap-4">
                                            {generalSettings.benefit_options.custom?.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg">
                                                    <div className="w-32">
                                                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Categoria</span>
                                                        <span className="text-xs font-bold text-metarh-medium bg-white px-2 py-1 rounded border border-gray-200 block truncate">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Nome</span>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => {
                                                                const newCustom = [...(generalSettings.benefit_options.custom || [])];
                                                                newCustom[idx].name = e.target.value;
                                                                setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, custom: newCustom } });
                                                            }}
                                                            className="w-full p-2 border border-gray-300 rounded text-sm font-medium"
                                                        />
                                                    </div>
                                                    <div className="relative w-32">
                                                        <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Valor Padrão</span>
                                                        <span className="absolute left-2 bottom-2 text-gray-500 text-xs">R$</span>
                                                        <input
                                                            type="number"
                                                            value={item.value}
                                                            onChange={(e) => {
                                                                const newCustom = [...(generalSettings.benefit_options.custom || [])];
                                                                newCustom[idx].value = Number(e.target.value);
                                                                setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, custom: newCustom } });
                                                            }}
                                                            className="w-full pl-6 p-2 border border-gray-300 rounded text-sm font-bold text-right"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newCustom = [...(generalSettings.benefit_options.custom || [])].filter((_, i) => i !== idx);
                                                            setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, custom: newCustom } });
                                                        }}
                                                        className="mt-5 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Add New Custom Item */}
                                            <div className="flex gap-4 items-end bg-metarh-medium/5 p-4 rounded-xl border border-metarh-medium/20 border-dashed">
                                                <div className="w-1/4">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categoria</label>
                                                    <select
                                                        value={newCustomItem.category}
                                                        onChange={(e) => setNewCustomItem({ ...newCustomItem, category: e.target.value })}
                                                        className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                    >
                                                        <option value="Alimentação e Transporte">Alimentação e Transporte</option>
                                                        <option value="Saúde e Bem estar">Saúde e Bem estar</option>
                                                        <option value="Exames">Exames</option>
                                                        <option value="Outros">Outros</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome do Item</label>
                                                    <input
                                                        type="text"
                                                        value={newCustomItem.name}
                                                        onChange={(e) => setNewCustomItem({ ...newCustomItem, name: e.target.value })}
                                                        className="w-full p-2 rounded-lg border border-gray-300 text-sm"
                                                        placeholder="Ex: Auxílio Creche"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Valor (R$)</label>
                                                    <input
                                                        type="number"
                                                        value={newCustomItem.value}
                                                        onChange={(e) => setNewCustomItem({ ...newCustomItem, value: Number(e.target.value) })}
                                                        className="w-full p-2 rounded-lg border border-gray-300 text-sm font-bold text-right"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!newCustomItem.name) return;
                                                        // Use consistent prefix based on category
                                                        let prefix = 'other_custom_';
                                                        if (newCustomItem.category === 'Alimentação e Transporte') prefix = 'transport_custom_';
                                                        if (newCustomItem.category === 'Saúde e Bem estar') prefix = 'health_custom_';
                                                        if (newCustomItem.category === 'Exames') prefix = 'exam_custom_';

                                                        const newItem = {
                                                            id: `${prefix}cfg_${Date.now()}`,
                                                            ...newCustomItem
                                                        };
                                                        setGeneralSettings({
                                                            ...generalSettings,
                                                            benefit_options: {
                                                                ...generalSettings.benefit_options,
                                                                custom: [...(generalSettings.benefit_options.custom || []), newItem]
                                                            }
                                                        });
                                                        setNewCustomItem({ name: '', value: 0, category: 'Outros' });
                                                    }}
                                                    className="px-4 py-2 bg-metarh-medium text-white rounded-lg font-bold text-sm hover:bg-metarh-dark transition-colors h-[38px]"
                                                >
                                                    Adicionar
                                                </button>
                                            </div>
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
