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

        // console.log(`[WordPress] Fetching posts for ${solutionPackage} (ID: ${categoryId}) + ${funnelStage} (ID: ${stageId})`);

        if (!categoryId || !stageId) {
            console.warn(`[WordPress] Missing WordPress ID configuration for ${solutionPackage} or ${funnelStage}`);
            return { posts: [], total: 0 };
        }

        // Fetch posts for the SPECIFIC SOLUTION only (narrower set).
        // Then we filter locally for the funnel stage.
        // Fetching by 'categories=A,B' (OR logic) causes the response to be flooded by the broad funnel category,
        // pushing the specific solution posts out of the page limit.
        const url = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId}&per_page=40&_embed`;
        // console.log(`[WordPress] API URL: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[WordPress] API request failed with status ${response.status}`);
            throw new Error('Failed to fetch posts');
        }

        const posts: any[] = await response.json();
        // console.log(`[WordPress] Received ${posts.length} posts for solution ${solutionPackage}`);

        // Filter: Ensure the post also belongs to the requested funnel stage
        const filteredPosts = posts.filter((post: any) => {
            const postCategories = post.categories || [];
            return postCategories.includes(stageId);
        });

        // console.log(`[WordPress] After filtering for ${funnelStage} (ID: ${stageId}): ${filteredPosts.length} posts`);

        return {
            posts: filteredPosts.slice(0, 6), // Limit to 6 posts for display
            total: filteredPosts.length
        };
    } catch (error) {
        console.error('[WordPress] Error fetching blog posts:', error);
        return { posts: [], total: 0 };
    }
};
