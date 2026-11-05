import React from 'react';
import { SolutionData } from '../types';
import { Clock, CheckCircle2, ChevronRight, Info, Wrench, Target } from 'lucide-react';

interface ServiceCardProps {
  service: SolutionData;
  onOpenDetails: (service: SolutionData) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onOpenDetails }) => {
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-200/90 hover:border-metarh-medium/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full mb-1 uppercase tracking-wider">
              Serviço
            </span>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-metarh-medium transition-colors">
              {service.name}
            </h3>
          </div>
          {service.sla && (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 shrink-0">
              <Clock size={12} className="text-metarh-medium" />
              <span className="truncate max-w-[130px]">{service.sla}</span>
            </div>
          )}
        </div>

        {/* Service Description */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">
          {service.description}
        </p>

        {/* Benefits Preview */}
        {service.benefits && service.benefits.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
              <Target size={11} className="text-metarh-medium" /> Benefícios Principais
            </span>
            <div className="space-y-1">
              {service.benefits.slice(0, 2).map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle2 size={12} className="text-metarh-medium shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public Needs Preview */}
        {service.publicNeeds && service.publicNeeds.length > 0 && (
          <div className="mb-5 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Dores do Cliente
            </span>
            <div className="flex flex-wrap gap-1">
              {service.publicNeeds.slice(0, 2).map((need, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-purple-50 text-metarh-dark px-2 py-0.5 rounded-md border border-purple-100 line-clamp-1 max-w-[220px]"
                >
                  {need}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={() => onOpenDetails(service)}
        className="w-full py-2.5 px-4 rounded-xl bg-gray-50 hover:bg-metarh-medium text-gray-700 hover:text-white font-bold text-xs border border-gray-200 hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
      >
        <Info size={14} />
        <span>Mais Informações & Ficha do Serviço</span>
        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
