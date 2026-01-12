import React, { useState, useEffect } from 'react';
import { User, QuizResult, SolutionData } from '../types';
import { SOLUTIONS_DATA } from '../constants';
import { generateQuiz, Question } from './QuizGenerator';
import { Trophy, CheckCircle, XCircle, Brain, ArrowRight, Play, RotateCcw, Save, Briefcase, Stethoscope, Users, Star, Cpu, Map, Store, Layers, Flame, Medal } from 'lucide-react';
import { saveUser } from './lib/userService';

// Helper for Icons
const PackageIcon: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className, size }) => {
    switch (name) {
        case 'Business': return <Briefcase className={className} size={size} />;
        case 'Pharma Recruiter': return <Stethoscope className={className} size={size} />;
        case 'Staffing': return <Users className={className} size={size} />;
        case 'Talent': return <Star className={className} size={size} />;
        case 'Tech Recruiter': return <Cpu className={className} size={size} />;
        case 'Trilhando +': return <Map className={className} size={size} />;
        case 'Varejo Pro': return <Store className={className} size={size} />;
        default: return <Layers className={className} size={size} />;
    }
};
interface QuizViewProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onBack: () => void;
}

type QuizState = 'intro' | 'playing' | 'result';


export const QuizView: React.FC<QuizViewProps> = ({ user, onUpdateUser, onBack }) => {
    const [gameState, setGameState] = useState<QuizState>('intro');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [topicsToReview, setTopicsToReview] = useState<string[]>([]);
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [history, setHistory] = useState<QuizResult[]>(user.quizHistory || []);
    // New state for mode selection
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null); // null = 'Geral'


    const startQuiz = (pkgFilter: string | null) => {
        setSelectedPackage(pkgFilter);
        // Mixed mode gets 10 questions, specific gets 5
        const questionCount = pkgFilter ? 5 : 10;
        const newQuestions = generateQuiz(SOLUTIONS_DATA, questionCount, pkgFilter);
        setQuestions(newQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setTopicsToReview([]);
        setGameState('playing');
        setIsAnswered(false);
        setSelectedOption(null);
    };

    const handleAnswer = (option: string) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const currentQ = questions[currentQuestionIndex];
        const isCorrect = option === currentQ.correctAnswer;

        if (isCorrect) {
            // Mixed mode gets double points (200), specific gets normal (100)
            const points = selectedPackage ? 100 : 200;
            setScore(s => s + points);
            setFeedbackMessage(selectedPackage ? 'Correto! Mandou bem.' : 'Excelente! Pontuação dupla no desafio!');
        } else {
            setFeedbackMessage(`Ops! A resposta certa era: ${currentQ.correctAnswer}`);
            // Add topic to review list if unique
            const relatedSol = SOLUTIONS_DATA.find(s => s.id === currentQ.relatedSolutionId);
            if (relatedSol && !topicsToReview.includes(relatedSol.name)) {
                setTopicsToReview(prev => [...prev, relatedSol.name]);
            }
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setIsAnswered(false);
            setSelectedOption(null);
            setFeedbackMessage('');
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async () => {
        setGameState('result');
        const finalScore = score; // Use current score state

        const result: QuizResult = {
            id: `quiz-${Date.now()}`,
            date: new Date().toISOString(),
            score: finalScore,
            totalQuestions: questions.length,
            topicsToReview
        };

        const newHistory = [result, ...history];
        setHistory(newHistory); // Update local state immediately

        // Persist to user profile
        const updatedUser = { ...user, quizHistory: newHistory };
        onUpdateUser(updatedUser);

        // Fire and forget save
        await saveUser(updatedUser);
    };

    // --- RENDERERS ---

    if (gameState === 'intro') {
        const bestScore = history.reduce((max, h) => Math.max(max, h.score), 0);
        const totalGames = history.length;

        // Get unique packages for selection
        const packages = Array.from(new Set(SOLUTIONS_DATA.map(s => s.solutionPackage))).sort();

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 min-h-[600px] font-barlow">
                <div className="max-w-4xl w-full bg-white rounded-[3rem] p-12 shadow-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center animate-bounce">
                            <Brain size={48} className="text-purple-600" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-800 mb-4 font-barlow">Desafio de Serviços METARH</h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                        Teste seus conhecimentos, ganhe pontos e domine nossas soluções! Escolha um modo para começar:
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-10 max-w-md mx-auto">
                        <div className="bg-purple-50 rounded-2xl p-4">
                            <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">Recorde</p>
                            <p className="text-3xl font-bold text-gray-800">{bestScore}</p>
                        </div>
                        <div className="bg-pink-50 rounded-2xl p-4">
                            <p className="text-sm text-pink-600 font-bold uppercase tracking-wider">Jogos</p>
                            <p className="text-3xl font-bold text-gray-800">{totalGames}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-700 mb-6 font-barlow">Escolha o seu desafio:</h3>

                        <div className="flex flex-col gap-8">
                            {/* Hard Mode / Mixed */}
                            <div className="bg-gradient-to-r from-gray-900 to-purple-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer border-2 border-transparent hover:border-yellow-400" onClick={() => startQuiz(null)}>
                                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                    <div className="bg-yellow-400/20 p-6 rounded-full">
                                        <Flame size={48} className="text-yellow-400 animate-pulse" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-2xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                                            Desafio Supremo <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded font-bold uppercase">Hard Mode</span>
                                        </h4>
                                        <p className="text-purple-200 mb-2">Todas as soluções misturadas. 10 perguntas. Pontuação Dupla.</p>
                                        <p className="text-yellow-300 font-bold text-sm italic">"Só joga esse quem não tem medo de desafios!"</p>
                                    </div>
                                    <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all whitespace-nowrap">
                                        Aceitar Desafio
                                    </button>
                                </div>
                            </div>

                            {/* Specific Solutions Grid */}
                            <div>
                                <h4 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider text-center md:text-left">Treinar Solução Específica</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {packages.map(pkg => (
                                        <button
                                            key={pkg}
                                            onClick={() => startQuiz(pkg)}
                                            className="p-6 rounded-2xl border-2 border-gray-100 hover:border-metarh-medium/50 hover:bg-purple-50 hover:shadow-lg transition-all group flex flex-col items-center gap-4 bg-white"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-metarh-medium group-hover:text-white flex items-center justify-center transition-colors">
                                                <PackageIcon name={pkg} size={24} />
                                            </div>
                                            <span className="font-bold text-gray-700 group-hover:text-metarh-medium text-center leading-tight">{pkg}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        const currentQ = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / questions.length) * 100;


        return (
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 font-barlow">
                <div className="w-full max-w-3xl">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm font-bold text-gray-400">QUESTÃO {currentQuestionIndex + 1}/{questions.length}</div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Trophy size={16} className="text-yellow-500" />
                            <span className="font-bold text-gray-800">{score} pts</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
                        <div
                            className="h-full bg-purple-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-8 relative">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
                            {currentQ.questionText}
                        </h2>

                        <div className="space-y-4">
                            {currentQ.options.map((option, idx) => {
                                let btnClass = "w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex justify-between items-center group ";

                                if (isAnswered) {
                                    if (option === currentQ.correctAnswer) {
                                        btnClass += "border-green-500 bg-green-50 text-green-700";
                                    } else if (option === selectedOption) {
                                        btnClass += "border-red-500 bg-red-50 text-red-700";
                                    } else {
                                        btnClass += "border-gray-100 text-gray-400 opacity-60";
                                    }
                                } else {
                                    btnClass += "border-gray-100 hover:border-purple-300 hover:bg-purple-50 text-gray-700";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered}
                                        className={btnClass}
                                    >
                                        <span>{option}</span>
                                        {isAnswered && option === currentQ.correctAnswer && <CheckCircle size={20} className="text-green-600" />}
                                        {isAnswered && option === selectedOption && option !== currentQ.correctAnswer && <XCircle size={20} className="text-red-600" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Feedback & Next Button */}
                        {isAnswered && (
                            <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div>
                                        <p className={`font-bold text-lg ${selectedOption === currentQ.correctAnswer ? 'text-green-600' : 'text-red-500'}`}>
                                            {feedbackMessage}
                                        </p>
                                        <div className="text-gray-600 text-sm mt-2 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            {currentQ.explanation.split('\n').map((line, i) => (
                                                <p key={i} className="mb-1">
                                                    {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                                                        part.startsWith('**') && part.endsWith('**')
                                                            ? <strong key={j} className="text-gray-800">{part.slice(2, -2)}</strong>
                                                            : part
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={nextQuestion}
                                        className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Ver Resultado'} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Result State
    if (gameState === 'result') {
        const isMixedMode = selectedPackage === null;
        // Determine "Win" condition: 60% standard
        const totalPossibleScore = questions.length * (isMixedMode ? 200 : 100);
        const percentage = (score / totalPossibleScore) * 100;
        const isWin = percentage >= 60;

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 min-h-[600px] font-barlow">
                <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 shadow-xl text-center">

                    <div className="mb-6 inline-block">
                        {isWin ? (
                            <div className="p-6 bg-yellow-100 rounded-full animate-bounce">
                                <Trophy size={64} className="text-yellow-600" />
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-100 rounded-full">
                                <Brain size={64} className="text-gray-500" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-4xl font-bold text-gray-800 mb-2">
                        {isWin ? (isMixedMode ? 'Lendário! Você destruiu!' : 'Mandou muito bem!') : 'Bom esforço!'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Você completou o quiz. Confira seu desempenho abaixo.
                    </p>

                    <div className="text-6xl font-black text-purple-600 mb-2 tracking-tight">
                        {score}
                        <span className="text-2xl text-gray-400 font-medium ml-2">pts</span>
                    </div>
                    {isMixedMode && <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full mb-8">PONTUAÇÃO DOBRADA</div>}

                    <p className="text-gray-400 uppercase font-bold tracking-widest text-sm mb-12">Pontuação Final ({percentage.toFixed(0)}%)</p>

                    {topicsToReview.length > 0 && (
                        <div className="bg-orange-50 rounded-2xl p-6 mb-8 text-left border border-orange-100">
                            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                                <Brain size={18} /> Sugestões de Estudo:
                            </h3>
                            <p className="text-sm text-orange-700 mb-3">Notamos que você pode aprofundar seu conhecimento nestas soluções:</p>
                            <div className="flex flex-wrap gap-2">
                                {topicsToReview.map(topic => (
                                    <span key={topic} className="bg-white text-orange-600 px-3 py-1 rounded-lg text-sm font-medium border border-orange-200">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onBack}
                            className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            Voltar ao Catálogo
                        </button>
                        <button
                            onClick={() => startQuiz(selectedPackage)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:bg-purple-700 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <RotateCcw size={18} /> Jogar Novamente
                        </button>
                    </div>

                </div>
            </div>
        );
    }

    return null;
};
