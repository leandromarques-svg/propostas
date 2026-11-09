import React, { useState, useMemo, useEffect } from 'react';
import { Logo } from './components/Logo';
import { SOLUTIONS_DATA } from './constants';
import { SolutionData, User } from './types';
import { DetailModal } from './components/DetailModal';
import { LoginScreen } from './components/LoginScreen';
import { ProfileModal } from './components/ProfileModal';
import { UserManagementModal } from './components/UserManagementModal';
import { SolutionSummaryModal } from './components/SolutionSummaryModal';
import { CommercialToolsModal } from './components/CommercialToolsModal';
import { SolutionBlogSection } from './components/SolutionBlogSection';
import { ServiceCard } from './components/ServiceCard';
import { getUsers, saveUser, deleteUser, isGerencialComercial, isComercial } from './components/lib/userService';
import {
  Search,
  ChevronDown,
  Layers,
  LogOut,
  User as UserIcon,
  Shield,
  Briefcase,
  Stethoscope,
  Users,
  Star,
  Cpu,
  Map,
  Store,
  Info,
  Sparkles
} from 'lucide-react';
import { Footer } from './components/Footer';
import { SocialLinks } from './components/SocialLinks';

// Package Themes Helper
const getPackageTheme = (packageKey: string) => {
  return {
    color: 'bg-metarh-medium',
    textColor: 'text-metarh-dark',
    borderColor: 'border-metarh-medium',
    iconColor: 'text-white'
  };
};

const PackageIcon: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className, size }) => {
  switch (name) {
    case 'Business':
      return <Briefcase className={className} size={size} />;
    case 'Pharma Recruiter':
      return <Stethoscope className={className} size={size} />;
    case 'Staffing':
      return <Users className={className} size={size} />;
    case 'Talent':
      return <Star className={className} size={size} />;
    case 'Tech Recruiter':
      return <Cpu className={className} size={size} />;
    case 'Trilhando +':
      return <Map className={className} size={size} />;
    case 'Varejo Pro':
      return <Store className={className} size={size} />;
    default:
      return <Layers className={className} size={size} />;
  }
};

