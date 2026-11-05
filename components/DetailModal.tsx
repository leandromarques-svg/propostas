import React from 'react';
import { SolutionData } from '../types';
import { X, Wrench, Users, Target, Circle, Clock, ShieldCheck, FileText } from 'lucide-react';

interface DetailModalProps {
  solution: SolutionData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ solution, isOpen, onClose }) => {
  if (!isOpen || !solution) return null;

  const StandardBullet = () => (
    <div className="mt-1.5 shrink-0 text-metarh-medium">
      <Circle size={8} fill="currentColor" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2.5rem] shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-metarh-dark text-white p-6 md:p-8 flex justify-between items-start z-20 shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 bg-metarh-lime text-metarh-dark text-xs font-bold rounded-full uppercase tracking-wide">
                Solução: {solution.solutionPackage}
              </span>
              {solution.sla && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                  <Clock size={12} className="text-metarh-lime" /> {solution.sla}
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">{solution.name}</h2>
            <p className="text-sm text-gray-300 mt-1 flex items-center gap-1.5">
              <FileText size={15} className="text-metarh-lime" />
              Ficha Técnica do Serviço
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X size={26} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          {/* About Solution & Service Description */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-metarh-medium uppercase tracking-wider mb-2">
                Sobre a Solução ({solution.solutionPackage})
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {solution.aboutSolution}
              </p>
            </div>

            <div className="p-5 bg-purple-50/70 border-l-4 border-metarh-medium rounded-r-2xl">
              <h4 className="font-bold text-metarh-dark mb-1.5 text-xs sm:text-sm uppercase tracking-wider">
                Descrição do Serviço: {solution.name}
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {solution.description}
              </p>
            </div>
          </section>

          {/* Benefits & Public Needs */}
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-metarh-medium" />
                <h3 className="text-base font-bold text-metarh-dark">Benefícios para o Cliente</h3>
              </div>
              <ul className="space-y-2.5">
                {solution.benefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <StandardBullet />
                    <span className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-metarh-medium" />
                <h3 className="text-base font-bold text-metarh-dark">Dores & Necessidades Atendidas</h3>
              </div>
              <ul className="space-y-2.5">
                {solution.publicNeeds.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <StandardBullet />
                    <span className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Tools & Specifications */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-100 p-6 rounded-3xl bg-white shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-metarh-medium font-bold text-sm">
                <Wrench size={16} /> Ferramentas e Metodologias
              </div>
              <ul className="space-y-2">
                {solution.toolsUsed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <StandardBullet />
                    <span className="text-xs md:text-sm text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-gray-100 p-6 rounded-3xl bg-white shadow-xs space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1 text-metarh-dark font-bold text-xs uppercase tracking-wider">
                  <Clock size={14} className="text-metarh-medium" /> SLA Estimado
                </div>
                <p className="text-xs md:text-sm text-gray-600 font-medium">{solution.sla}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-metarh-dark font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-metarh-medium" /> Mão de Obra
                </div>
                <p className="text-xs md:text-sm text-gray-600 font-medium">{solution.laborType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-[2.5rem]">
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-full bg-metarh-medium hover:bg-metarh-dark text-white font-bold text-sm transition-all shadow-md shadow-metarh-medium/20 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
