
import React, { useState, useEffect } from 'react';
import { SolutionData } from '../types';
import { X, BookOpen, Lightbulb, MessageCircle, Check, ExternalLink, Loader2 } from 'lucide-react';
import { getBlogPosts, BlogPost } from '../lib/wordpressService';

interface SolutionSummaryModalProps {
    packageKey: string;
    solutions: SolutionData[];
    isOpen: boolean;
    onClose: () => void;
    theme: { color: string; textColor: string; borderColor: string; iconColor: string; icon?: string };
}

// Sales arguments/pitches for each solution package
const SALES_ARGUMENTS: Record<string, string> = {
    'Business': 'Foque nesta solução quando o cliente estiver em momentos críticos de decisão, reestruturação, ou precisando elevar a barra de liderança para garantir resultados estratégicos de longo prazo.',
    'Pharma Recruiter': 'Ofereça quando houver necessidade de rigor técnico e regulatório, garantindo que a operação de saúde/farma não pare por falta de profissionais qualificados ou riscos de compliance.',
    'Staffing': 'Apresente esta solução para clientes que sofrem com variações de demanda, headcount travado (budget) ou precisam de agilidade operacional com total segurança jurídica e trabalhista.',
    'Talent': 'Trabalhe esta solução com clientes que buscam inovação, rejuvenescimento da base de talentos e construção de um pipeline robusto de liderança futura e sucessão.',
    'Tech Recruiter': 'Posicione esta solução para clientes com dificuldade em fechar vagas de TI, projetos de transformação digital atrasados por falta de braço técnico ou necessidade de stacks muito específicas.',
    'Trilhando +': 'Ofereça quando o RH do cliente precisar sair do operacional e atuar estrategicamente na cultura, clima, engajamento, diversidade e desenvolvimento de competências comportamentais.',
    'Varejo Pro': 'A escolha ideal para redes de varejo com alta rotatividade (turnover) ou planos de expansão agressivos que exigem contratação massiva, rápida e geolocalizada.'
};

