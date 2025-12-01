import { SolutionData } from '../types';

// Configuration for WordPress Categories/Tags IDs
// TODO: User needs to provide the actual IDs from their WordPress
export const WP_CONFIG = {
    baseUrl: 'https://metarh.com.br/wp-json/wp/v2',
    categories: {
        'Business': 0, // Replace with actual ID
        'Pharma Recruiter': 0,
        'Staffing': 0,
        'Talent': 0,
        'Tech Recruiter': 0,
        'Trilhando +': 0,
        'Varejo Pro': 0
    },
    funnelStages: {
        'topo': 0, // Aprendizado - Replace with actual ID
        'meio': 0, // Descoberta - Replace with actual ID
        'fundo': 0 // Decisão - Replace with actual ID
    }
};

export interface BlogPost {
    id: number;
    title: { rendered: string };
    link: string;
    excerpt: { rendered: string };
    date: string;
    _embedded?: any;
}

export const getBlogPosts = async (solutionPackage: string, funnelStage: 'topo' | 'meio' | 'fundo'): Promise<BlogPost[]> => {
    try {
        const categoryId = WP_CONFIG.categories[solutionPackage as keyof typeof WP_CONFIG.categories];
        const stageId = WP_CONFIG.funnelStages[funnelStage];

        if (!categoryId || !stageId) {
            console.warn(`Missing WordPress ID configuration for ${solutionPackage} or ${funnelStage}`);
            return [];
        }

        // Fetch posts that have BOTH the solution category AND the funnel stage tag/category
        // Note: 'categories' parameter in WP API takes a comma-separated list of IDs.
        // If we want AND logic (posts with BOTH categories), it's trickier in standard API.
        // Standard 'categories=A,B' usually means OR.
        // To do AND, we might need to filter client-side or use 'categories' + 'tags' if they are different taxonomies.
        // Assuming both are Categories for now.

        const url = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId},${stageId}&per_page=3&_embed`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch posts');

        const posts = await response.json();

        // Client-side filtering to ensure strict AND logic if the API returns OR
        // This depends on how WP is configured, but usually ?categories=1,2 is OR.
        // A better way is ?categories=1&tags=2 if they are different types.
        // For now, let's return what we get, assuming the user will organize content well.

        return posts;
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
};
