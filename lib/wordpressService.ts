// Configuration for WordPress Categories/Tags IDs
export const WP_CONFIG = {
    baseUrl: 'https://metarh.com.br/wp-json/wp/v2',
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
        'topo': 164, // Aprendizado
        'meio': 163, // Descoberta
        'fundo': 165 // Decisão
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

export const getBlogPosts = async (solutionPackage: string, funnelStage: 'topo' | 'meio' | 'fundo'): Promise<BlogPost[]> => {
    try {
        const categoryId = WP_CONFIG.categories[solutionPackage as keyof typeof WP_CONFIG.categories];
        const stageId = WP_CONFIG.funnelStages[funnelStage];

        if (!categoryId || !stageId) {
            console.warn(`Missing WordPress ID configuration for ${solutionPackage} or ${funnelStage}`);
            return [];
        }

        // Fetch posts from the Solution Category
        // We fetch more posts (20) to increase the chance of finding intersections, 
        // since the API does OR logic for multiple categories.
        // Strategy: Fetch by Solution Category, then filter by Funnel Stage.
        const url = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId}&per_page=20&_embed`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch posts');

        const posts: BlogPost[] = await response.json();

        // Client-side filtering to ensure strict AND logic
        // We want posts that have BOTH categoryId AND stageId
        const filteredPosts = posts.filter((post: BlogPost) => {
            return post.categories && post.categories.includes(stageId);
        });

        // Return top 3
        return filteredPosts.slice(0, 3);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
};
