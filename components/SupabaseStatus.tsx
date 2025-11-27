import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export const SupabaseStatus: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const { error } = await supabase.from('proposals').select('count', { count: 'exact', head: true });
            if (error) throw error;
            setStatus('connected');
        } catch (e) {
            console.error('Supabase connection error:', e);
            setStatus('error');
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <Loader2 size={12} className="animate-spin" />
                <span>Conectando...</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100" title="Verifique se rodou o script SQL no Supabase">
                <WifiOff size={12} />
                <span>Offline</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-xs text-metarh-medium bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
            <Wifi size={12} />
            <span>Conectado</span>
        </div>
    );
};
