import { BLOG_POSTS_FALLBACK } from './blogPostsFallback';

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

// Memory cache seeded with fallback snapshot so posts are instantly available
const memoryCache = new Map<string, EnrichedBlogPost[]>();

// Initialize memoryCache with the verified fallback snapshot
for (const [pkg, posts] of Object.entries(BLOG_POSTS_FALLBACK)) {
  const catId = WP_CONFIG.categories[pkg as keyof typeof WP_CONFIG.categories];
  if (catId) {
    memoryCache.set(`pkg_${catId}`, posts);
  }
}

function cleanHtmlText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Fetch blog posts with multi-strategy fallback:
 * 1. Checks memory cache (instantly seeded with verified articles)
 * 2. Tries same-origin proxy (/api/wp) which bypasses browser CORS on Vercel
 * 3. Tries direct WordPress API with cache-buster timestamp
 * 4. Falls back safely to verified static snapshot if network/CORS fails
 */
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
  const existingCached = memoryCache.get(cacheKey);

  // Attempt live refresh in background/async
  try {
    let rawPosts: BlogPost[] | null = null;

    // Strategy 1: Same-origin proxy (configured in vercel.json and vite.config.ts)
    try {
      const proxyUrl = `/api/wp/posts?categories=${categoryId}&per_page=100`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          rawPosts = data;
        }
      }
    } catch {}

    // Strategy 2: Direct WordPress endpoint with cache-busting to bypass stale CDN CORS headers
    if (!rawPosts) {
      try {
        const directUrl = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId}&per_page=100&_cb=${Date.now()}`;
        const res = await fetch(directUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            rawPosts = data;
          }
        }
      } catch {}
    }

    if (rawPosts && Array.isArray(rawPosts) && rawPosts.length > 0) {
      const enriched: EnrichedBlogPost[] = rawPosts.map((p) => {
        let stage: 'topo' | 'meio' | 'fundo' = 'meio';
        if (p.categories.includes(WP_CONFIG.funnelStages.topo) || p.categories.includes(132)) {
          stage = 'topo';
        } else if (p.categories.includes(WP_CONFIG.funnelStages.fundo)) {
          stage = 'fundo';
        } else if (p.categories.includes(WP_CONFIG.funnelStages.meio)) {
          stage = 'meio';
        }

        const cleanTitle = p.title?.rendered ? cleanHtmlText(p.title.rendered) : 'Artigo METARH';
        const cleanExcerpt = p.excerpt?.rendered ? cleanHtmlText(p.excerpt.rendered) : '';

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
    }
  } catch (err) {
    console.warn(`[WordPress] Usando base consolidada para ${solutionPackage}:`, err);
  }

  // If live fetch returned nothing or threw, use cached/fallback data
  if (existingCached && existingCached.length > 0) {
    return categorizePosts(existingCached);
  }

  const fallback = BLOG_POSTS_FALLBACK[solutionPackage] || [];
  return categorizePosts(fallback);
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
