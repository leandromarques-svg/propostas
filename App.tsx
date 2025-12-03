import React, { useState, useMemo, useEffect } from 'react';
import { Logo } from './components/Logo';
import { SOLUTIONS_DATA, USERS } from './constants';
import { SolutionData, ViewState, CartItem, CartSelections, User, SavedProposal, ProposalSection } from './types';
import { DetailModal } from './components/DetailModal';
import { ProposalView } from './components/ProposalView';
import { LoginScreen } from './components/LoginScreen';
import { ProfileModal } from './components/ProfileModal';
import { UserManagementModal } from './components/UserManagementModal';
import { SolutionSummaryModal } from './components/SolutionSummaryModal';
import { ChatBot } from './components/ChatBot';
import { ProposalLayoutEditor, DEFAULT_LAYOUT } from './components/ProposalLayoutEditor';
import { PricingCalculator } from './components/PricingCalculator';
import { LaborCalculator } from './components/LaborCalculator';
import { getUsers, saveUser, deleteUser } from './components/lib/userService';
import { SupabaseStatus } from './components/SupabaseStatus';
import { AppSettingsModal } from './components/AppSettingsModal';
import { Search, ShoppingBag, Plus, Edit3, ChevronDown, Layers, Download, LogOut, User as UserIcon, Shield, BookOpen, Info, FileDown, Briefcase, Stethoscope, Users, Star, Cpu, Map, Store, Crown, Layout, Calculator, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { Footer } from './components/Footer';

// Package Themes Helper
const getPackageTheme = (packageKey: string) => {
  const baseTheme = { color: 'bg-metarh-medium', textColor: 'text-metarh-dark', borderColor: 'border-metarh-medium', iconColor: 'text-white' };
  return baseTheme;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginExiting, setIsLoginExiting] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [view, setView] = useState<ViewState>('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [proposalHistory, setProposalHistory] = useState<SavedProposal[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<SolutionData | null>(null);

  // State for Proposal Layout
  const [proposalLayout, setProposalLayout] = useState<ProposalSection[]>(DEFAULT_LAYOUT);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isAppSettingsModalOpen, setIsAppSettingsModalOpen] = useState(false);
  const [selectedSummaryPackage, setSelectedSummaryPackage] = useState<string | null>(null);
  const [viewPackageSummary, setViewPackageSummary] = useState<string | null>(null);

  // Calculator Dashboard State
  const [activeCalculator, setActiveCalculator] = useState<'pricing' | 'labor' | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // For banner search
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [showCalculatorMenu, setShowCalculatorMenu] = useState(false);

  const groupedSolutions = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    const filtered = SOLUTIONS_DATA.filter(s =>
      s.name.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.solutionPackage.toLowerCase().includes(lower)
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
    } else {
      setExpandedGroups({});
    }
  }, [searchTerm, groupedSolutions]);

  const groupKeys = Object.keys(groupedSolutions).sort();
  const cartCount = cart.length;
  const greeting = getGreeting();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      const users = await getUsers();
      setAllUsers(users);
      setIsLoadingUsers(false);
    };
    loadUsers();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsLoginExiting(true);
    setTimeout(() => {
      setCurrentUser(null);
      setIsLoginExiting(false);
      setView('catalog');
      setCart([]);
    }, 500);
  };

  const addToCart = (solution: SolutionData, selections?: CartSelections) => {
    if (!cart.find(item => item.solution.id === solution.id)) {
      setCart([...cart, { solution, quantity: 1, selections: selections || { benefits: [], publicNeeds: [], toolsUsed: [] } }]);
    }
  };

  const removeFromCart = (solutionId: string) => {
    setCart(cart.filter(item => item.solution.id !== solutionId));
  };

  const updateQuantity = (solutionId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.solution.id === solutionId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const updateSelections = (solutionId: string, selections: CartSelections) => {
    setCart(cart.map(item => {
      if (item.solution.id === solutionId) {
        return { ...item, selections };
      }
      return item;
    }));
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleSaveProposal = (proposal: SavedProposal) => {
    setProposalHistory([proposal, ...proposalHistory]);
    setCart([]);
    setView('catalog');
  };

  const handleCreateUser = async (newUser: Omit<User, 'id'>) => {
    const createdUser = await saveUser(newUser);
    if (createdUser) {
      setAllUsers([...allUsers, createdUser]);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const savedUser = await saveUser(updatedUser);
    if (savedUser) {
      setAllUsers(allUsers.map(u => u.id === savedUser.id ? savedUser : u));
      if (currentUser?.id === savedUser.id) {
        setCurrentUser(savedUser);
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
    if (success) {
      setAllUsers(allUsers.filter(u => u.id !== userId));
    }
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLogin} users={allUsers} isExiting={isLoginExiting} />;
  }

  const renderHeader = () => (
    <header className="bg-gradient-to-r from-metarh-medium to-purple-700 text-white px-6 py-3 shadow-lg sticky top-0 z-30">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Logo + Greeting */}
        <div className="flex items-center gap-6">
          <Logo variant="white" orientation="horizontal" className="h-7 w-auto" />
          <div className="hidden md:block">
            <p className="text-sm font-medium opacity-90">{greeting}, <span className="font-bold">{currentUser.name.split(' ')[0]}</span></p>
          </div>
        </div>

        {/* Center: Navigation Menu */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setView('catalog')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${view === 'catalog' ? 'bg-white text-metarh-medium shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
          >
            <span className="flex items-center gap-2">
              <Layers size={18} />
              <span className="hidden sm:inline">Catálogo</span>
            </span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowCalculatorMenu(!showCalculatorMenu)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${view === 'calculator' ? 'bg-white text-metarh-medium shadow-md' : 'bg-white/10 hover:bg-white/20'}`}
            >
              <span className="flex items-center gap-2">
                <Calculator size={18} />
                <span className="hidden sm:inline">Calculadoras</span>
                <ChevronDown size={14} className={`transition-transform ${showCalculatorMenu ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {showCalculatorMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[200px] z-50">
                <button
                  onClick={() => {
                    setView('calculator');
                    setActiveCalculator('pricing');
                    setShowCalculatorMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm flex items-center gap-2"
                >
                  <Calculator size={16} />
                  Calculadora de Projetos
                </button>
                <button
                  onClick={() => {
                    setView('calculator');
                    setActiveCalculator('labor');
                    setShowCalculatorMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm flex items-center gap-2 border-t border-gray-100"
                >
                  <Users size={16} />
                  Gestão de Mão de Obra
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSummaryModalOpen(true)}
            className="px-4 py-2 rounded-lg font-medium text-sm bg-white/10 hover:bg-white/20 transition-all relative"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Minhas Propostas</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-metarh-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </span>
          </button>
        </nav>

        {/* Right: Profile + Admin Controls */}
        <div className="flex items-center gap-3">
          {currentUser.isAdmin && (
            <>
              <button
                onClick={() => setIsUserManagementOpen(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Gerenciar Usuários"
              >
                <Crown size={20} className="text-yellow-300" />
              </button>
              <button
                onClick={() => setIsAppSettingsModalOpen(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
            </>
          )}
          <div className="h-6 w-px bg-white/20"></div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 hover:bg-white/10 rounded-lg p-1 pr-3 transition-all"
          >
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-metarh-medium rounded-full"></div>
            </div>
            <span className="hidden lg:inline text-sm font-medium">{currentUser.name.split(' ')[0]}</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 bg-white/10 hover:bg-red-500 rounded-lg transition-all"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );

  // --- RENDER CALCULATORS ---
  if (view === 'calculator') {
    if (activeCalculator === 'pricing') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 animate-fade-in">
          {renderHeader()}
          <PricingCalculator onCancel={() => setActiveCalculator(null)} />
          <Footer />
        </div>
      );
    }
    if (activeCalculator === 'labor') {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 animate-fade-in">
          {renderHeader()}
          <LaborCalculator onCancel={() => setActiveCalculator(null)} />
          <Footer />
        </div>
      );
    }

    // Calculator Dashboard
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col animate-fade-in">
        {renderHeader()}

        <div className="flex-1 p-8 max-w-5xl mx-auto w-full flex items-center justify-center">
          <div className="grid md:grid-cols-2 gap-8 w-full">
            {/* Pricing Calculator Card */}
            <button
              onClick={() => setActiveCalculator('pricing')}
              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-metarh-medium/30 transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calculator size={120} className="text-metarh-medium" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-metarh-medium/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calculator size={32} className="text-metarh-medium" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculadora de Projetos</h2>
                <p className="text-gray-500 mb-6">
                  Precificação de projetos de consultoria, R&S e serviços pontuais.
                </p>
                <div className="flex items-center gap-2 text-metarh-medium font-bold group-hover:translate-x-2 transition-transform">
                  Acessar Calculadora <ArrowRight size={18} />
                </div>
              </div>
            </button>

            {/* Labor Calculator Card */}
            <button
              onClick={() => setActiveCalculator('labor')}
              className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-metarh-medium/30 transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={120} className="text-metarh-medium" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-metarh-medium/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users size={32} className="text-metarh-medium" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestão de Mão de Obra</h2>
                <p className="text-gray-500 mb-6">
                  Cálculo de custos para mão de obra administrada, temporários e terceiros (CLT).
                </p>
                <div className="flex items-center gap-2 text-metarh-medium font-bold group-hover:translate-x-2 transition-transform">
                  Acessar Calculadora <ArrowRight size={18} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'proposal') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 animate-fade-in">
        {renderHeader()}
        <ProposalView
          cart={cart}
          onBack={() => setView('catalog')}
          onSaveToHistory={handleSaveProposal}
          user={currentUser}
          history={proposalHistory}
          onRemove={removeFromCart}
        />
        <Footer />
      </div>
    );
  }

  // Temporarily disabled - Layout Editor
  /*
  if (view === 'layout-editor') {
    return (
      <ProposalLayoutEditor
        currentLayout={proposalLayout}
        onSave={(newLayout) => {
          setProposalLayout(newLayout);
          setView('catalog');
        }}
        onCancel={() => setView('catalog')}
      />
    );
  }
  */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 animate-fade-in">
      {/* Top Navigation Bar */}
      {renderHeader()}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-24">

            {/* Hero Banner - Purple with Search */}
            <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 rounded-[3rem] p-12 mb-8 shadow-2xl relative overflow-hidden">
              {/* Animated Background Blobs - Same as loading screen */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-[800px] h-[800px] border-[1px] border-white/10 rounded-full animate-ping absolute" style={{ animationDuration: '3s' }}></div>
                <div className="w-[600px] h-[600px] border-[1px] border-white/10 rounded-full animate-ping absolute" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
              </div>
              <div className="blob-shape bg-purple-500 w-[600px] h-[600px] rounded-full top-[-200px] right-[-200px] mix-blend-screen filter blur-[100px] opacity-20 animate-float absolute"></div>
              <div className="blob-shape bg-purple-400 w-[500px] h-[500px] rounded-full bottom-[-100px] left-[-100px] mix-blend-screen filter blur-[80px] opacity-20 animate-float absolute" style={{ animationDelay: '2s' }}></div>

              <div className="relative z-10">
                {/* Text and Search */}
                <div className="max-w-3xl">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Vamos construir uma proposta incrível hoje, <span style={{ color: '#c9f545' }}>{currentUser.name.split(' ')[0]}</span>?
                  </h1>
                  <p className="text-lg text-purple-100 mb-6">
                    Explore nossa <strong style={{ color: '#c9f545' }}>árvore de soluções</strong> e personalize cada item para criar propostas exclusivas para nossos clientes.
                  </p>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Busque por serviço ou soluções (ex: Hunting, R&S, Tech)..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchTerm(e.target.value);
                      }}
                      className="w-full px-6 py-4 pr-12 rounded-2xl border-2 border-purple-300/30 bg-white/95 backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#c9f545]/50 focus:border-[#c9f545] transition-all shadow-lg"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="space-y-12">
              {groupKeys.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 mt-2">Tente buscar por outros termos ou navegue pelas categorias.</p>
                </div>
              ) : (
                groupKeys.map(group => {
                  const theme = getPackageTheme(group);
                  const isExpanded = expandedGroups[group] ?? false; // Default closed

                  return (
                    <div
                      key={group}
                      className={`animate-slide-up bg-white rounded-[2.5rem] p-8 shadow-sm border transition-all duration-300 mb-8 ${isExpanded ? 'border-metarh-medium ring-1 ring-metarh-medium/50' : 'border-gray-100 hover:shadow-md'}`}
                    >
                      {/* Header Section */}
                      <div
                        className="flex flex-col md:flex-row items-start md:items-center gap-6 cursor-pointer group/header select-none"
                        onClick={() => toggleGroup(group)}
                      >
                        {/* Icon Box */}
                        <div className={`w-16 h-16 ${theme.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
                          <PackageIcon name={group} className="text-white" size={32} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-metarh-dark mb-2 group-hover:text-metarh-medium transition-colors">{group}</h2>
                          <p className="text-gray-600 text-sm leading-relaxed max-w-4xl">
                            {groupedSolutions[group][0]?.aboutSolution || "Solução especializada METARH."}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 ml-auto mt-4 md:mt-0 shrink-0">
                          <div className="bg-gray-50 rounded-full px-4 py-2 flex items-center gap-4 border border-gray-100">
                            <button
                              className="text-metarh-medium hover:text-metarh-dark transition-colors"
                              title="Mais Informações"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewPackageSummary(group);
                              }}
                            >
                              <Info size={20} />
                            </button>
                            <div className="w-px h-4 bg-gray-300"></div>
                            <button className="text-metarh-medium hover:text-metarh-dark transition-colors" title="Baixar PDF">
                              <FileDown size={20} />
                            </button>
                          </div>

                          <div className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all ${isExpanded ? 'bg-gray-50 border-metarh-medium/30' : ''}`}>
                            <ChevronDown
                              size={24}
                              className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-metarh-medium' : ''}`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                          {groupedSolutions[group].map(solution => {
                            const inCart = cart.find(item => item.solution.id === solution.id);
                            return (
                              <div
                                key={solution.id}
                                className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col hover:shadow-lg ${inCart ? 'border-metarh-medium ring-1 ring-metarh-medium' : 'border-gray-100 hover:border-gray-200'}`}
                              >
                                <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-1">{solution.name}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1 line-clamp-4">
                                  {solution.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between gap-4">
                                  <button
                                    onClick={() => setSelectedSolution(solution)}
                                    className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                                  >
                                    Detalhes
                                  </button>

                                  {inCart ? (
                                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 h-10 px-1">
                                      <button
                                        onClick={() => updateQuantity(solution.id, -1)}
                                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors font-bold"
                                      >
                                        -
                                      </button>
                                      <span className="w-6 text-center text-sm font-bold text-gray-800">{inCart.quantity}</span>
                                      <button
                                        onClick={() => updateQuantity(solution.id, 1)}
                                        className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-metarh-medium transition-colors font-bold"
                                      >
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => addToCart(solution)}
                                      className="w-10 h-10 rounded-full bg-metarh-medium text-white flex items-center justify-center hover:bg-metarh-dark transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-105"
                                      title="Adicionar à proposta"
                                    >
                                      <Plus size={20} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <Footer />
          </div>
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 animate-slide-up">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-metarh-medium/10 p-3 rounded-xl">
                  <ShoppingBag size={24} className="text-metarh-medium" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Resumo do Pedido</p>
                  <p className="text-xl font-bold text-gray-800">{cartCount} {cartCount === 1 ? 'solução selecionada' : 'soluções selecionadas'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:border-metarh-medium hover:text-metarh-medium transition-all"
                >
                  Ver Resumo
                </button>
                <button
                  onClick={() => setView('proposal')}
                  className="px-8 py-3 bg-metarh-medium text-white rounded-xl font-bold shadow-lg shadow-metarh-medium/30 hover:bg-metarh-dark hover:scale-105 transition-all flex items-center gap-2"
                >
                  Gerar Proposta <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedSolution && (
        <DetailModal
          solution={selectedSolution}
          isOpen={!!selectedSolution}
          onClose={() => setSelectedSolution(null)}
          onAddToProposal={(s, selections) => {
            addToCart(s, selections);
            setSelectedSolution(null);
          }}
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

      {viewPackageSummary && (
        <SolutionSummaryModal
          packageKey={viewPackageSummary}
          solutions={groupedSolutions[viewPackageSummary]}
          isOpen={!!viewPackageSummary}
          onClose={() => setViewPackageSummary(null)}
          theme={getPackageTheme(viewPackageSummary)}
        />
      )}

      <AppSettingsModal
        isOpen={isAppSettingsModalOpen}
        onClose={() => setIsAppSettingsModalOpen(false)}
      />
    </div>
  );
};

export default App;
