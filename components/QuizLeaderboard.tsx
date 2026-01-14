import React, { useEffect, useState } from 'react';
import { generateQuiz, Question } from './QuizGenerator';
import { SOLUTIONS_DATA } from '../constants';
import { User, QuizResult } from '../types';
import { getUsers, saveUser } from './lib/userService';
import { Trophy, Medal, Crown, Shield, FileText, ArrowLeft, Loader2, Star, Lock } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface QuizLeaderboardProps {
    currentUser: User;
    onBack: () => void;
}

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ currentUser, onBack }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tiebreakerNeeded, setTiebreakerNeeded] = useState(false);
    const [tiedUsers, setTiedUsers] = useState<User[]>([]);
    const [tiebreakerQuestion, setTiebreakerQuestion] = useState<Question | null>(null);
    const [tiebreakerAnswer, setTiebreakerAnswer] = useState<string | null>(null);
    const [tiebreakerResult, setTiebreakerResult] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    // Gera uma pergunta extra para desempate quando necessário
    useEffect(() => {
        if (tiebreakerNeeded && tiedUsers.length > 0 && !tiebreakerQuestion) {
            // Gera uma pergunta aleatória (pode ser aprimorado para garantir unicidade)
            const questions = generateQuiz(SOLUTIONS_DATA, 1);
            setTiebreakerQuestion(questions[0]);
        }
        if (!tiebreakerNeeded) {
            setTiebreakerQuestion(null);
            setTiebreakerAnswer(null);
            setTiebreakerResult(null);
        }
    }, [tiebreakerNeeded, tiedUsers, tiebreakerQuestion]);

    const loadUsers = async () => {
        try {
            const allUsers = await getUsers();
            // Filtra apenas usuários com pontuação > 0 para ranking
            const filtered = allUsers.filter(u => (u.totalQuizScore || 0) > 0);
            // Sort by score desc
            const sorted = filtered.sort((a, b) => (b.totalQuizScore || 0) - (a.totalQuizScore || 0));
            setUsers(sorted);

            // Detecta empate entre top 3
            if (sorted.length >= 2) {
                const topScore = sorted[0].totalQuizScore;
                const tied = sorted.filter(u => u.totalQuizScore === topScore);
                if (tied.length > 1 && tied.length <= 3) {
                    setTiebreakerNeeded(true);
                    setTiedUsers(tied);
                } else {
                    setTiebreakerNeeded(false);
                    setTiedUsers([]);
                }
            } else {
                setTiebreakerNeeded(false);
                setTiedUsers([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const hasUserCompletedAllModes = (userToCheck: User): boolean => {
        const uniquePackages = Array.from(new Set(SOLUTIONS_DATA.map(s => s.solutionPackage)));
        const playedModes = new Set(userToCheck.quizHistory?.map(h => h.mode) || []);

        // Check if user played 'Desafio Supremo' (which is the mixed mode)
        const hasSupreme = playedModes.has('Desafio Supremo');

        // Check if user played all specific packages
        const hasAllPackages = uniquePackages.every(pkg => playedModes.has(pkg));

        return hasSupreme && hasAllPackages;
    };

    const getRankInfo = (index: number, userToCheck: User) => {
        const isQualified = hasUserCompletedAllModes(userToCheck);

        if (!isQualified) {
            return { title: 'Aspirante', icon: null, color: 'text-gray-400' };
        }

        switch (index) {
            case 0: return { title: 'METARH Boss', icon: <Crown size={16} className="text-metarh-yellow" />, color: 'text-metarh-yellow' };
            case 1: return { title: 'METARH Beast', icon: <Medal size={16} className="text-gray-300" />, color: 'text-gray-300' };
            case 2: return { title: 'METARH Ninja', icon: <Shield size={16} className="text-amber-700" />, color: 'text-amber-700' };
            default: return { title: 'Especialista', icon: <Star size={14} className="text-metarh-medium" />, color: 'text-metarh-medium' };
        }
    };

    const handleExportPDF = () => {
        const element = document.getElementById('leaderboard-content');
        const opt = {
            margin: 0.5,
            filename: 'ranking_metarh.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 min-h-[600px] font-barlow">
                <Loader2 className="animate-spin text-metarh-medium mb-4" size={48} />
                <p className="text-gray-500 text-lg">Carregando ranking...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-8 bg-gray-50 min-h-[600px] font-barlow relative">
            {tiebreakerNeeded && tiebreakerQuestion && (
                <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-xl text-yellow-900 font-bold text-center">
                    Empate detectado entre os primeiros colocados!<br />
                    <span className="font-normal">Responda a pergunta extra para desempatar:</span>
                    <div className="mt-4 text-base font-normal">
                        <div className="mb-2 font-bold">{tiebreakerQuestion.questionText}</div>
                        <div className="flex flex-col gap-2 items-center">
                            {tiebreakerQuestion.options.map(opt => (
                                <button
                                    key={opt}
                                    className={`px-4 py-2 rounded-lg border font-medium ${tiebreakerAnswer === opt ? 'bg-yellow-300 border-yellow-500' : 'bg-white border-yellow-300 hover:bg-yellow-200'}`}
                                    disabled={!!tiebreakerAnswer}
                                    onClick={async () => {
                                        setTiebreakerAnswer(opt);
                                        if (opt === tiebreakerQuestion.correctAnswer) {
                                            setTiebreakerResult('Correto! Você assume a liderança.');
                                            // Atualiza o score do usuário empatado (apenas para o usuário atual)
                                            if (tiedUsers.some(u => u.id === currentUser.id)) {
                                                const updatedUser = {
                                                    ...currentUser,
                                                    totalQuizScore: (currentUser.totalQuizScore || 0) + 1
                                                };
                                                await saveUser(updatedUser);
                                                // Recarrega ranking após atualização
                                                await loadUsers();
                                            }
                                        } else {
                                            setTiebreakerResult('Errado! Tente novamente na próxima rodada.');
                                        }
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        {tiebreakerResult && (
                            <div className={`mt-4 font-bold ${tiebreakerResult.startsWith('Correto') ? 'text-green-700' : 'text-red-700'}`}>{tiebreakerResult}</div>
                        )}
                    </div>
                </div>
            )}
            <button
                onClick={onBack}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-metarh-medium transition-colors font-medium z-10"
            >
                <ArrowLeft size={20} /> Voltar
            </button>

            <div className="max-w-4xl w-full mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col border border-gray-100">

                {/* Header */}
                <div className="bg-metarh-dark p-8 pb-12 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-metarh-medium/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Trophy className="text-metarh-yellow" size={32} />
                            Ranking Global
                        </h1>
                        <p className="text-purple-200">Os maiores especialistas em soluções METARH</p>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="relative z-10 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all border border-white/20"
                    >
                        <FileText size={18} /> Baixar PDF
                    </button>
                </div>

                {/* Content for PDF */}
                <div id="leaderboard-content" className="p-8 -mt-6 bg-white rounded-t-[2rem] relative z-20">

                    {/* Legend / Info */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-50 rounded-full px-6 py-2 flex items-center gap-2 text-xs text-gray-500 border border-gray-100">
                            <Lock size={12} />
                            <span>Medalhas exclusivas para quem completou todos os desafios (incluindo Supremo)</span>
                        </div>
                    </div>

                    {/* Podium for Top 3 */}
                    <div className="flex justify-center items-end gap-4 mb-12 min-h-[220px]">
                        {/* 2nd Place */}
                        {users[1] && (
                            <div className="flex flex-col items-center w-1/4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-gray-300 mb-2 overflow-hidden shadow-lg relative group">
                                    {users[1].avatarUrl ? (
                                        <img src={users[1].avatarUrl} alt={users[1].name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xl">
                                            {users[1].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{users[1] && users[1].totalQuizScore > 0 ? '2º Lugar' : ''}</div>
                                <div className="font-bold text-gray-800 text-center leading-tight line-clamp-1">{users[1].name}</div>
                                <div className="text-xs text-gray-500 mb-2">{users[1].totalQuizScore} pts</div>

                                {(() => {
                                    const rank = getRankInfo(1, users[1]);
                                    return rank.icon ? (
                                        <div className={`bg-gray-100 ${rank.color} text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1`}>
                                            {rank.icon} <span className="text-[10px] uppercase">{rank.title}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{rank.title}</span>
                                    );
                                })()}
                                <div className="h-24 w-full bg-gray-100 mt-2 rounded-t-lg shadow-inner"></div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {users[0] && (
                            <div className="flex flex-col items-center w-1/3 z-10 -mb-4">
                                <Crown size={48} className="text-metarh-yellow mb-2 animate-bounce drop-shadow-lg scale-110" />
                                <div className="w-24 h-24 rounded-full bg-yellow-100 border-4 border-metarh-yellow mb-2 overflow-hidden shadow-xl ring-4 ring-metarh-yellow/20 relative">
                                    {users[0].avatarUrl ? (
                                        <img src={users[0].avatarUrl} alt={users[0].name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-yellow-600 text-3xl">
                                            {users[0].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-metarh-yellow uppercase tracking-widest mb-1 drop-shadow-sm">{users[0] && users[0].totalQuizScore > 0 ? '1º Lugar' : ''}</div>
                                <div className="text-xl font-bold text-gray-900 text-center leading-tight line-clamp-1">{users[0].name}</div>
                                <div className="text-sm text-gray-500 mb-2 font-bold">{users[0].totalQuizScore} pts</div>

                                {(() => {
                                    const rank = getRankInfo(0, users[0]);
                                    return rank.icon ? (
                                        <div className="bg-gradient-to-r from-metarh-yellow to-yellow-300 text-yellow-900 text-sm px-4 py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
                                            {rank.icon} <span>{rank.title}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium uppercase">{rank.title}</span>
                                    );
                                })()}

                                <div className="h-32 w-full bg-gradient-to-b from-metarh-yellow to-yellow-100 mt-2 rounded-t-lg shadow-lg relative overflow-hidden flex justify-center">
                                    <div className="absolute inset-0 bg-white/20 skew-y-12 translate-y-10"></div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {users[2] && (
                            <div className="flex flex-col items-center w-1/4">
                                <div className="w-16 h-16 rounded-full bg-amber-50 border-4 border-amber-700 mb-2 overflow-hidden shadow-lg">
                                    {users[2].avatarUrl ? (
                                        <img src={users[2].avatarUrl} alt={users[2].name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-amber-800 text-xl">
                                            {users[2].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">{users[2] && users[2].totalQuizScore > 0 ? '3º Lugar' : ''}</div>
                                <div className="font-bold text-gray-800 text-center leading-tight line-clamp-1">{users[2].name}</div>
                                <div className="text-xs text-gray-500 mb-2">{users[2].totalQuizScore} pts</div>

                                {(() => {
                                    const rank = getRankInfo(2, users[2]);
                                    return rank.icon ? (
                                        <div className={`bg-amber-50 ${rank.color} text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1`}>
                                            {rank.icon} <span className="text-[10px] uppercase">{rank.title}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{rank.title}</span>
                                    );
                                })()}
                                <div className="h-16 w-full bg-amber-100 mt-2 rounded-t-lg shadow-inner"></div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-100 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                    <th className="py-4 pl-4">Posição</th>
                                    <th className="py-4">Participante</th>
                                    <th className="py-4">Título</th>
                                    <th className="py-4 text-center">Jogos</th>
                                    <th className="py-4 text-right pr-4">Pontuação Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, index) => {
                                    if (!u.totalQuizScore || u.totalQuizScore === 0) return null;
                                    const isCurrentUser = u.id === currentUser.id;
                                    const rankInfo = getRankInfo(index, u);

                                    return (
                                        <tr
                                            key={u.id}
                                            className={`
                                                border-b border-gray-50 hover:bg-gray-50 transition-colors
                                                ${isCurrentUser ? 'bg-purple-50 hover:bg-purple-100' : ''}
                                                ${index < 3 ? 'font-medium' : ''}
                                            `}
                                        >
                                            <td className="py-4 pl-4">
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                    ${index === 0 ? 'bg-metarh-yellow text-yellow-800' :
                                                        index === 1 ? 'bg-gray-200 text-gray-600' :
                                                            index === 2 ? 'bg-amber-100 text-amber-800' : 'text-gray-400'}
                                                `}>
                                                    {index + 1}º
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                        {u.avatarUrl ? (
                                                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                                {u.name[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={isCurrentUser ? 'font-bold text-metarh-dark' : 'text-gray-800'}>
                                                        {u.name} {isCurrentUser && '(Você)'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                {rankInfo.icon ? (
                                                    <div className="flex items-center gap-2">
                                                        {rankInfo.icon}
                                                        <span className={`text-sm font-medium ${rankInfo.color} brightness-75`}>{rankInfo.title}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic font-light">{rankInfo.title}</span>
                                                )}
                                            </td>
                                            <td className="py-4 text-center text-gray-600 font-medium">
                                                {u.totalQuizGames || 0}
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                <span className="font-bold text-gray-800">{u.totalQuizScore || 0}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
