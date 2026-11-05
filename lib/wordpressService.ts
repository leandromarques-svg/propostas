// WordPress API Configuration
export const WP_CONFIG = {
  baseUrl: 'https://metarh.com.br/metarhnews/wp-json/wp/v2',
  categories: {
    'Business': 128,
    'Pharma Recruiter': 155,
    'Staffing': 118,
    'Talent': 129,
    'Tech Recruiter': 123,
    'Trilhando +': 162,
    'Varejo Pro': 157
  },
  funnelStages: {
    'topo': 164, // Aprendizado & Descoberta
    'meio': 163, // Consideração & Reconhecimento do Problema
    'fundo': 165 // Decisão de Compra & Contratação
  }
};

export interface BlogPost {
  id: number;
  title: { rendered: string };
  link: string;
  excerpt: { rendered: string };
  date: string;
  categories: number[];
  _embedded?: any;
}

export interface EnrichedBlogPost {
  id: number;
  title: string;
  link: string;
  excerpt: string;
  date: string;
  funnelStage: 'topo' | 'meio' | 'fundo';
}

export const getBlogPosts = async (
  solutionPackage: string,
  funnelStage: 'topo' | 'meio' | 'fundo'
): Promise<{ posts: any[]; total: number }> => {
  const result = await getBlogPostsForPackage(solutionPackage);
  const posts = result[funnelStage].map(p => ({
    id: p.id,
    title: { rendered: p.title },
    link: p.link,
    excerpt: { rendered: p.excerpt },
    date: p.date,
    categories: []
  }));
  return { posts, total: posts.length };
};

const memoryCache = new Map<string, EnrichedBlogPost[]>();

export const getBlogPostsForPackage = async (
  solutionPackage: string
): Promise<{
  all: EnrichedBlogPost[];
  topo: EnrichedBlogPost[];
  meio: EnrichedBlogPost[];
  fundo: EnrichedBlogPost[];
}> => {
  const categoryId = WP_CONFIG.categories[solutionPackage as keyof typeof WP_CONFIG.categories];

  if (!categoryId) {
    return { all: [], topo: [], meio: [], fundo: [] };
  }

  const cacheKey = `pkg_${categoryId}`;
  if (memoryCache.has(cacheKey)) {
    const cached = memoryCache.get(cacheKey)!;
    return categorizePosts(cached);
  }

  try {
    const url = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId}&per_page=30&_embed`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const rawPosts: BlogPost[] = await res.json();
    const enriched: EnrichedBlogPost[] = rawPosts.map((p) => {
      let stage: 'topo' | 'meio' | 'fundo' = 'meio';
      if (p.categories.includes(WP_CONFIG.funnelStages.topo)) {
        stage = 'topo';
      } else if (p.categories.includes(WP_CONFIG.funnelStages.fundo)) {
        stage = 'fundo';
      } else if (p.categories.includes(WP_CONFIG.funnelStages.meio)) {
        stage = 'meio';
      }

      // Clean HTML from title and excerpt
      const cleanTitle = p.title?.rendered
        ? p.title.rendered.replace(/&#8211;/g, '–').replace(/&#8220;|&#8221;/g, '"').replace(/&#8217;/g, "'").replace(/&amp;/g, '&')
        : 'Artigo METARH';

      const cleanExcerpt = p.excerpt?.rendered
        ? p.excerpt.rendered.replace(/<[^>]*>/g, '').trim()
        : '';

      return {
        id: p.id,
        title: cleanTitle,
        link: p.link,
        excerpt: cleanExcerpt,
        date: p.date,
        funnelStage: stage
      };
    });

    memoryCache.set(cacheKey, enriched);
    return categorizePosts(enriched);
  } catch (err) {
    console.error(`[WordPress] Falha ao buscar posts para ${solutionPackage}:`, err);
    return { all: [], topo: [], meio: [], fundo: [] };
  }
};

function categorizePosts(posts: EnrichedBlogPost[]) {
  return {
    all: posts,
    topo: posts.filter(p => p.funnelStage === 'topo'),
    meio: posts.filter(p => p.funnelStage === 'meio'),
    fundo: posts.filter(p => p.funnelStage === 'fundo')
  };
}

export const getFunnelStageInfo = (stage: 'topo' | 'meio' | 'fundo') => {
  switch (stage) {
    case 'topo':
      return {
        label: 'Topo de Funil',
        stageName: 'Aprendizado & Descoberta',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        badge: 'bg-blue-600 text-white',
        description: 'Conteúdos para clientes que estão diagnosticando necessidades e conhecendo o mercado.'
      };
    case 'meio':
      return {
        label: 'Meio de Funil',
        stageName: 'Reconhecimento & Consideração',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        badge: 'bg-metarh-medium text-white',
        description: 'Conteúdos focados no problema específico e na avaliação de soluções de RH.'
      };
    case 'fundo':
      return {
        label: 'Fundo de Funil',
        stageName: 'Decisão de Compra',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        badge: 'bg-emerald-600 text-white',
        description: 'Conteúdos decisivos para validação de contratação, segurança operacional e ROI.'
      };
  }
};
