
import React, { useState } from 'react';
import { Logo } from './Logo';
import { User } from '../types';

import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { getUsers } from './lib/userService';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  users?: User[];
  isExiting?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, users = [], isExiting = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginUser, setLoginUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Fetch users from Supabase
      const remoteUsers = await getUsers();
      // Combine with local users if needed, or just use remote
      const allUsers = [...(users || []), ...remoteUsers];

      // Remove duplicates if any (by username)
      const uniqueUsers = Array.from(new Map(allUsers.map(item => [item.username, item])).values());

      // Local Authentication Logic
      const foundUser = uniqueUsers.find(u =>
        (u.username?.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) &&
        u.password === password
      );

      if (foundUser) {
        setLoginUser(foundUser);
        // Simulate loading delay for better UX before switching screens
        setTimeout(() => {
          onLoginSuccess(foundUser);
        }, 1500);
      } else {
        setError('Usuário ou senha incorretos');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar ao servidor: ' + JSON.stringify(err));
      setIsLoading(false);
    }
  };

  // Loading Screen with "Ball Logo"
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-110 filter blur-lg' : 'opacity-100'}`}>
        {/* Abstract Background Shapes for Loading - More animated */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[800px] border-[1px] border-metarh-medium/10 rounded-full animate-ping absolute" style={{ animationDuration: '3s' }}></div>
          <div className="w-[600px] h-[600px] border-[1px] border-metarh-pink/10 rounded-full animate-ping absolute" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
        </div>

        <div className="blob-shape bg-metarh-medium w-[600px] h-[600px] rounded-full top-[-200px] right-[-200px] mix-blend-multiply filter blur-[80px] opacity-10 animate-float"></div>
        <div className="blob-shape bg-metarh-pink w-[500px] h-[500px] rounded-full bottom-[-100px] left-[-100px] mix-blend-multiply filter blur-[80px] opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="z-10 flex flex-col items-center justify-center relative">
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-metarh-medium/20 rounded-full blur-xl animate-pulse-slow"></div>
            <div className="animate-breathing relative z-10">
              {/* Using the 'icon' (ball) orientation as requested */}
              <Logo variant="purple" orientation="icon" className="h-32 w-32 drop-shadow-2xl" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold text-metarh-dark tracking-tight animate-fade-in-down">Bem vindo, {loginUser?.name.split(' ')[0]}</h3>
            <p className="text-metarh-medium/80 font-medium text-sm animate-pulse tracking-widest uppercase">Preparando ambiente...</p>
          </div>
        </div>
      </div>
    );
  }

  // Main Login Form
  return (
    <div className={`min-h-screen bg-metarh-dark flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 -translate-y-20 scale-95' : 'opacity-100'}`}>

      {/* Background blobs */}
      <div className="blob-shape bg-metarh-medium w-[800px] h-[800px] rounded-full top-[-400px] right-[-200px] mix-blend-screen filter blur-[100px] opacity-20 animate-float"></div>
      <div className="blob-shape bg-metarh-pink w-[600px] h-[600px] rounded-full bottom-[-200px] left-[-200px] mix-blend-screen filter blur-[80px] opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-fade-in">
        <div className="p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <Logo variant="purple" orientation="horizontal" />
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
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center flex items-center justify-center gap-2 font-medium animate-pulse">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-metarh-medium text-white font-bold rounded-full shadow-lg shadow-purple-200 hover:bg-metarh-dark hover:shadow-xl transition-all flex items-center justify-center gap-2 group mt-4 transform active:scale-95"
            >
              Entrar <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
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