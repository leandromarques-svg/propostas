import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { getBlogPostsForPackage, EnrichedBlogPost } from '../lib/wordpressService';
import { SolutionBlogModal } from './SolutionBlogModal';

interface SolutionBlogSectionProps {
  packageKey: string;
}

export const SolutionBlogSection: React.FC<SolutionBlogSectionProps> = ({ packageKey }) => {
  const [postsData, setPostsData] = useState<{
    all: EnrichedBlogPost[];
    topo: EnrichedBlogPost[];
    meio: EnrichedBlogPost[];
    fundo: EnrichedBlogPost[];
  }>({ all: [], topo: [], meio: [], fundo: [] });

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<'todos' | 'topo' | 'meio' | 'fundo'>('todos');

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const data = await getBlogPostsForPackage(packageKey);
        if (isMounted) {
          setPostsData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [packageKey]);

  const handleOpenStage = (stage: 'todos' | 'topo' | 'meio' | 'fundo') => {
    setSelectedStage(stage);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50/70 via-white to-gray-50 rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-xs mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-metarh-medium/10 text-metarh-medium flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-metarh-dark">
                Blog METARH & Etapas do Funil da Solução
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 bg-metarh-lime text-metarh-dark rounded-full">
                {postsData.all.length} {postsData.all.length === 1 ? 'conteúdo' : 'conteúdos'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Artigos estratégicos classificados pela jornada do cliente para apoiar sua abordagem comercial
            </p>
          </div>
        </div>

        {/* Action to view all */}
        <button
          type="button"
          onClick={() => handleOpenStage('todos')}
          className="self-start sm:self-auto text-xs font-bold text-metarh-medium hover:text-metarh-dark flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-gray-200 hover:border-metarh-medium transition-all shadow-xs cursor-pointer"
        >
          <span>Ver todos ({postsData.all.length})</span>
          <ExternalLink size={13} />
        </button>
      </div>

      {/* Funnel Stage Count Cards */}
      {isLoading ? (
        <div className="py-6 text-center text-xs text-gray-400 animate-pulse bg-white/70 rounded-2xl border border-gray-100">
          Carregando acervo de conteúdos da solução {packageKey}...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Topo de Funil */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Topo de Funil
                </span>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {postsData.topo.length} {postsData.topo.length === 1 ? 'conteúdo' : 'conteúdos'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                Aprendizado & Descoberta
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Conteúdos educativos para atrair novos leads, diagnosticar problemas e despertar interesse inicial.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenStage('topo')}
              className="w-full mt-auto py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <span>Acessar conteúdos da etapa</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Meio de Funil */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Meio de Funil
                </span>
                <span className="text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {postsData.meio.length} {postsData.meio.length === 1 ? 'conteúdo' : 'conteúdos'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                Reconhecimento & Consideração
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Artigos detalhados para quem já reconheceu a necessidade e está comparando soluções e metodologias.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenStage('meio')}
              className="w-full mt-auto py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-metarh-medium text-metarh-medium hover:text-white font-bold text-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <span>Acessar conteúdos da etapa</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 3: Fundo de Funil */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Fundo de Funil
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {postsData.fundo.length} {postsData.fundo.length === 1 ? 'conteúdo' : 'conteúdos'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                Decisão de Compra & Fechamento
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Material focado em validação de contratação, segurança jurídica, agilidade e comprovação de resultados.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenStage('fundo')}
              className="w-full mt-auto py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <span>Acessar conteúdos da etapa</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Modal with all contents */}
      <SolutionBlogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageKey={packageKey}
        postsData={postsData}
        initialStage={selectedStage}
      />
    </div>
  );
};
