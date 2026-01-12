import { SolutionData } from '../types';

export interface Question {
    id: string;
    type: 'benefit' | 'tool' | 'description' | 'need';
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

        // Prepare distractors
        let distractorPool = pool.length >= 4 ? pool : solutions.filter(s => s.name !== 'Não se Aplica');
        distractorPool = distractorPool.filter(s => s.id !== target.id);

        // Randomize question type
        // Attempts to find a valid question type for this specific target
        let validTypes: Question['type'][] = [];
        if (target.benefits.length > 0) validTypes.push('benefit');
        if (target.toolsUsed.length > 0 && target.toolsUsed[0] !== 'Não se aplica') validTypes.push('tool');
        if (target.publicNeeds.length > 0) validTypes.push('need');
        validTypes.push('description'); // Always available

        const chosenType = validTypes[Math.floor(Math.random() * validTypes.length)];

        let type: Question['type'] = chosenType;
        let questionText = '';
        let correctAnswer = target.name;
        let explanation = '';

        if (chosenType === 'benefit') {
            const benefit = target.benefits[Math.floor(Math.random() * target.benefits.length)];
            questionText = `Qual serviço oferece este benefício?\n"${benefit}"`;
            explanation = `Correto! O serviço **${target.name}** traz exatamente isso.\n\n*Resumo:* ${target.description.split('.')[0]}.`;
        }
        else if (chosenType === 'tool') {
            const tool = target.toolsUsed[Math.floor(Math.random() * target.toolsUsed.length)];
            questionText = `Em qual serviço a ferramenta "${tool}" é fundamental?`;
            explanation = `Isso aí! A ferramenta **${tool}** é chave no processo de **${target.name}** para garantir a entrega.`;
        }
        else if (chosenType === 'need') {
            // New type: Need/Pain Point
            const need = target.publicNeeds[Math.floor(Math.random() * target.publicNeeds.length)];
            questionText = `Qual solução é ideal para resolver esta dor/necessidade?\n"${need}"`;
            explanation = `Exato! **${target.name}** é a solução indicada para quando "${need}".\n\n*Saiba mais:* ${target.aboutSolution || target.description}`;
        }
        else {
            questionText = `Identifique o serviço com base na descrição:\n"${target.description}"`;
            explanation = `Essa é a definição de **${target.name}** (${target.solutionPackage}).\n\nEla atende principalmente: ${target.publicNeeds.slice(0, 2).join(', ')}.`;
        }

        // Generate distractors (3 unique wrong answers)
        const wrongOptions = SHUFFLE(distractorPool).slice(0, 3).map(s => s.name);

        // Ensure we don't have duplicates in options
        const uniqueOptions = Array.from(new Set([...wrongOptions, correctAnswer]));
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
