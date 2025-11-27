
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, UserPlus, Edit, Trash2, Shield, Save, Loader2 } from 'lucide-react';
import { getUsers, saveUser, deleteUser, UserProfile } from './lib/userService';

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
  users,
  isOpen,
  onClose,
  onCreateUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [userList, setUserList] = useState<User[]>(users);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await getUsers();
    // Map UserProfile to User if needed, or just use as is since they are compatible
    setUserList(data as unknown as User[]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setFormData(user);
    setShowPassword(false);
  };

  const startCreate = () => {
    setEditingId('new');
    setFormData({
      id: `u${Date.now()}`,
      username: '',
      password: '',
      name: '',
      role: '',
      email: '',
      phone: '',
      linkedin: '',
      bio: '',
      avatarUrl: '',
      isAdmin: false
    });
    setShowPassword(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.password || !formData.name) {
      alert('Preencha os campos obrigatórios (Usuário, Senha, Nome)');
      return;
    }

    setIsLoading(true);
    try {
      // @ts-ignore
      await saveUser(formData as UserProfile);
      await loadUsers();

      if (editingId === 'new') {
        onCreateUser(formData as User);
      } else {
        onUpdateUser(formData as User);
      }
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar usuário: ' + JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      setIsLoading(true);
      try {
        await deleteUser(id);
        await loadUsers();
        onDeleteUser(id);
      } catch (error) {
        console.error(error);
        alert('Erro ao excluir usuário');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = e.target.checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-metarh-dark/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-metarh-dark text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-metarh-lime" /> Gestão de Equipe
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* List Sidebar */}
          <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={startCreate}
                className="w-full py-3 bg-metarh-medium text-white rounded-xl font-bold shadow-md hover:bg-metarh-dark transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={18} /> Novo Usuário
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
              {isLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-metarh-medium" /></div>
              ) : userList.map(u => (
                <div
                  key={u.id}
                  onClick={() => startEdit(u)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3
                    ${editingId === u.id ? 'bg-white border-metarh-medium shadow-md ring-1 ring-metarh-medium' : 'bg-white border-gray-100 hover:border-metarh-medium/50'}
                  `}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">{u.name[0]}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.role}</p>
                  </div>
                  {u.isAdmin && <Shield size={14} className="text-metarh-medium" />}
                </div>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <div className="flex-1 overflow-y-auto bg-white p-8">
            {editingId ? (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingId === 'new' ? 'Criar Novo Usuário' : 'Editar Usuário'}
                  </h3>
                  {editingId !== 'new' && editingId !== currentUser.id && (
                    <button
                      onClick={() => handleDelete(editingId)}
                      className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
                    <input name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cargo *</label>
                    <input name="role" value={formData.role || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Usuário (Login) *</label>
                    <input name="username" value={formData.username || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" disabled={editingId !== 'new'} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Senha *</label>
                    <input type="text" name="password" value={formData.password || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
                    <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">LinkedIn</label>
                    <input name="linkedin" value={formData.linkedin || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Avatar URL</label>
                  <input name="avatarUrl" value={formData.avatarUrl || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bio (para assinatura)</label>
                  <input name="bio" value={formData.bio || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-metarh-medium outline-none" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    id="isAdmin"
                    checked={formData.isAdmin || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-metarh-medium rounded focus:ring-metarh-medium"
                  />
                  <label htmlFor="isAdmin" className="text-sm font-bold text-gray-700">Conceder acesso de Administrador (Master)</label>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={() => setEditingId(null)} className="px-6 py-2 border rounded-xl hover:bg-gray-50">Cancelar</button>
                  <button onClick={handleSave} className="px-8 py-2 bg-metarh-medium text-white font-bold rounded-xl shadow-lg hover:bg-metarh-dark flex items-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Salvar
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Shield size={64} className="mb-4 opacity-20" />
                <p>Selecione um usuário para editar ou crie um novo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
