import React, { useState, useEffect } from 'react';
import { User, QuizResult, SolutionData } from '../types';
import { SOLUTIONS_DATA } from '../constants';
import { generateQuiz, Question } from './QuizGenerator';
import { Trophy, CheckCircle, XCircle, Brain, ArrowRight, Play, RotateCcw, Save } from 'lucide-react';
import { saveUser } from './lib/userService';

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
        const newQuestions = generateQuiz(SOLUTIONS_DATA, 5, pkgFilter);
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
            setScore(s => s + 100);
            setFeedbackMessage('Correto! Mandou bem.');
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
                        <h3 className="text-lg font-bold text-gray-700 mb-4">Escolha o desafio:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {/* General Button */}
                            <button
                                onClick={() => startQuiz(null)}
                                className="p-4 rounded-xl border-2 border-purple-100 hover:border-purple-500 hover:bg-purple-50 transition-all group flex flex-col items-center gap-2"
                            >
                                <Trophy className="text-purple-400 group-hover:text-purple-600" size={32} />
                                <span className="font-bold text-gray-700 group-hover:text-purple-700">Geral (Misto)</span>
                                <span className="text-xs text-gray-400">Todas as soluções</span>
                            </button>

                            {packages.map(pkg => (
                                <button
                                    key={pkg}
                                    onClick={() => startQuiz(pkg)}
                                    className="p-4 rounded-xl border-2 border-gray-100 hover:border-metarh-medium hover:bg-purple-50/50 transition-all group flex flex-col items-center gap-2"
                                >
                                    <span className="font-bold text-gray-700 group-hover:text-metarh-medium">{pkg}</span>
                                    <span className="text-xs text-gray-400">Solução Específica</span>
                                </button>
                            ))}
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
                                        <p className={`font-bold ${selectedOption === currentQ.correctAnswer ? 'text-green-600' : 'text-red-500'}`}>
                                            {feedbackMessage}
                                        </p>
                                        <p className="text-gray-500 text-sm mt-1">{currentQ.explanation}</p>
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
        const isWin = score >= 300; // 3/5 correct

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
                        {isWin ? 'Mandou muito bem!' : 'Bom esforço!'}
                    </h2>
                    <p className="text-gray-500 mb-8">
                        Você completou o quiz. Confira seu desempenho abaixo.
                    </p>

                    <div className="text-6xl font-black text-purple-600 mb-2 tracking-tight">
                        {score}
                        <span className="text-2xl text-gray-400 font-medium ml-2">pts</span>
                    </div>
                    <p className="text-gray-400 uppercase font-bold tracking-widest text-sm mb-12">Pontuação Final</p>

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
