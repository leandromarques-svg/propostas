import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, UserPlus, Edit2, Trash2, Shield, Save, Loader2, KeyRound, Building, Search } from 'lucide-react';
import { getUsers, saveUser, deleteUser, isGerencialComercial } from './lib/userService';

interface UserManagementModalProps {
  currentUser: User;
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (newUser: User) => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onCreateUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    password: string;
    role: string;
    grupoEconomico: string;
  }>({
    username: '',
    password: '',
    role: 'Colaborador',
    grupoEconomico: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const canManage = isGerencialComercial(currentUser);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setEditingUsername(null);
      setStatusMessage(null);
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUserList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const startEdit = (user: User) => {
    setEditingUsername(user.username);
    setFormData({
      username: user.username,
      password: user.password || '',
      role: user.role || 'Colaborador',
      grupoEconomico: user.grupoEconomico || ''
    });
    setShowPassword(false);
  };

  const startCreate = () => {
    setEditingUsername('__new__');
    setFormData({
      username: '',
      password: '',
      role: 'Colaborador',
      grupoEconomico: ''
    });
    setShowPassword(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) {
      alert('Apenas usuários com perfil "Gerencial Comercial" podem alterar ou incluir usuários.');
      return;
    }

    if (!formData.username.trim() || !formData.password.trim()) {
      alert('Preencha o Usuário e a Senha.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Salvando usuário no Google Sheets...');
    try {
      const saved = await saveUser(
        {
          id: formData.username,
          username: formData.username.trim(),
          name: formData.username.trim(),
          password: formData.password.trim(),
          role: formData.role,
          grupoEconomico: formData.grupoEconomico.trim()
        },
        currentUser
      );

      if (saved) {
        if (editingUsername === '__new__') {
          onCreateUser(saved);
        } else {
          onUpdateUser(saved);
        }
      }

      await loadUsers();
      setEditingUsername(null);
      setStatusMessage('Usuário salvo com sucesso!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao salvar usuário.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (username: string) => {
    if (!canManage) {
      alert('Apenas usuários com perfil "Gerencial Comercial" podem deletar usuários.');
      return;
    }

    if (username.toLowerCase() === 'leandro' || username.toLowerCase() === 'master-leandro') {
      alert('O usuário master não pode ser excluído.');
      return;
    }

    if (confirm(`Deseja realmente excluir o usuário "${username}" da planilha de acessos?`)) {
      setIsLoading(true);
      setStatusMessage('Excluindo usuário no Google Sheets...');
      try {
        await deleteUser(username, currentUser);
        onDeleteUser(username);
        await loadUsers();
        setStatusMessage('Usuário excluído!');
        setTimeout(() => setStatusMessage(null), 3000);
      } catch (error: any) {
        alert(error?.message || 'Erro ao excluir usuário.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredUsers = userList.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.grupoEconomico && u.grupoEconomico.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-4xl h-[88vh] rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-metarh-dark text-white p-6 md:p-8 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm text-metarh-lime">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Gestão de Usuários e Senhas</h2>
              <p className="text-xs text-purple-200 mt-0.5">
                Sincronizado com a Tabela de Acessos METARH (Google Sheets)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Permission Banner */}
        {!canManage ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Acesso Restrito</h3>
            <p className="text-sm text-gray-600 max-w-md">
              Apenas usuários com o perfil <strong>"Gerencial Comercial"</strong> têm permissão para
              incluir, alterar ou deletar usuários nesta base.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: User List */}
            <div className="w-full md:w-1/2 border-r border-gray-100 flex flex-col h-full bg-gray-50/50">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-white">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por usuário, perfil ou grupo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:border-metarh-medium"
                  />
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={startCreate}
                  className="px-3.5 py-2 bg-metarh-medium text-white rounded-full text-xs font-bold hover:bg-metarh-dark transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                >
                  <UserPlus size={14} /> Novo
                </button>
              </div>

              {statusMessage && (
                <div className="p-2.5 bg-metarh-lime/20 text-metarh-dark text-xs font-bold text-center border-b border-metarh-lime/30">
                  {statusMessage}
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                {isLoading && userList.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin text-metarh-medium" /> Carregando usuários...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">Nenhum usuário encontrado.</div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = editingUsername === user.username;
                    const isMaster = user.username.toLowerCase() === 'leandro';

                    return (
                      <div
                        key={user.id || user.username}
                        onClick={() => startEdit(user)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-50 border-metarh-medium shadow-sm'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800 truncate">{user.username}</span>
                            {isMaster && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-metarh-lime text-metarh-dark rounded-full">
                                Master
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-medium text-metarh-medium bg-purple-50 px-2 py-0.5 rounded-md">
                              {user.role}
                            </span>
                            {user.grupoEconomico && (
                              <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
                                {user.grupoEconomico}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => startEdit(user)}
                            className="p-1.5 text-gray-400 hover:text-metarh-medium rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          {!isMaster && (
                            <button
                              onClick={() => handleDelete(user.username)}
                              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Form */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white overflow-y-auto">
              {editingUsername ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-metarh-dark mb-1">
                      {editingUsername === '__new__' ? 'Criar Novo Usuário' : `Editar ${formData.username}`}
                    </h3>
                    <p className="text-xs text-gray-400">
                      As alterações serão sincronizadas diretamente com a planilha de senhas.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Usuário (Login)
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Ex: Fernanda Bastos"
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Digite a senha"
                        className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-metarh-medium px-2 py-1 cursor-pointer"
                      >
                        {showPassword ? 'Ocultar' : 'Ver'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Perfil
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium bg-white"
                    >
                      <option value="Gerencial Comercial">Gerencial Comercial</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Colaborador">Colaborador</option>
                      <option value="RH">RH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Grupo Econômico (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.grupoEconomico}
                      onChange={(e) => setFormData({ ...formData, grupoEconomico: e.target.value })}
                      placeholder="Ex: 00372-DR. REDDY'S"
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none text-sm font-medium"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setEditingUsername(null)}
                      className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-full bg-metarh-medium text-white font-bold text-xs hover:bg-metarh-dark transition-all flex items-center gap-1.5 shadow-md shadow-metarh-medium/20 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Salvar na Planilha
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3 text-gray-300">
                    <KeyRound size={24} />
                  </div>
                  <p className="text-sm font-bold text-gray-600">Selecione um usuário para editar</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ou clique em <strong>+ Novo</strong> para cadastrar um novo acesso comercial ou cliente.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
