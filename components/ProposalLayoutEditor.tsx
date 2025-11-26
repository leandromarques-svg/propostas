
import React, { useState, useEffect } from 'react';
import { ProposalSection } from '../types';
import { Save, ArrowUp, ArrowDown, Eye, EyeOff, GripVertical, FileText, Layout, RefreshCcw } from 'lucide-react';

interface ProposalLayoutEditorProps {
  initialLayout: ProposalSection[];
  onSave: (newLayout: ProposalSection[]) => void;
  onCancel: () => void;
}

// Configuração padrão caso precise resetar
export const DEFAULT_LAYOUT: ProposalSection[] = [
  { id: 'sec_cover', type: 'cover', title: 'Capa da Proposta', isEnabled: true, isEditable: false },
  { id: 'sec_about', type: 'about_metarh', title: 'Quem Somos (METARH)', isEnabled: true, isEditable: true },
  { id: 'sec_sol', type: 'solutions_list', title: 'Escopo das Soluções', isEnabled: true, isEditable: true },
  { id: 'sec_meth', type: 'methodology', title: 'Nossa Metodologia', isEnabled: false, isEditable: true },
  { id: 'sec_team', type: 'team', title: 'Equipe Envolvida', isEnabled: false, isEditable: true },
  { id: 'sec_inv', type: 'investment', title: 'Investimento Estimado', isEnabled: true, isEditable: true },
  { id: 'sec_terms', type: 'terms', title: 'Termos e Condições', isEnabled: false, isEditable: true },
  { id: 'sec_sign', type: 'signature', title: 'Assinatura e Contatos', isEnabled: true, isEditable: false },
];

export const ProposalLayoutEditor: React.FC<ProposalLayoutEditorProps> = ({ initialLayout, onSave, onCancel }) => {
  const [sections, setSections] = useState<ProposalSection[]>(initialLayout.length > 0 ? initialLayout : DEFAULT_LAYOUT);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setSections(newSections);
  };

  const toggleSection = (index: number) => {
    const newSections = [...sections];
    newSections[index].isEnabled = !newSections[index].isEnabled;
    setSections(newSections);
  };

  const updateTitle = (index: number, newTitle: string) => {
    const newSections = [...sections];
    newSections[index].title = newTitle;
    setSections(newSections);
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar o layout padrão?')) {
      setSections(DEFAULT_LAYOUT);
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-metarh-medium p-3 rounded-full text-white shadow-lg shadow-purple-200">
            <Layout size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-metarh-dark">Editor de Layout</h1>
            <p className="text-gray-500 text-sm">Defina a estrutura padrão das propostas geradas.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="p-3 text-gray-400 hover:text-metarh-medium hover:bg-purple-50 rounded-full transition-colors"
            title="Restaurar Padrão"
          >
            <RefreshCcw size={20} />
          </button>
          <button 
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 font-bold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(sections)}
            className="px-8 py-2 bg-metarh-medium text-white rounded-full font-bold shadow-lg shadow-purple-200 hover:bg-metarh-dark transition-all flex items-center gap-2"
          >
            <Save size={18} /> Salvar Layout
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div 
            key={section.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
              ${section.isEnabled 
                ? 'bg-white border-gray-200 shadow-sm' 
                : 'bg-gray-50 border-gray-100 opacity-60 grayscale'
              }
            `}
          >
            {/* Drag Handle Visual */}
            <div className="text-gray-300 cursor-grab active:cursor-grabbing">
              <GripVertical size={20} />
            </div>

            {/* Toggle Visibility */}
            <button
              onClick={() => toggleSection(index)}
              className={`p-2 rounded-full transition-colors ${section.isEnabled ? 'text-metarh-medium bg-purple-50' : 'text-gray-400 bg-gray-200'}`}
              title={section.isEnabled ? "Ocultar seção" : "Mostrar seção"}
            >
              {section.isEnabled ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {section.type.replace('_', ' ')}
                </span>
              </div>
              {section.isEditable ? (
                <input 
                  type="text" 
                  value={section.title}
                  onChange={(e) => updateTitle(index, e.target.value)}
                  className="w-full text-lg font-bold text-gray-800 bg-transparent border-b border-dashed border-gray-300 focus:border-metarh-medium focus:bg-white outline-none transition-colors py-1"
                  placeholder="Título da Seção"
                />
              ) : (
                <div className="text-lg font-bold text-gray-800 py-1 flex items-center gap-2 cursor-not-allowed opacity-80">
                  {section.title} <span className="text-xs font-normal text-gray-400">(Fixo)</span>
                </div>
              )}
            </div>

            {/* Reorder Controls */}
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-metarh-dark disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ArrowUp size={18} />
              </button>
              <button 
                onClick={() => moveSection(index, 'down')}
                disabled={index === sections.length - 1}
                className="p-1 text-gray-400 hover:text-metarh-dark disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ArrowDown size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
        <FileText className="text-blue-500 shrink-0 mt-1" size={20} />
        <div>
          <h4 className="font-bold text-blue-800">Nota sobre o Editor</h4>
          <p className="text-sm text-blue-600">
            As alterações feitas aqui afetarão a estrutura de todas as novas propostas geradas em PDF.
            <br/>Seções desativadas não aparecerão no documento final.
          </p>
        </div>
      </div>

    </div>
  );
};
