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

        console.log(`[WordPress] Fetching posts for ${solutionPackage} (ID: ${categoryId}) + ${funnelStage} (ID: ${stageId})`);

        if (!categoryId || !stageId) {
            console.warn(`[WordPress] Missing WordPress ID configuration for ${solutionPackage} or ${funnelStage}`);
            return [];
        }

        // Fetch posts from the Solution Category
        // We fetch more posts (20) to increase the chance of finding intersections, 
        // since the API does OR logic for multiple categories.
        // Strategy: Fetch by Solution Category, then filter by Funnel Stage.
        const url = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId}&per_page=20&_embed`;
        console.log(`[WordPress] API URL: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[WordPress] API request failed with status ${response.status}`);
            throw new Error('Failed to fetch posts');
        }

        const posts: BlogPost[] = await response.json();
        console.log(`[WordPress] Received ${posts.length} posts from category ${categoryId}`);
        console.log(`[WordPress] First post categories:`, posts[0]?.categories);

        // Client-side filtering to ensure strict AND logic
        // We want posts that have BOTH categoryId AND stageId
        const filteredPosts = posts.filter((post: BlogPost) => {
            const hasStage = post.categories && post.categories.includes(stageId);
            console.log(`[WordPress] Post "${post.title.rendered}" has stage ${stageId}?`, hasStage, 'Categories:', post.categories);
            return hasStage;
        });

        console.log(`[WordPress] Filtered to ${filteredPosts.length} posts with both categories`);

        // Return top 3
        return filteredPosts.slice(0, 3);
    } catch (error) {
        console.error('[WordPress] Error fetching blog posts:', error);
        return [];
    }
};
