import React, { useState, useEffect } from 'react';
import { SolutionData, CartSelections } from '../types';
import { X, Wrench, Users, Target, Circle } from 'lucide-react';

interface DetailModalProps {
  solution: SolutionData | null;
  initialSelections?: CartSelections;
  isOpen: boolean;
  onClose: () => void;
  onAddToProposal: (s: SolutionData, selections: CartSelections) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ solution, initialSelections, isOpen, onClose, onAddToProposal }) => {
  const [selections, setSelections] = useState<CartSelections>({
    benefits: [],
    publicNeeds: [],
    toolsUsed: [],
    notes: ''
  });

  useEffect(() => {
    if (solution) {
      // Always select all items by default now that checkboxes are removed
      setSelections({
        benefits: [...solution.benefits],
        publicNeeds: [...solution.publicNeeds],
        toolsUsed: [...solution.toolsUsed],
        notes: initialSelections?.notes || ''
      });
    }
  }, [solution, initialSelections]);

  if (!isOpen || !solution) return null;

  const handleSave = () => {
    onAddToProposal(solution, selections);
    onClose();
  };

  // Standardized bullet component for consistency
  const StandardBullet = () => (
    <div className="mt-2 shrink-0 text-metarh-medium">
      <Circle size={8} fill="currentColor" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-metarh-dark text-white p-6 md:p-8 flex justify-between items-start z-20 shadow-lg">
          <div>
            <span className="inline-block px-3 py-1 bg-metarh-lime text-metarh-dark text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
              {solution.solutionPackage}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">{solution.name}</h2>
            <p className="text-sm text-gray-300 mt-1">Detalhes do serviço para proposta.</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">

          <section>
            <h3 className="text-xl font-bold text-metarh-medium mb-3">Sobre a Solução ({solution.solutionPackage})</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{solution.aboutSolution}</p>

            <div className="mt-4 p-6 bg-gray-50 border-l-4 border-metarh-medium rounded-r-lg">
              <h4 className="font-bold text-metarh-dark mb-2 text-lg">Descrição do Serviço</h4>
              {/* Updated font style to match 'About Solution' */}
              <p className="text-gray-700 leading-relaxed text-lg">{solution.description}</p>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Benefits List (Static) */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-metarh-medium" />
                <h3 className="text-lg font-bold text-metarh-dark">Benefícios</h3>
              </div>
              <ul className="space-y-3">
                {solution.benefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <StandardBullet />
                    <span className="text-sm text-gray-700 font-medium leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Public Needs List (Static) */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-metarh-medium" />
                <h3 className="text-lg font-bold text-metarh-dark">Necessidades</h3>
              </div>
              <ul className="space-y-3">
                {solution.publicNeeds.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <StandardBullet />
                    <span className="text-sm text-gray-700 font-medium leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tools List (Static) */}
            <div className="border border-gray-100 p-6 rounded-xl bg-white">
              <div className="flex items-center gap-2 mb-4 text-metarh-medium font-bold">
                <Wrench size={18} /> Ferramentas
              </div>
              <ul className="space-y-3">
                {solution.toolsUsed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <StandardBullet />
                    <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-metarh-dark font-bold">
                  SLA Estimado
                </div>
                <p className="text-sm text-gray-600 font-medium">{solution.sla}</p>
              </div>
              <div className="p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-metarh-dark font-bold">
                  <Users size={18} /> Mão de Obra
                </div>
                <p className="text-sm text-gray-600 font-medium">{solution.laborType}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full border border-gray-300 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-full bg-metarh-medium hover:bg-metarh-dark text-white font-bold shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            {initialSelections ? 'Atualizar Item' : 'Adicionar à Proposta'}
          </button>
        </div>
      </div>
    </div>
  );
};
