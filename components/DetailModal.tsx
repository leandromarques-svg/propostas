import React, { useState, useEffect } from 'react';
import { SolutionData, CartSelections } from '../types';
import { X, Wrench, Users, Target, Circle, BookOpen, BarChart } from 'lucide-react';
import { getPostsByCategory, getFunnelCounts, getSolutionCategoryId, BlogPost, FunnelCounts } from './lib/wordpress';

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

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [funnelCounts, setFunnelCounts] = useState<FunnelCounts>({ topo: 0, meio: 0, fundo: 0 });
  const [loadingBlog, setLoadingBlog] = useState(false);

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

  useEffect(() => {
    const fetchBlogContent = async () => {
      if (solution) {
        setLoadingBlog(true);
        const categoryId = getSolutionCategoryId(solution.solutionPackage); // Using package or name? User said "categories (segments)".
        // The mapping in wordpress.ts uses names like 'business', 'pharma', etc.
        // solution.solutionPackage usually holds the group name (e.g. 'Business', 'Tech Recruiter').
        // Let's try to match with solutionPackage first.

        if (categoryId) {
          const posts = await getPostsByCategory(categoryId);
          setBlogPosts(posts);
          setFunnelCounts(getFunnelCounts(posts));
        } else {
          setBlogPosts([]);
          setFunnelCounts({ topo: 0, meio: 0, fundo: 0 });
        }
        setLoadingBlog(false);
      }
    };
    fetchBlogContent();
  }, [solution]);

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

          {/* Blog Content Integration */}
          <section className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="text-metarh-medium" />
              <h3 className="text-lg font-bold text-metarh-dark">Conteúdos Relacionados (Blog)</h3>
            </div>

            {loadingBlog ? (
              <div className="text-center py-4 text-gray-500">Carregando conteúdos...</div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Topo (Aprendizado)</div>
                    <div className="text-2xl font-bold text-metarh-medium">{funnelCounts.topo}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Artigos</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Meio (Descoberta)</div>
                    <div className="text-2xl font-bold text-metarh-medium">{funnelCounts.meio}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Artigos</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">Fundo (Decisão)</div>
                    <div className="text-2xl font-bold text-metarh-medium">{funnelCounts.fundo}</div>
                    <div className="text-[10px] text-gray-400 mt-1">Artigos</div>
                  </div>
                </div>

                {blogPosts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Últimos Artigos:</h4>
                    <ul className="space-y-2">
                      {blogPosts.slice(0, 3).map(post => (
                        <li key={post.id}>
                          <a href={post.link} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white rounded-lg border border-gray-100 hover:border-metarh-medium/30 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-800 group-hover:text-metarh-medium transition-colors line-clamp-1" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(post.date).toLocaleDateString()}</span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 text-right">
                      <a href="https://metarh.com.br/metarhnews/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-metarh-medium hover:underline">
                        Ver todos os conteúdos &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {blogPosts.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm italic">
                    Nenhum conteúdo encontrado para esta categoria.
                  </div>
                )}
              </div>
            )}
          </section>

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
