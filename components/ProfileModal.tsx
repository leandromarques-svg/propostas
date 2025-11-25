
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { X, User as UserIcon, Mail, Phone, Linkedin, Briefcase, FileText, Image as ImageIcon, Upload, Save } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(user);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await onSave(formData); // The onSave prop in App.tsx now handles Supabase logic
        onClose();
    } catch (error) {
        console.error(error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-metarh-dark/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-metarh-dark flex items-center gap-2">
                <UserIcon className="text-metarh-medium" /> Editar Perfil
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden shrink-0 relative group">
                    {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-metarh-medium text-white text-4xl font-bold">
                            {formData.name.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <ImageIcon size={16}/> Foto de Perfil
                    </label>
                    <div className="relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="avatar-upload"
                        />
                        <label 
                            htmlFor="avatar-upload"
                            className="flex items-center gap-3 px-4 py-3 rounded-full border border-gray-300 hover:border-metarh-medium cursor-pointer hover:bg-gray-50 transition-colors w-full"
                        >
                            <div className="bg-metarh-gray p-2 rounded-full text-metarh-medium">
                                <Upload size={18} />
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                                {formData.avatarUrl ? 'Alterar foto' : 'Carregar foto'}
                            </span>
                        </label>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-2">Recomendado: Imagem quadrada, min 250x250px.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <UserIcon size={16}/> Nome Completo
                    </label>
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Briefcase size={16}/> Cargo / Função
                    </label>
                    <input 
                        type="text" 
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={16}/> Mini Bio (Para assinatura da proposta)
                </label>
                <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-[2rem] border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 ml-2">Essa descrição aparecerá no rodapé das propostas geradas.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Mail size={16}/> E-mail
                    </label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none"
                        required
                        disabled // Email generally shouldn't be changed easily without verification
                        title="Email não pode ser alterado aqui"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Phone size={16}/> Telefone
                    </label>
                    <input 
                        type="text" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Linkedin size={16}/> LinkedIn (URL)
                </label>
                <input 
                    type="text" 
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium outline-none"
                />
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-full border border-gray-300 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 rounded-full bg-metarh-medium hover:bg-metarh-dark text-white font-bold shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
                >
                    {isSaving ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