export const SolutionSummaryModal: React.FC<SolutionSummaryModalProps> = ({
    packageKey,
    solutions,
    isOpen,
    onClose,
    theme
}) => {
    // Blog Posts State
    const [blogPosts, setBlogPosts] = useState<{
        topo: { posts: BlogPost[], total: number },
        meio: { posts: BlogPost[], total: number },
        fundo: { posts: BlogPost[], total: number }
    }>({
        topo: { posts: [], total: 0 },
        meio: { posts: [], total: 0 },
        fundo: { posts: [], total: 0 }
    });
    const [isLoadingBlog, setIsLoadingBlog] = useState(false);

    // Fetch blog posts when modal opens
    useEffect(() => {
        if (isOpen && packageKey) {
            const fetchPosts = async () => {
                setIsLoadingBlog(true);
                try {
                    const [topo, meio, fundo] = await Promise.all([
                        getBlogPosts(packageKey, 'topo'),
                        getBlogPosts(packageKey, 'meio'),
                        getBlogPosts(packageKey, 'fundo')
                    ]);
                    setBlogPosts({ topo, meio, fundo });
                } catch (error) {
                    console.error('Error fetching blog posts:', error);
                } finally {
                    setIsLoadingBlog(false);
                }
            };
            fetchPosts();
        }
    }, [isOpen, packageKey]);

    if (!isOpen) return null;

    // Use the specific sales argument if available, otherwise fallback to the first solution's package description
    const headerText = SALES_ARGUMENTS[packageKey] || solutions[0]?.aboutSolution || '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden">

                {/* Header - Standardized to METARH Dark to match DetailModal */}
                <div className="bg-metarh-dark text-white p-6 md:p-8 flex justify-between items-start z-10 shrink-0 shadow-lg">
                    <div className="flex items-start gap-5">
                        <div className="p-3 bg-white/10 rounded-xl mt-1 backdrop-blur-sm border border-white/10">
                            <BookOpen size={32} />
                        </div>
                        <div>
                            <span className="inline-block px-3 py-1 bg-metarh-lime text-metarh-dark text-xs font-bold rounded-full mb-2 uppercase tracking-wide">
                                Resumo Prático
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">{packageKey}</h2>
                            <p className="text-gray-200 text-base md:text-lg font-medium leading-relaxed max-w-4xl border-l-4 border-metarh-lime pl-4 mt-3">
                                {headerText}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={32} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                    <div className="flex flex-col">
                        {solutions.map((solution, index) => (
                            <div
                                key={solution.id}
                                className="flex flex-col md:flex-row p-8 border-b-2 border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                            >

                                {/* Left Column: Title & SLA */}
                                <div className="md:w-1/4 flex flex-col justify-center md:pr-8 mb-6 md:mb-0 pt-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Serviço {index + 1}</span>
                                    <h3 className="text-2xl font-bold text-metarh-dark leading-tight mb-4">{solution.name}</h3>

                                    {/* SLA Styling */}
                                    <div className="text-sm font-bold text-black">
                                        SLA: <span className="font-normal text-gray-700">{solution.sla}</span>
                                    </div>
                                </div>

                                {/* Right Column: Content Grid */}
                                <div className="flex-1 flex flex-col gap-6">

                                    {/* Description Block - Styled like DetailModal */}
                                    <div className="p-6 bg-gray-50 border-l-4 border-metarh-medium rounded-r-xl">
                                        <h4 className="font-bold text-metarh-dark mb-2 text-sm uppercase tracking-wider">Resumo da Entrega</h4>
                                        <p className="text-gray-700 leading-relaxed text-lg font-normal">
                                            {solution.description}
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8 mt-2">
                                        {/* Pains */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-metarh-pink font-bold text-sm uppercase tracking-wide">
                                                <MessageCircle size={16} /> Dores do Cliente
                                            </div>
                                            <div className="text-gray-700 text-sm">
                                                <ul className="space-y-2">
                                                    {solution.publicNeeds.slice(0, 3).map((need, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-metarh-pink shrink-0"></span>
                                                            <span className="leading-relaxed text-gray-600 font-medium">{need}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Arguments */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-metarh-medium font-bold text-sm uppercase tracking-wide">
                                                <Lightbulb size={16} /> Argumentos Chave
                                            </div>
                                            <div className="text-gray-700 text-sm">
                                                <ul className="space-y-2">
                                                    {solution.benefits.slice(0, 3).map((benefit, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <Check size={14} className="mt-1 text-metarh-medium shrink-0" />
                                                            <span className="leading-relaxed text-gray-600 font-medium">{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Blog Content Section */}
                    <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-t-2 border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-metarh-medium" size={24} />
                                <h3 className="text-2xl font-bold text-metarh-dark">Conteúdos do Blog</h3>
                            </div>
                            <a
                                href="https://metarh.com.br/metarhnews/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-metarh-medium hover:underline flex items-center gap-1"
                            >
                                Ver todos os conteúdos <ExternalLink size={14} />
                            </a>
                        </div>

                        {isLoadingBlog ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-metarh-medium" size={32} />
                                <span className="ml-3 text-gray-500">Carregando posts...</span>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Topo - Aprendizado */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-metarh-dark flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                        Topo de Funil
                                        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                            {blogPosts.topo.total} conteúdos
                                        </span>
                                    </h4>

                                    <div className="flex overflow-x-auto snap-x gap-4 pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                        {blogPosts.topo.posts.length > 0 ? (
                                            blogPosts.topo.posts.map((post) => (
                                                <a
                                                    key={post.id}
                                                    href={post.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="snap-start shrink-0 w-[280px] p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group flex flex-col h-full"
                                                >
                                                    <h5 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors text-sm line-clamp-2">
                                                        <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                                    </h5>
                                                    <p className="text-xs text-gray-500 line-clamp-3 flex-1" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                                                </a>
                                            ))
                                        ) : (
                                            <div className="w-full p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center h-32 flex flex-col items-center justify-center">
                                                <p className="text-sm text-gray-400 font-medium">Nenhum conteúdo</p>
                                                <p className="text-xs text-gray-300 mt-1">Topo de funil zerado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Meio - Descoberta */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-metarh-dark flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                        Meio de Funil
                                        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                            {blogPosts.meio.total} conteúdos
                                        </span>
                                    </h4>

                                    <div className="flex overflow-x-auto snap-x gap-4 pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                        {blogPosts.meio.posts.length > 0 ? (
                                            blogPosts.meio.posts.map((post) => (
                                                <a
                                                    key={post.id}
                                                    href={post.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="snap-start shrink-0 w-[280px] p-4 bg-white border border-gray-200 rounded-xl hover:border-yellow-300 hover:shadow-md transition-all group flex flex-col h-full"
                                                >
                                                    <h5 className="font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors text-sm line-clamp-2">
                                                        <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                                    </h5>
                                                    <p className="text-xs text-gray-500 line-clamp-3 flex-1" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                                                </a>
                                            ))
                                        ) : (
                                            <div className="w-full p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center h-32 flex flex-col items-center justify-center">
                                                <p className="text-sm text-gray-400 font-medium">Nenhum conteúdo</p>
                                                <p className="text-xs text-gray-300 mt-1">Meio de funil zerado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Fundo - Decisão */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-bold text-metarh-dark flex items-center gap-2 border-b border-gray-200 pb-2">
                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                        Fundo de Funil
                                        <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                            {blogPosts.fundo.total} conteúdos
                                        </span>
                                    </h4>

                                    <div className="flex overflow-x-auto snap-x gap-4 pb-4 -mx-2 px-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                        {blogPosts.fundo.posts.length > 0 ? (
                                            blogPosts.fundo.posts.map((post) => (
                                                <a
                                                    key={post.id}
                                                    href={post.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="snap-start shrink-0 w-[280px] p-4 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all group flex flex-col h-full"
                                                >
                                                    <h5 className="font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors text-sm line-clamp-2">
                                                        <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                                    </h5>
                                                    <p className="text-xs text-gray-500 line-clamp-3 flex-1" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                                                </a>
                                            ))
                                        ) : (
                                            <div className="w-full p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center h-32 flex flex-col items-center justify-center">
                                                <p className="text-sm text-gray-400 font-medium">Nenhum conteúdo</p>
                                                <p className="text-xs text-gray-300 mt-1">Fundo de funil zerado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-12"></div> {/* Spacer for scroll */}
                </div>
            </div>
        </div>
    );
};
