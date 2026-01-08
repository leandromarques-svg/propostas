/**
 * Modal for application settings (Team Rates, Benefits, Strings)
 */
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

    // CRUD State for custom values
    const [customEdit, setCustomEdit] = useState<{ id?: string; name: string; value: number; category: string }>({ name: '', value: 0, category: '' });
    const [isEditingCustom, setIsEditingCustom] = useState(false);

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
            <div className="bg-white w-[95%] max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-metarh-dark">Configurações do Sistema</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-8 flex-shrink-0 bg-gray-50/50">
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`py-4 mr-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'team' ? 'border-metarh-medium text-metarh-medium' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Equipe de Recrutamento
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'general' ? 'border-metarh-medium text-metarh-medium' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Parâmetros Gerais
                    </button>
                </div>

                {/* Content - Scrollable Area */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin text-metarh-medium" size={48} />
                        </div>
                    ) : (
                        <div className="space-y-8 animate-fade-in">
                            {activeTab === 'team' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                        <h3 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2">
                                            <Users size={20} className="text-metarh-medium" />
                                            Custos da Equipe (Hora Técnica)
                                        </h3>
                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Senior (R$/h)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                                    <input
                                                        type="number"
                                                        value={teamRates.senior}
                                                        onChange={(e) => setTeamRates({ ...teamRates, senior: Number(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none font-bold text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pleno (R$/h)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                                    <input
                                                        type="number"
                                                        value={teamRates.plena}
                                                        onChange={(e) => setTeamRates({ ...teamRates, plena: Number(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none font-bold text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Júnior (R$/h)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                                    <input
                                                        type="number"
                                                        value={teamRates.junior}
                                                        onChange={(e) => setTeamRates({ ...teamRates, junior: Number(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-metarh-medium outline-none font-bold text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                        <h3 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2">
                                            <Settings size={20} className="text-green-600" />
                                            Valores de Referência
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Salário Mínimo Nacional</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                                                    <input
                                                        type="number"
                                                        value={generalSettings.minimum_wage}
                                                        onChange={(e) => setGeneralSettings({ ...generalSettings, minimum_wage: Number(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Taxa SAT Padrão (%)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={generalSettings.sat_rate ? (generalSettings.sat_rate * 100).toFixed(2) : 0}
                                                        onChange={(e) => setGeneralSettings({ ...generalSettings, sat_rate: Number(e.target.value) / 100 })}
                                                        className="w-full pl-4 pr-10 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-700"
                                                        step="0.1"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                                        <h3 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2">
                                            <Heart size={20} className="text-yellow-600" />
                                            Outros Benefícios
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">Atualize os valores padrão sugeridos na calculadora.</p>

                                        <div className="grid md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vale Transporte (Dia)</label>
                                                <input
                                                    type="number"
                                                    value={generalSettings.benefit_options.others?.transport || 0}
                                                    onChange={(e) => {
                                                        const newOthers = { ...generalSettings.benefit_options.others, transport: Number(e.target.value) };
                                                        setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, others: newOthers } });
                                                    }}
                                                    className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-gray-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vale Refeição (Dia)</label>
                                                <input
                                                    type="number"
                                                    value={generalSettings.benefit_options.others?.meal || 0}
                                                    onChange={(e) => {
                                                        const newOthers = { ...generalSettings.benefit_options.others, meal: Number(e.target.value) };
                                                        setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, others: newOthers } });
                                                    }}
                                                    className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-gray-700"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vale Alimentação (Mês)</label>
                                                <input
                                                    type="number"
                                                    value={generalSettings.benefit_options.others?.food || 0}
                                                    onChange={(e) => {
                                                        const newOthers = { ...generalSettings.benefit_options.others, food: Number(e.target.value) };
                                                        setGeneralSettings({ ...generalSettings, benefit_options: { ...generalSettings.benefit_options, others: newOthers } });
                                                    }}
                                                    className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none font-bold text-gray-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Values CRUD */}
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                        <h3 className="text-lg font-bold text-metarh-dark mb-4 flex items-center gap-2">
                                            <Briefcase size={20} className="text-gray-600" />
                                            Itens Personalizados (Custos/Benefícios)
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">Gerencie itens customizados para custos/benefícios.</p>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm border">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-3 py-2 border">Nome</th>
                                                        <th className="px-3 py-2 border">Valor (R$)</th>
                                                        <th className="px-3 py-2 border">Categoria</th>
                                                        <th className="px-3 py-2 border">Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(generalSettings.benefit_options.custom || []).map((item) => (
                                                        <tr key={item.id} className="border-b">
                                                            <td className="px-3 py-2 border">{item.name}</td>
                                                            <td className="px-3 py-2 border">{fmtCurrency(item.value)}</td>
                                                            <td className="px-3 py-2 border">{item.category}</td>
                                                            <td className="px-3 py-2 border space-x-2">
                                                                <button
                                                                    className="px-2 py-1 rounded bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-bold"
                                                                    onClick={() => {
                                                                        setCustomEdit(item);
                                                                        setIsEditingCustom(true);
                                                                    }}
                                                                >Editar</button>
                                                                <button
                                                                    className="px-2 py-1 rounded bg-red-200 hover:bg-red-300 text-red-900 font-bold"
                                                                    onClick={() => {
                                                                        if (window.confirm('Remover este item?')) {
                                                                            setGeneralSettings((prev) => ({
                                                                                ...prev,
                                                                                benefit_options: {
                                                                                    ...prev.benefit_options,
                                                                                    custom: (prev.benefit_options.custom || []).filter((i) => i.id !== item.id)
                                                                                }
                                                                            }));
                                                                        }
                                                                    }}
                                                                >Excluir</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                className="px-4 py-2 rounded bg-metarh-medium text-white font-bold hover:bg-metarh-dark"
                                                onClick={() => {
                                                    setCustomEdit({ name: '', value: 0, category: '' });
                                                    setIsEditingCustom(true);
                                                }}
                                            >Adicionar Novo</button>
                                        </div>
                                        {isEditingCustom && (
                                            <div className="mt-6 p-4 bg-white border rounded-xl shadow flex flex-col gap-3">
                                                <div className="flex gap-3">
                                                    <input
                                                        className="flex-1 p-2 border rounded"
                                                        placeholder="Nome do item"
                                                        value={customEdit.name}
                                                        onChange={e => setCustomEdit({ ...customEdit, name: e.target.value })}
                                                    />
                                                    <input
                                                        className="w-32 p-2 border rounded"
                                                        type="number"
                                                        placeholder="Valor"
                                                        value={customEdit.value}
                                                        onChange={e => setCustomEdit({ ...customEdit, value: Number(e.target.value) })}
                                                    />
                                                    <input
                                                        className="w-48 p-2 border rounded"
                                                        placeholder="Categoria"
                                                        value={customEdit.category}
                                                        onChange={e => setCustomEdit({ ...customEdit, category: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        className="px-4 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700"
                                                        onClick={() => {
                                                            if (!customEdit.name.trim()) {
                                                                alert('Nome obrigatório');
                                                                return;
                                                            }
                                                            if (!customEdit.category.trim()) {
                                                                alert('Categoria obrigatória');
                                                                return;
                                                            }
                                                            setGeneralSettings(prev => {
                                                                let customArr = prev.benefit_options.custom || [];
                                                                // If editing, replace; else, add new with unique id
                                                                if (customEdit.id) {
                                                                    customArr = customArr.map(i => i.id === customEdit.id ? { ...customEdit } : i);
                                                                } else {
                                                                    customArr = [...customArr, { ...customEdit, id: `custom-${Date.now()}` }];
                                                                }
                                                                return {
                                                                    ...prev,
                                                                    benefit_options: {
                                                                        ...prev.benefit_options,
                                                                        custom: customArr
                                                                    }
                                                                };
                                                            });
                                                            setIsEditingCustom(false);
                                                        }}
                                                    >Salvar</button>
                                                    <button
                                                        className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-bold hover:bg-gray-400"
                                                        onClick={() => setIsEditingCustom(false)}
                                                    >Cancelar</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white flex-shrink-0">
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
