const fetch = require('node-fetch');

const WP_CONFIG = {
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

async function testFetch(solutionPackage, funnelStage) {
    const categoryId = WP_CONFIG.categories[solutionPackage];
    const stageId = WP_CONFIG.funnelStages[funnelStage];

    console.log(`Testing fetch for ${solutionPackage} (${categoryId}) + ${funnelStage} (${stageId})`);

    // Test 1: Fetch by Category only
    const urlCat = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId}&per_page=1`;
    try {
        const resCat = await fetch(urlCat);
        const dataCat = await resCat.json();
        console.log(`Posts with Category ${categoryId}: ${dataCat.length}`);
    } catch (e) {
        console.error(`Error fetching category ${categoryId}:`, e.message);
    }

    // Test 2: Fetch by Stage only (assuming it's a category based on user input, but could be a tag)
    // The user said "criei lá as seguintes por funil", implying they might be categories too since they gave IDs in the same list format.
    // Let's try fetching as category.
    const urlStage = `${WP_CONFIG.baseUrl}/posts?categories=${stageId}&per_page=1`;
    try {
        const resStage = await fetch(urlStage);
        const dataStage = await resStage.json();
        console.log(`Posts with Stage ${stageId}: ${dataStage.length}`);
    } catch (e) {
        console.error(`Error fetching stage ${stageId}:`, e.message);
    }

    // Test 3: Fetch Combined (The logic used in the app)
    const urlCombined = `${WP_CONFIG.baseUrl}/posts?categories=${categoryId},${stageId}&per_page=3&_embed`;
    console.log(`Combined URL: ${urlCombined}`);
    try {
        const resCombined = await fetch(urlCombined);
        const dataCombined = await resCombined.json();
        console.log(`Combined Result Count: ${dataCombined.length}`);
        if (dataCombined.length > 0) {
            console.log('First post title:', dataCombined[0].title.rendered);
        }
    } catch (e) {
        console.error('Error fetching combined:', e.message);
    }
}

// Run test for Business + Topo
testFetch('Business', 'topo');
