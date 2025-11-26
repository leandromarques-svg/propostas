
import React, { useState } from 'react';
import { Logo } from './Logo';
import { User } from '../types';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  users?: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, users = [] }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Local Authentication Logic
    const foundUser = users.find(u => 
      (u.username?.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) && 
      u.password === password
    );

    if (foundUser) {
      setIsLoading(true);
      // Simulate loading delay for better UX before switching screens
      setTimeout(() => {
        onLoginSuccess(foundUser);
      }, 2000);
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden animate-fade-in">
        {/* Abstract Background Shapes for Loading */}
        <div className="blob-shape bg-metarh-medium w-[600px] h-[600px] rounded-full top-[-200px] right-[-200px] mix-blend-multiply filter blur-[80px] opacity-10 animate-pulse"></div>
        <div className="blob-shape bg-metarh-pink w-[500px] h-[500px] rounded-full bottom-[-100px] left-[-100px] mix-blend-multiply filter blur-[80px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="z-10 flex flex-col items-center">
          <div className="mb-8 animate-bounce">
            <Logo variant="purple" orientation="horizontal" className="h-16 w-auto" />
          </div>
          
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-metarh-medium border-r-metarh-pink border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          
          <p className="mt-6 text-metarh-dark font-bold text-lg animate-pulse">Carregando Árvore de Soluções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-metarh-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="blob-shape bg-metarh-medium w-[800px] h-[800px] rounded-full top-[-400px] right-[-200px] mix-blend-screen filter blur-[100px] opacity-20"></div>
      <div className="blob-shape bg-metarh-pink w-[600px] h-[600px] rounded-full bottom-[-200px] left-[-200px] mix-blend-screen filter blur-[80px] opacity-20"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-fade-in">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <Logo variant="purple" />
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Boas Vindas</h2>
          <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed px-4">
            Acesse para conhecer a nossa Árvore de Soluções e gerenciar suas propostas
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium focus:border-transparent outline-none transition-all"
                placeholder="Digite seu usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium focus:border-transparent outline-none transition-all"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center flex items-center justify-center gap-2 font-medium">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-metarh-medium text-white font-bold rounded-full shadow-lg shadow-purple-200 hover:bg-metarh-dark hover:shadow-xl transition-all flex items-center justify-center gap-2 group mt-4"
            >
              Entrar <LogIn size={18} className="group-hover:translate-x-1 transition-transform"/>
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