const getGreeting = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return 'Bom dia';
  if (hours >= 12 && hours < 18) return 'Boa tarde';
  return 'Boa noite';
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('metarh_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginExiting, setIsLoginExiting] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<SolutionData | null>(null);

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isCommercialToolsOpen, setIsCommercialToolsOpen] = useState(false);
  const [viewPackageSummary, setViewPackageSummary] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Business': true // First group open by default
  });

  const isManager = isGerencialComercial(currentUser);
  const isCommercialUser = isComercial(currentUser);

  // Grouped Solutions (Solutions contain Services)
  const groupedSolutions = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    const filtered = SOLUTIONS_DATA.filter(
      s =>
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower) ||
        s.solutionPackage.toLowerCase().includes(lower) ||
        s.benefits.some(b => b.toLowerCase().includes(lower)) ||
        s.publicNeeds.some(n => n.toLowerCase().includes(lower))
    );

    const groups: Record<string, SolutionData[]> = {};
    filtered.forEach(solution => {
      if (!groups[solution.solutionPackage]) {
        groups[solution.solutionPackage] = [];
      }
      groups[solution.solutionPackage].push(solution);
    });

    return groups;
  }, [searchTerm]);

  // Auto-expand groups when searching
  useEffect(() => {
    if (searchTerm) {
      const allGroups = Object.keys(groupedSolutions).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setExpandedGroups(allGroups);
    }
  }, [searchTerm, groupedSolutions]);

  const groupKeys = Object.keys(groupedSolutions).sort();
  const greeting = getGreeting();

  // Load users from Google Apps Script (excluding Cliente role)
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await getUsers();
        setAllUsers(users);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('metarh_active_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setIsLoginExiting(true);
    setTimeout(() => {
      setCurrentUser(null);
      try {
        localStorage.removeItem('metarh_active_user');
      } catch {}
      setIsLoginExiting(false);
    }, 400);
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleCreateUser = async (newUser: User) => {
    const createdUser = await saveUser(newUser, currentUser);
    if (createdUser) {
      setAllUsers(prev => [...prev, createdUser]);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const savedUser = await saveUser(updatedUser, currentUser);
    if (savedUser) {
      setAllUsers(prev => prev.map(u => (u.username === savedUser.username ? savedUser : u)));
      if (currentUser?.username === savedUser.username) {
        setCurrentUser(savedUser);
        try {
          localStorage.setItem('metarh_active_user', JSON.stringify(savedUser));
        } catch {}
      }
    }
  };

  const handleDeleteUser = async (username: string) => {
    await deleteUser(username, currentUser);
    setAllUsers(prev => prev.filter(u => u.username !== username));
  };

  // Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLogin}
        users={allUsers}
        isExiting={isLoginExiting}
      />
    );
  }

  const userInitial = (currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 animate-fade-in">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 bg-metarh-dark text-white shadow-xl z-40 border-b border-white/10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-4">
            <Logo variant="white" orientation="horizontal" className="h-9" />
            <div className="hidden md:block h-6 w-px bg-white/20"></div>
            <span className="hidden md:block text-xs font-semibold text-purple-200 uppercase tracking-widest">
              Árvore de Soluções
            </span>
          </div>

          {/* Center/Right Nav Controls */}
          <div className="flex items-center gap-3">
            {/* Redes Sociais no Header */}
            <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-1">
              <SocialLinks variant="header" />
            </div>

            {/* Ferramentas do Comercial - Acessível a toda a equipe Comercial e Gerencial */}
            {isCommercialUser && (
              <button
                type="button"
                onClick={() => setIsCommercialToolsOpen(true)}
                className="px-4 py-2.5 rounded-full font-bold text-xs bg-metarh-lime text-metarh-dark hover:bg-yellow-300 transition-all flex items-center gap-2 shadow-md shadow-metarh-lime/20 cursor-pointer"
                title="Ferramentas Estratégicas do Comercial"
              >
                <Briefcase size={15} />
                <span>Ferramentas do Comercial</span>
              </button>
            )}

            {/* Gerenciar Usuários - Restricted to Gerencial Comercial */}
            {isManager && (
              <button
                type="button"
                onClick={() => setIsUserManagementOpen(true)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-all text-purple-200 hover:text-white cursor-pointer"
                title="Gerenciar Usuários (Google Sheets)"
              >
                <Shield size={18} />
              </button>
            )}

            <div className="h-6 w-px bg-white/20 mx-1"></div>

            {/* Profile Button */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 hover:bg-white/10 rounded-full py-1.5 px-3 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-metarh-medium to-purple-400 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                {userInitial}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold leading-tight">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-purple-200 leading-tight">
                  {currentUser.role || 'Colaborador'}
                </span>
              </div>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 bg-white/10 hover:bg-red-500 rounded-full transition-all text-purple-200 hover:text-white cursor-pointer"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-purple-900 via-metarh-dark to-purple-800 rounded-[3rem] p-8 md:p-12 mb-10 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
            <div
              className="w-[700px] h-[700px] border border-white/15 rounded-full animate-ping absolute"
              style={{ animationDuration: '3.5s' }}
            ></div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
            {/* Left Text */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-metarh-lime mb-4">
                <Sparkles size={14} /> Portal Comercial & Árvore de Soluções
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">
                {greeting},{' '}
                <span style={{ color: '#c9f545' }}>{currentUser.name.split(' ')[0]}</span>!
              </h1>

              <p className="text-sm sm:text-base text-purple-100 mb-5 leading-relaxed">
                Explore as <strong>Soluções de RH</strong> da METARH e seus respectivos <strong>Serviços</strong>.
                Consulte as matérias do blog e etapas do funil de vendas associadas a cada solução,
                e acesse as ferramentas estratégicas do comercial.
              </p>

              {/* Redes Sociais & Site Oficial */}
              <div className="mb-6 p-3 sm:p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15">
                <SocialLinks variant="hero" />
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Busque por soluções, serviços, benefícios ou dores de clientes..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchTerm(e.target.value);
                  }}
                  className="w-full px-6 py-4 pr-12 rounded-2xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-metarh-lime/50 transition-all shadow-xl text-sm font-medium"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-metarh-medium" size={22} />
              </div>
            </div>

            {/* Right Hero Visual / Mosaico */}
            <div className="hidden lg:block flex-shrink-0">
              <img
                src="https://metarh.com.br/wp-content/uploads/2025/12/mosaico_Banner.png"
                alt="Mosaico METARH"
                className="w-[280px] h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Catalog: Solutions with their Blog Posts & their Services */}
        <div className="space-y-8 mb-16">
          {groupKeys.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Nenhuma solução ou serviço encontrado</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tente buscar por termos como "Hunting", "Assessment", "Staffing", "Tech" ou "Mapeamento".
              </p>
            </div>
          ) : (
            groupKeys.map((group) => {
              const theme = getPackageTheme(group);
              const isExpanded = expandedGroups[group] ?? false;
              const servicesInSolution = groupedSolutions[group] || [];

              return (
                <div
                  key={group}
                  className={`bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xs border transition-all duration-300 ${
                    isExpanded
                      ? 'border-metarh-medium/40 ring-1 ring-metarh-medium/20 shadow-md'
                      : 'border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  {/* Solution Accordion Header */}
                  <div
                    className="flex flex-col md:flex-row items-start md:items-center gap-5 cursor-pointer group/header select-none"
                    onClick={() => toggleGroup(group)}
                  >
                    {/* Solution Icon */}
                    <div
                      className={`w-14 h-14 ${theme.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/header:scale-105`}
                    >
                      <PackageIcon name={group} className="text-white" size={28} />
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 text-metarh-medium border border-purple-100">
                          Solução METARH
                        </span>
                        <h2 className="text-2xl font-bold text-metarh-dark group-hover/header:text-metarh-medium transition-colors">
                          {group}
                        </h2>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                          {servicesInSolution.length} {servicesInSolution.length === 1 ? 'serviço' : 'serviços'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-4xl line-clamp-2">
                        {servicesInSolution[0]?.aboutSolution || 'Solução especializada METARH.'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 ml-auto shrink-0 mt-3 md:mt-0">
                      <button
                        type="button"
                        className="bg-gray-50 hover:bg-metarh-medium hover:text-white text-gray-700 px-4 py-2 rounded-full border border-gray-200 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                        title="Argumentário Comercial & Pitch"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewPackageSummary(group);
                        }}
                      >
                        <Info size={15} />
                        <span>Pitch Comercial</span>
                      </button>

                      <div
                        className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center transition-all ${
                          isExpanded ? 'bg-purple-50 border-metarh-medium text-metarh-medium' : 'text-gray-400'
                        }`}
                      >
                        <ChevronDown
                          size={20}
                          className={`transition-transform duration-300 ${
                            isExpanded ? 'rotate-180 text-metarh-medium' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Solution Content */}
                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-gray-100 animate-fade-in space-y-8">
                      {/* 1. Blog Articles & Funnel Stages of THIS Solution */}
                      <SolutionBlogSection packageKey={group} />

                      {/* 2. Services of this Solution */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Layers size={18} className="text-metarh-medium" />
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                              Serviços da Solução {group} ({servicesInSolution.length})
                            </h3>
                          </div>
                          <span className="text-xs text-gray-400">
                            Clique em "Mais Informações" para visualizar a ficha técnica
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {servicesInSolution.map((service) => (
                            <ServiceCard
                              key={service.id}
                              service={service}
                              onOpenDetails={(s) => setSelectedSolution(s)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Grounded Footer */}
      <Footer />

      {/* Modals */}
      {selectedSolution && (
        <DetailModal
          solution={selectedSolution}
          isOpen={!!selectedSolution}
          onClose={() => setSelectedSolution(null)}
        />
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onSave={handleUpdateUser}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        users={allUsers}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onCreateUser={handleCreateUser}
        currentUser={currentUser}
      />

      <CommercialToolsModal
        isOpen={isCommercialToolsOpen}
        onClose={() => setIsCommercialToolsOpen(false)}
      />

      {viewPackageSummary && (
        <SolutionSummaryModal
          packageKey={viewPackageSummary}
          solutions={groupedSolutions[viewPackageSummary] || []}
          isOpen={!!viewPackageSummary}
          onClose={() => setViewPackageSummary(null)}
          theme={getPackageTheme(viewPackageSummary)}
        />
      )}
    </div>
  );
};

export default App;
