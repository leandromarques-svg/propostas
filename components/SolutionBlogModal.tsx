import React, { useState, useMemo } from 'react';
import { X, ExternalLink, Search, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { EnrichedBlogPost, getFunnelStageInfo } from '../lib/wordpressService';

interface SolutionBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageKey: string;
  postsData: {
    all: EnrichedBlogPost[];
    topo: EnrichedBlogPost[];
    meio: EnrichedBlogPost[];
    fundo: EnrichedBlogPost[];
  };
  initialStage?: 'todos' | 'topo' | 'meio' | 'fundo';
}

export const SolutionBlogModal: React.FC<SolutionBlogModalProps> = ({
  isOpen,
  onClose,
  packageKey,
  postsData,
  initialStage = 'todos'
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'topo' | 'meio' | 'fundo'>(initialStage);
  const [searchFilter, setSearchFilter] = useState('');

  // Update active tab if initialStage changes when modal opens
  React.useEffect(() => {
    setActiveTab(initialStage);
    setSearchFilter('');
  }, [initialStage, isOpen]);

  const rawPosts = useMemo(() => {
    switch (activeTab) {
      case 'topo':
        return postsData.topo;
      case 'meio':
        return postsData.meio;
      case 'fundo':
        return postsData.fundo;
      case 'todos':
      default:
        return postsData.all;
    }
  }, [activeTab, postsData]);

  const filteredPosts = useMemo(() => {
    if (!searchFilter.trim()) return rawPosts;
    const term = searchFilter.toLowerCase();
    return rawPosts.filter(
      p =>
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term)
    );
  }, [rawPosts, searchFilter]);

  if (!isOpen) return null;

  const currentStageInfo = activeTab !== 'todos' ? getFunnelStageInfo(activeTab) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[2.5rem] shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-metarh-dark text-white p-6 sm:p-7 flex justify-between items-start z-20 shadow-md">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-block px-3 py-1 bg-metarh-lime text-metarh-dark text-xs font-bold rounded-full uppercase tracking-wide">
                Solução: {packageKey}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                <BookOpen size={13} className="text-metarh-lime" />
                Blog METARH News
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              Conteúdos & Matérias da Solução
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Todos os artigos estratégicos classificados por etapa da jornada de decisão do cliente
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Stage Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'todos'
                    ? 'bg-metarh-dark text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Todos ({postsData.all.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('topo')}
                className={`text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'topo'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                Topo de Funil ({postsData.topo.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('meio')}
                className={`text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'meio'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                Meio de Funil ({postsData.meio.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fundo')}
                className={`text-xs font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                  activeTab === 'fundo'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                Fundo de Funil ({postsData.fundo.length})
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Filtrar matérias..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-metarh-medium text-gray-800 placeholder-gray-400"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Context Banner about the selected stage */}
          {currentStageInfo && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${currentStageInfo.color}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>
                  <strong>{currentStageInfo.label} ({currentStageInfo.stageName}):</strong> {currentStageInfo.description}
                </span>
              </div>
              <span className="font-bold text-[11px] whitespace-nowrap bg-white/60 px-2 py-0.5 rounded-full">
                {rawPosts.length} conteúdos nesta etapa
              </span>
            </div>
          )}
        </div>

        {/* Posts Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100 p-8">
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen size={22} />
              </div>
              <h4 className="text-sm font-bold text-gray-700">Nenhum conteúdo encontrado</h4>
              <p className="text-xs text-gray-500 mt-1">
                {searchFilter
                  ? `Nenhum artigo corresponde à busca "${searchFilter}". Tente outro termo.`
                  : `Não há conteúdos cadastrados nesta etapa para a solução ${packageKey}.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => {
                const stage = getFunnelStageInfo(post.funnelStage);
                return (
                  <div
                    key={post.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 hover:border-metarh-medium hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${stage.badge}`}>
                          {stage.label}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(post.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-metarh-medium transition-colors line-clamp-2 leading-snug mb-2">
                        {post.title}
                      </h4>

                      {post.excerpt && (
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 mt-auto">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-purple-50 hover:bg-metarh-medium text-metarh-dark hover:text-white font-bold text-xs transition-all group-hover:shadow-xs cursor-pointer"
                      >
                        <span>Acessar no Blog METARH</span>
                        <ExternalLink size={13} className="shrink-0" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-[2.5rem]">
          <div className="text-xs text-gray-500 font-medium">
            Exibindo <strong>{filteredPosts.length}</strong> de <strong>{rawPosts.length}</strong> conteúdos da etapa
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-metarh-medium hover:bg-metarh-dark text-white font-bold text-xs transition-all shadow-md shadow-metarh-medium/20 cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
