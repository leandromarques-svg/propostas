// WordPress API Configuration
const WP_CONFIG = {
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

export const getBlogPosts = async (solutionPackage: string, funnelStage: 'topo' | 'meio' | 'fundo'): Promise<{ posts: BlogPost[], total: number }> => {
    try {
        const categoryId = WP_CONFIG.categories[solutionPackage as keyof typeof WP_CONFIG.categories];
        const stageId = WP_CONFIG.funnelStages[funnelStage];

        console.log(`[WordPress] Fetching posts for ${solutionPackage} (ID: ${categoryId}) + ${funnelStage} (ID: ${stageId})`);

        if (!categoryId || !stageId) {
            console.warn(`[WordPress] Missing WordPress ID configuration for ${solutionPackage} or ${funnelStage}`);
            return { posts: [], total: 0 };
        }

        // Fetch posts from the Solution Category
        const url = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId}&per_page=20&_embed`;
        console.log(`[WordPress] API URL: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[WordPress] API request failed with status ${response.status}`);
            throw new Error('Failed to fetch posts');
        }

        const posts: any[] = await response.json();
        console.log(`[WordPress] Received ${posts.length} posts from category ${categoryId}`);

        // Client-side filtering
        const filteredPosts = posts.filter((post: any) => {
            const postCategories = post.categories || [];
            return postCategories.includes(stageId);
        });

        console.log(`[WordPress] Filtered to ${filteredPosts.length} posts with both categories`);

        // Return all filtered posts and total count
        return {
            posts: filteredPosts,
            total: filteredPosts.length
        };
    } catch (error) {
        console.error('[WordPress] Error fetching blog posts:', error);
        return { posts: [], total: 0 };
    }
};
