import React from 'react';
import { X, ExternalLink, Briefcase, Users, Calculator, TrendingUp, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface CommercialToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const COMMERCIAL_TOOLS = [
  {
    id: 'alocados',
    title: 'Consulta de Alocados & Processos Seletivos',
    subtitle: 'Temporários e Terceirizados',
    description:
      'Acompanhamento em tempo real de colaboradores temporários e terceirizados alocados em clientes, além do status dos processos seletivos em andamento.',
    url: 'https://alocados.metarh.com.br/',
    icon: Users,
    gradient: 'from-blue-600 to-indigo-700',
    tag: 'alocados.metarh.com.br'
  },
  {
    id: 'custos',
    title: 'Confecção de Custos Operacionais',
    subtitle: 'Novos e Recorrentes',
    description:
      'Simulação, confecção e cálculo de custos completos para propostas comerciais de clientes novos e clientes recorrentes da METARH.',
    url: 'https://custos.metarh.com.br/',
    icon: Calculator,
    gradient: 'from-purple-600 to-metarh-dark',
    tag: 'custos.metarh.com.br'
  },
  {
    id: 'cargo-salario',
    title: 'Estudo de Cargos e Salários',
    subtitle: 'Inteligência de Remuneração',
    description:
      'Mapeamento salarial de mercado, faixas remuneratórias, pesquisas salariais e apoio consultivo na precificação e remuneração de profissionais.',
    url: 'https://cargoesalario.metarh.com.br/',
    icon: TrendingUp,
    gradient: 'from-emerald-600 to-teal-800',
    tag: 'cargoesalario.metarh.com.br'
  },
  {
    id: 'onboarding',
    title: 'Onboarding de Novos Clientes',
    subtitle: 'Coleta & Início da Parceria',
    description:
      'Plataforma para coleta de dados e informações essenciais para o começo da parceria e um desenrolar saudável dos processos com o novo cliente.',
    url: 'https://onboarding.metarh.com.br/',
    icon: UserCheck,
    gradient: 'from-amber-500 to-orange-600',
    tag: 'onboarding.metarh.com.br'
  }
];

export const CommercialToolsModal: React.FC<CommercialToolsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-metarh-dark via-purple-900 to-metarh-medium text-white p-6 md:p-8 flex justify-between items-center z-10 shrink-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm text-metarh-lime">
              <Briefcase size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold">Ferramentas do Comercial</h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-metarh-lime text-metarh-dark rounded-full">
                  Exclusivo Gerência
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                Acesse as plataformas e sistemas estratégicos da equipe comercial METARH
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

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMMERCIAL_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="bg-white rounded-3xl p-5 border border-gray-200 hover:border-metarh-medium/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Icon Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <Icon size={22} />
                      </div>
                    </div>

                    <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 leading-snug group-hover:text-metarh-medium transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs font-semibold text-metarh-medium mb-3">{tool.subtitle}</p>

                    <p className="text-xs text-gray-500 leading-relaxed mb-5">
                      {tool.description}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 mb-3 text-center truncate">
                      {tool.tag}
                    </span>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-gray-50 hover:bg-metarh-medium hover:text-white text-gray-700 font-bold text-xs rounded-2xl border border-gray-200 hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
                    >
                      <span>Acessar</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center gap-3 text-xs text-gray-600">
            <ShieldCheck size={18} className="text-metarh-medium shrink-0" />
            <p>
              Estes links abrem diretamente as plataformas em uma nova aba. O acesso é restrito aos
              profissionais autorizados pelo perfil <strong>Gerencial Comercial</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
