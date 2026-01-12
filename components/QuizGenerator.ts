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

export const generateQuiz = (solutions: SolutionData[], count: number = 5): Question[] => {
    const questions: Question[] = [];
    const safeSolutions = [...solutions].filter(s => s.description && s.name !== 'Não se Aplica');

    for (let i = 0; i < count; i++) {
        // Pick a random target solution
        const target = safeSolutions[Math.floor(Math.random() * safeSolutions.length)];
        const others = safeSolutions.filter(s => s.id !== target.id);

        // Randomize question type
        const typeRoll = Math.random();
        let type: Question['type'] = 'description';
        let questionText = '';
        let correctAnswer = target.name;
        let explanation = '';

        if (typeRoll < 0.4 && target.benefits.length > 0) {
            type = 'benefit';
            const benefit = target.benefits[Math.floor(Math.random() * target.benefits.length)];
            questionText = `Qual solução oferece o seguinte benefício?\n"${benefit}"`;
            explanation = `A solução **${target.name}** tem como benefício: ${benefit}`;
        } else if (typeRoll < 0.7 && target.toolsUsed.length > 0 && target.toolsUsed[0] !== 'Não se aplica') {
            type = 'tool';
            const tool = target.toolsUsed[Math.floor(Math.random() * target.toolsUsed.length)];
            questionText = `Em qual solução a ferramenta "${tool}" é frequentemente utilizada?`;
            explanation = `A ferramenta **${tool}** é parte do processo de **${target.name}**.`;
        } else {
            type = 'description';
            questionText = `Identifique a solução com base na descrição:\n"${target.description}"`;
            explanation = `Essa é a descrição oficial da solução **${target.name}**.`;
        }

        // Generate distractors
        const distractors = SHUFFLE(others).slice(0, 3).map(s => s.name);
        const options = SHUFFLE([correctAnswer, ...distractors]);

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
