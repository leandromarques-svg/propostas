import React, { useState, useEffect } from 'react';
import { X, DollarSign, Save, Loader2, Settings } from 'lucide-react';
import { getTeamRates, updateAllTeamRates, TeamRates } from './lib/teamRatesService';
import { supabase } from '../lib/supabase';

interface TeamRatesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TeamRatesModal: React.FC<TeamRatesModalProps> = ({ isOpen, onClose }) => {
    const [rates, setRates] = useState<TeamRates>({
        senior: 150,
        plena: 100,
        junior: 60
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [userInfo, setUserInfo] = useState<{ id: string, email: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadRates();
            loadUserInfo();
        }
    }, [isOpen]);

    const loadUserInfo = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserInfo({ id: user.id, email: user.email || '' });
        }
    };

    const loadRates = async () => {
        setIsLoading(true);
        try {
            const data = await getTeamRates();
            setRates(data);
        } catch (error) {
            console.error('Error loading rates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (type: 'senior' | 'plena' | 'junior', value: string) => {
        const numValue = parseFloat(value) || 0;
        setRates(prev => ({ ...prev, [type]: numValue }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateAllTeamRates(rates);
            alert('Valores atualizados com sucesso!');
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro desconhecido ao atualizar valores.';
            alert(`Erro ao salvar: ${errorMessage}\n\nVerifique o console (F12) para mais detalhes.`);
            console.error('Error saving rates:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-metarh-dark/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-metarh-dark text-white p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="text-metarh-lime" /> Configurar Valores da Equipe
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin text-metarh-medium" size={48} />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-gray-600 mb-6">
                                Configure os valores por hora de cada nível de consultor. Esses valores serão usados na calculadora de preços.
                            </p>

                            {/* Senior */}
                            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={18} className="text-purple-600" />
                                    Consultor Sênior (C2) - Valor/Hora
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                    <input
                                        type="number"
                                        value={rates.senior}
                                        onChange={(e) => handleChange('senior', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none text-lg font-bold"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Plena */}
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={18} className="text-blue-600" />
                                    Consultor Pleno (C1) - Valor/Hora
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                    <input
                                        type="number"
                                        value={rates.plena}
                                        onChange={(e) => handleChange('plena', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Junior */}
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={18} className="text-green-600" />
                                    Assistente (A) - Valor/Hora
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                    <input
                                        type="number"
                                        value={rates.junior}
                                        onChange={(e) => handleChange('junior', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-500 outline-none text-lg font-bold"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
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
