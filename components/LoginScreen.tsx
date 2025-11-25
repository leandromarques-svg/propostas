
import React, { useState } from 'react';
import { Logo } from './Logo';
import { User } from '../types';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void; // Changed prop name slightly for clarity, though handled by App session listener mainly
  isExiting?: boolean;
  users?: any; // Deprecated prop kept for compatibility if needed, but unused
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ isExiting }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      // Successful login will trigger the onAuthStateChange in App.tsx
    } catch (err: any) {
      setError('Erro ao entrar: ' + (err.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-metarh-dark flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-95 translate-y-4 filter blur-sm' : 'opacity-100 scale-100'}`}>
      
      {/* Background blobs */}
      <div className="blob-shape bg-metarh-medium w-[800px] h-[800px] rounded-full top-[-400px] right-[-200px] mix-blend-screen filter blur-[100px] opacity-20"></div>
      <div className="blob-shape bg-metarh-pink w-[600px] h-[600px] rounded-full bottom-[-200px] left-[-200px] mix-blend-screen filter blur-[80px] opacity-20"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-fade-in">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <Logo variant="purple" />
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Bem-vindo(a)</h2>
          <p className="text-center text-gray-500 mb-8">Acesse para gerenciar suas propostas</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium focus:border-transparent outline-none transition-all"
                placeholder="seu.email@metarh.com.br"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium focus:border-transparent outline-none transition-all"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center flex items-center justify-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-metarh-medium text-white font-bold rounded-full shadow-lg shadow-purple-200 hover:bg-metarh-dark hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'} <LogIn size={18} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            METARH Recursos Humanos &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};
