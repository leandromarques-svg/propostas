import { SolutionData } from '../../types';

export interface BlogPost {
    id: number;
    date: string;
    title: {
        rendered: string;
    };
    link: string;
    excerpt: {
        rendered: string;
    };
    categories: number[];
}

export interface FunnelCounts {
    topo: number;
    meio: number;
    fundo: number;
}

const API_URL = 'https://metarh.com.br/metarhnews/wp-json/wp/v2';

// Category IDs mapping
export const CATEGORY_IDS = {
    business: 128,
    pharma: 155,
    staffing: 118,
    talent: 129,
    tech: 123,
    trilhando: 162,
    varejo: 157,
    // Funnel
    topo: 164,
    meio: 163,
    fundo: 165
};

export const getPostsByCategory = async (categoryId: number): Promise<BlogPost[]> => {
    try {
        const response = await fetch(`${API_URL}/posts?categories=${categoryId}&per_page=100`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
};

export const getFunnelCounts = (posts: BlogPost[]): FunnelCounts => {
    return {
        topo: posts.filter(p => p.categories.includes(CATEGORY_IDS.topo)).length,
        meio: posts.filter(p => p.categories.includes(CATEGORY_IDS.meio)).length,
        fundo: posts.filter(p => p.categories.includes(CATEGORY_IDS.fundo)).length
    };
};

export const getSolutionCategoryId = (solutionName: string): number | null => {
    const lowerName = solutionName.toLowerCase();
    if (lowerName.includes('business')) return CATEGORY_IDS.business;
    if (lowerName.includes('pharma')) return CATEGORY_IDS.pharma;
    if (lowerName.includes('staffing')) return CATEGORY_IDS.staffing;
    if (lowerName.includes('talent')) return CATEGORY_IDS.talent;
    if (lowerName.includes('tech')) return CATEGORY_IDS.tech;
    if (lowerName.includes('trilhando')) return CATEGORY_IDS.trilhando;
    if (lowerName.includes('varejo')) return CATEGORY_IDS.varejo;
    return null;
};
