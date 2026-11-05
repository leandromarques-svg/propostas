import React, { useState } from 'react';
import { Logo } from './Logo';
import { User } from '../types';
import { Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { getUsers, MASTER_USER } from './lib/userService';

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
      const trimmedUser = username.trim().toLowerCase();
      const trimmedPass = password.trim();

      // Check Master User first
      if (
        (trimmedUser === 'leandro' || trimmedUser === 'leandro@metarh.com.br') &&
        trimmedPass === '123'
      ) {
        setLoginUser(MASTER_USER);
        setTimeout(() => {
          onLoginSuccess(MASTER_USER);
        }, 600);
        return;
      }

      // Check other local users
      const storedUsers = await getUsers();
      const allUsers = [...(users || []), ...storedUsers];
      const foundUser = allUsers.find(
        u =>
          (u.username?.toLowerCase() === trimmedUser || u.email?.toLowerCase() === trimmedUser) &&
          u.password === trimmedPass
      );

      if (foundUser) {
        if ((foundUser.role || '').toLowerCase().trim() === 'cliente') {
          setError('Acesso restrito ao time interno da METARH.');
          setIsLoading(false);
          return;
        }
        setLoginUser(foundUser);
        setTimeout(() => {
          onLoginSuccess(foundUser);
        }, 600);
      } else {
        setError('Usuário ou senha incorretos.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao autenticar');
      setIsLoading(false);
    }
  };

  // Loading Screen with "Ball Logo"
  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden transition-all duration-700 ease-in-out ${
          isExiting ? 'opacity-0 scale-105 filter blur-sm' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[700px] h-[700px] border border-metarh-medium/10 rounded-full animate-ping absolute"
            style={{ animationDuration: '3s' }}
          ></div>
        </div>

        <div className="blob-shape bg-metarh-medium w-[500px] h-[500px] rounded-full top-[-150px] right-[-150px] mix-blend-multiply filter blur-[80px] opacity-15 animate-float"></div>
        <div
          className="blob-shape bg-metarh-pink w-[450px] h-[450px] rounded-full bottom-[-100px] left-[-100px] mix-blend-multiply filter blur-[80px] opacity-15 animate-float"
          style={{ animationDelay: '2s' }}
        ></div>

        <div className="z-10 flex flex-col items-center justify-center relative">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-metarh-medium/20 rounded-full blur-xl animate-pulse-slow"></div>
            <div className="animate-breathing relative z-10">
              <Logo variant="purple" orientation="icon" className="h-28 w-28 drop-shadow-2xl" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h3 className="text-2xl font-bold text-metarh-dark tracking-tight animate-fade-in-down">
              Bem-vindo, {loginUser?.name?.split(' ')[0] || 'Leandro'}!
            </h3>
            <p className="text-metarh-medium/80 font-medium text-xs tracking-widest uppercase animate-pulse">
              Carregando Árvore de Soluções...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-metarh-dark flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-700 ease-in-out ${
        isExiting ? 'opacity-0 -translate-y-10 scale-95' : 'opacity-100'
      }`}
    >
      {/* Background blobs */}
      <div className="blob-shape bg-metarh-medium w-[800px] h-[800px] rounded-full top-[-400px] right-[-200px] mix-blend-screen filter blur-[100px] opacity-25 animate-float"></div>
      <div
        className="blob-shape bg-metarh-pink w-[600px] h-[600px] rounded-full bottom-[-200px] left-[-200px] mix-blend-screen filter blur-[80px] opacity-25 animate-float"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 animate-fade-in">
        <div className="p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <Logo variant="purple" orientation="horizontal" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">Boas-Vindas</h2>
          <p className="text-center text-gray-500 mb-6 text-sm leading-relaxed px-2">
            Acesse a Árvore de Soluções e Ferramentas Estratégicas METARH.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 ml-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium focus:border-transparent outline-none transition-all text-sm font-medium"
                placeholder="Ex: Leandro"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 ml-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium focus:border-transparent outline-none transition-all text-sm font-medium"
                  placeholder="Ex: 123"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-2xl text-center flex items-center justify-center gap-2 font-medium">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-metarh-medium text-white font-bold rounded-full shadow-lg shadow-purple-200 hover:bg-metarh-dark hover:shadow-xl transition-all flex items-center justify-center gap-2 group mt-4 transform active:scale-95 cursor-pointer"
            >
              Entrar no Sistema <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
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