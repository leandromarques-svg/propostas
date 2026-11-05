import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, User as UserIcon, Lock, Briefcase, Building, Save, ShieldCheck } from 'lucide-react';
import { isGerencialComercial } from './lib/userService';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<User>(user);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData(user);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isManager = isGerencialComercial(user);
  const userInitial = (formData.name || formData.username || 'U').charAt(0).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-metarh-dark to-metarh-medium text-white flex items-center justify-center font-bold text-lg shadow-md shadow-metarh-medium/20">
              {userInitial}
            </div>
            <div>
              <h2 className="text-xl font-bold text-metarh-dark">Perfil do Usuário</h2>
              <p className="text-xs text-gray-500">Dados cadastrais e credenciais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {/* Status Badge */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  isManager ? 'bg-purple-100 text-metarh-dark' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Perfil de Acesso</p>
                <p className="text-sm font-bold text-metarh-dark">{formData.role || 'Colaborador'}</p>
              </div>
            </div>
            {isManager && (
              <span className="text-[11px] font-bold px-3 py-1 bg-metarh-lime text-metarh-dark rounded-full">
                Gerência Comercial
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <UserIcon size={14} className="text-metarh-medium" /> Nome
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <UserIcon size={14} className="text-metarh-medium" /> Usuário de Login
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium bg-gray-50"
              required
              readOnly={!isManager}
            />
            {!isManager && (
              <p className="text-[11px] text-gray-400 mt-1 ml-1">
                Apenas a Gerência Comercial pode alterar nomes de usuário.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Lock size={14} className="text-metarh-medium" /> Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-metarh-medium px-2 py-1 cursor-pointer"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Briefcase size={14} className="text-metarh-medium" /> Perfil / Função
            </label>
            {isManager ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium bg-white"
              >
                <option value="Gerencial Comercial">Gerencial Comercial</option>
                <option value="Comercial">Comercial</option>
                <option value="Colaborador">Colaborador</option>
                <option value="RH">RH</option>
                <option value="Cliente">Cliente</option>
              </select>
            ) : (
              <input
                type="text"
                name="role"
                value={formData.role}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600 outline-none"
                readOnly
              />
            )}
          </div>

          {formData.grupoEconomico && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <Building size={14} className="text-metarh-medium" /> Grupo Econômico
              </label>
              <input
                type="text"
                name="grupoEconomico"
                value={formData.grupoEconomico}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 outline-none"
                readOnly={!isManager}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-metarh-medium text-white font-bold text-sm hover:bg-metarh-dark transition-all flex items-center gap-2 shadow-lg shadow-metarh-medium/20 cursor-pointer"
            >
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
