import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { getUsers } from './lib/userService';
import { Trophy, Medal, Crown, Shield, FileText, ArrowLeft, Loader2 } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface QuizLeaderboardProps {
    currentUser: User;
    onBack: () => void;
}

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ currentUser, onBack }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const allUsers = await getUsers();
            // Sort by score desc, then by games played asc (efficiency?) or desc? 
            // Usually score is king. Tiebreaker: fewer games? or more games? 
            // Let's go with Score Desc.
            const sorted = allUsers.sort((a, b) => (b.totalQuizScore || 0) - (a.totalQuizScore || 0));
            setUsers(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (index: number) => {
        switch (index) {
            case 0: return 'text-yellow-400'; // Gold
            case 1: return 'text-gray-400';   // Silver
            case 2: return 'text-amber-700';  // Bronze
            default: return 'text-gray-300';
        }
    };

    const getRankTitle = (index: number) => {
        switch (index) {
            case 0: return { title: 'METARH Boss', icon: <Crown size={16} className="text-yellow-500" /> };
            case 1: return { title: 'METARH Beast', icon: <Medal size={16} className="text-gray-400" /> };
            case 2: return { title: 'METARH Ninja', icon: <Shield size={16} className="text-amber-700" /> };
            default: return { title: 'Aprendiz', icon: null };
        }
    };

    const handleExportPDF = () => {
        const element = document.getElementById('leaderboard-content');
        const opt = {
            margin: 1,
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
                <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
                <p className="text-gray-500 text-lg">Carregando ranking...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-8 bg-gray-50 min-h-[600px] font-barlow relative">
            <button
                onClick={onBack}
                className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors font-medium z-10"
            >
                <ArrowLeft size={20} /> Voltar
            </button>

            <div className="max-w-4xl w-full mx-auto bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Trophy className="text-yellow-400" size={32} />
                            Ranking Global
                        </h1>
                        <p className="text-purple-200">Os maiores especialistas em soluções METARH</p>
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all border border-white/20"
                    >
                        <FileText size={18} /> Baixar PDF
                    </button>
                </div>

                {/* Content for PDF */}
                <div id="leaderboard-content" className="p-8">
                    {/* Podium for Top 3 */}
                    <div className="flex justify-center items-end gap-4 mb-12 min-h-[200px]">
                        {/* 2nd Place */}
                        {users[1] && (
                            <div className="flex flex-col items-center w-1/4">
                                <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-gray-300 mb-2 overflow-hidden shadow-lg">
                                    {users[1].avatarUrl ? (
                                        <img src={users[1].avatarUrl} alt={users[1].name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xl">
                                            {users[1].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">2º Lugar</div>
                                <div className="font-bold text-gray-800 text-center leading-tight">{users[1].name}</div>
                                <div className="text-xs text-gray-500 mb-1">{users[1].totalQuizScore} pts</div>
                                <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 mt-1">
                                    <Medal size={12} /> METARH Beast
                                </div>
                                <div className="h-24 w-full bg-gray-100 mt-2 rounded-t-lg shadow-inner"></div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {users[0] && (
                            <div className="flex flex-col items-center w-1/3 z-10 -mb-4">
                                <Crown size={48} className="text-yellow-400 mb-2 animate-bounce" />
                                <div className="w-24 h-24 rounded-full bg-yellow-100 border-4 border-yellow-400 mb-2 overflow-hidden shadow-xl ring-4 ring-yellow-400/30">
                                    {users[0].avatarUrl ? (
                                        <img src={users[0].avatarUrl} alt={users[0].name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-yellow-600 text-3xl">
                                            {users[0].name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-1">1º Lugar</div>
                                <div className="text-xl font-bold text-gray-900 text-center leading-tight">{users[0].name}</div>
                                <div className="text-sm text-gray-500 mb-1 font-bold">{users[0].totalQuizScore} pts</div>
                                <div className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full font-bold flex items-center gap-1 mt-1 border border-yellow-200 shadow-sm">
                                    <Crown size={14} /> METARH Boss
                                </div>
                                <div className="h-32 w-full bg-gradient-to-b from-yellow-300 to-yellow-100 mt-2 rounded-t-lg shadow-lg relative overflow-hidden">
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
                                <div className="text-sm font-bold text-amber-700 uppercase tracking-widest mb-1">3º Lugar</div>
                                <div className="font-bold text-gray-800 text-center leading-tight">{users[2].name}</div>
                                <div className="text-xs text-gray-500 mb-1">{users[2].totalQuizScore} pts</div>
                                <div className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 mt-1">
                                    <Shield size={12} /> METARH Ninja
                                </div>
                                <div className="h-16 w-full bg-amber-100 mt-2 rounded-t-lg shadow-inner"></div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-100 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="py-4 pl-4">Posição</th>
                                    <th className="py-4">Participante</th>
                                    <th className="py-4">Título</th>
                                    <th className="py-4 text-center">Jogos</th>
                                    <th className="py-4 text-right pr-4">Pontuação Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u, index) => {
                                    const isCurrentUser = u.id === currentUser.id;
                                    const rankInfo = getRankTitle(index);

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
                                                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-600' :
                                                            index === 2 ? 'bg-amber-100 text-amber-800' : 'text-gray-500'}
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
                                                    <span className={isCurrentUser ? 'font-bold text-purple-700' : 'text-gray-800'}>
                                                        {u.name} {isCurrentUser && '(Você)'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                {rankInfo.icon ? (
                                                    <div className="flex items-center gap-2">
                                                        {rankInfo.icon}
                                                        <span className="text-sm font-medium text-gray-700">{rankInfo.title}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 text-center text-gray-600">
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
