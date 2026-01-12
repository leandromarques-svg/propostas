import { SolutionData } from '../types';

export interface Question {
    id: string;
    type: 'benefit' | 'tool' | 'description';
    questionText: string;
    options: string[]; // List of potential answers (strings)
    correctAnswer: string;
    explanation: string;
    relatedSolutionId: string;
}

const SHUFFLE = (array: any[]) => array.sort(() => Math.random() - 0.5);

/**
 * 
 * @param solutions All available solutions
 * @param count Number of questions to generate
 * @param packageFilter Optional: filter by solutionPackage (e.g. 'Business', 'Staffing')
 * @returns 
 */
export const generateQuiz = (solutions: SolutionData[], count: number = 5, packageFilter?: string | null): Question[] => {
    const questions: Question[] = [];

    // 1. Filter solutions (exclude "N/A" ones if any, and apply package filter)
    let pool = [...solutions].filter(s => s.description && s.name !== 'Não se Aplica');
    if (packageFilter) {
        pool = pool.filter(s => s.solutionPackage === packageFilter);
    }

    // If pool is smaller than count, we might have repeats, but let's try to avoid it first.
    // We'll clone list to 'available' to pick from without replacement
    let available = [...pool];

    for (let i = 0; i < count; i++) {
        // If we ran out of unique solutions, reset the pool (rare, but possible if filter has few items)
        if (available.length === 0) {
            available = [...pool];
        }

        // Pick random index
        const randomIndex = Math.floor(Math.random() * available.length);
        const target = available[randomIndex];

        // Remove from available so we don't pick this exact solution again in this run
        available.splice(randomIndex, 1);

        // Prepare distractors: MUST be from the same filtered pool ideally, or at least from the whole list?
        // User complaint: options repeating. 
        // We should pick distractors from the *whole* pool (even outside filter? No, usually inside is harder, but outside is fair too. 
        // Let's pick from the whole safeSolutions list to ensure variety, unless we want strict context.)
        // Logic: If I am testing "Business", distractors should ideally be other solutions, 
        // but maybe mixed is better for difficulty? 
        // Let's use the 'pool' (filtered) for distractors if large enough (>=4), otherwise expand to all solutions.
        let distractorPool = pool.length >= 4 ? pool : solutions.filter(s => s.name !== 'Não se Aplica');

        // Remove target from distractor pool
        distractorPool = distractorPool.filter(s => s.id !== target.id);

        // Randomize question type
        const typeRoll = Math.random();
        let type: Question['type'] = 'description';
        let questionText = '';
        let correctAnswer = target.name;
        let explanation = '';

        // Attempts to find a valid question type for this specific target
        let validTypes = [];
        if (target.benefits.length > 0) validTypes.push('benefit');
        if (target.toolsUsed.length > 0 && target.toolsUsed[0] !== 'Não se aplica') validTypes.push('tool');
        validTypes.push('description'); // Always available

        const chosenType = validTypes[Math.floor(Math.random() * validTypes.length)];

        if (chosenType === 'benefit') {
            type = 'benefit';
            const benefit = target.benefits[Math.floor(Math.random() * target.benefits.length)];
            questionText = `Qual serviço oferece o seguinte benefício?\n"${benefit}"`;
            explanation = `O serviço **${target.name}** (${target.solutionPackage}) tem como benefício: ${benefit}`;
        } else if (chosenType === 'tool') {
            type = 'tool';
            const tool = target.toolsUsed[Math.floor(Math.random() * target.toolsUsed.length)];
            questionText = `Em qual serviço a ferramenta "${tool}" é frequentemente utilizada?`;
            explanation = `A ferramenta **${tool}** é parte do processo de **${target.name}**.`;
        } else {
            type = 'description';
            questionText = `Identifique o serviço com base na descrição:\n"${target.description}"`;
            explanation = `Essa é a descrição oficial do serviço **${target.name}**.`;
        }

        // Generate distractors (3 unique wrong answers)
        const wrongOptions = SHUFFLE(distractorPool).slice(0, 3).map(s => s.name);

        // Ensure we don't have duplicates in options (e.g. if names are similar, unlikely but good to be safe)
        const uniqueOptions = Array.from(new Set([...wrongOptions, correctAnswer]));

        // If for some reason we have fewer than 4 options (very small pool), that's life.
        const options = SHUFFLE(uniqueOptions);

        questions.push({
            id: `q-${Date.now()}-${i}`,
            type,
            questionText,
            options,
            correctAnswer,
            explanation,
            relatedSolutionId: target.id
        });
    }

    return questions;
};
