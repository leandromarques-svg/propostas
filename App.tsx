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
import { Search, ShoppingBag, Plus, Edit3, ChevronDown, Layers, Download, LogOut, User as UserIcon, Shield, BookOpen, Info, FileDown, Briefcase, Stethoscope, Users, Star, Cpu, Map, Store, Crown, Layout, Calculator, Settings, ArrowRight } from 'lucide-react';

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

  // Calculator Dashboard State
  const [activeCalculator, setActiveCalculator] = useState<'pricing' | 'labor' | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

  const addToCart = (solution: SolutionData) => {
    if (!cart.find(item => item.solution.id === solution.id)) {
      setCart([...cart, { solution, quantity: 1, selections: {} }]);
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

  // --- RENDER CALCULATORS ---
  if (view === 'calculator') {
    if (activeCalculator === 'pricing') {
      return <PricingCalculator onCancel={() => setActiveCalculator(null)} />;
    }
    if (activeCalculator === 'labor') {
      return <LaborCalculator onCancel={() => setActiveCalculator(null)} />;
    }

    // Calculator Dashboard
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col animate-fade-in">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('catalog')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowRight className="rotate-180 text-gray-500" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calculator className="text-metarh-medium" /> Calculadoras
            </h1>
          </div>
        </div>

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
      <ProposalView
        cart={cart}
        onBack={() => setView('catalog')}
        onSave={handleSaveProposal}
        currentUser={currentUser}
        layout={proposalLayout}
      />
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 animate-fade-in">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20 transition-all duration-300 shadow-sm">
        <div className="p-4 lg:p-6 flex justify-center lg:justify-start border-b border-gray-100">
          <Logo className="w-10 h-10 lg:w-8 lg:h-8 text-metarh-medium" />
          <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-metarh-dark">METARH</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <button
            onClick={() => setView('catalog')}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${view === 'catalog' ? 'bg-metarh-medium text-white shadow-md shadow-metarh-medium/20' : 'text-gray-500 hover:bg-gray-50 hover:text-metarh-medium'}`}
          >
            <Layers size={22} className={`transition-transform group-hover:scale-110 ${view === 'catalog' ? '' : 'text-gray-400 group-hover:text-metarh-medium'}`} />
            <span className="hidden lg:block ml-3 font-medium">Catálogo</span>
          </button>

          <button
            onClick={() => {
              setView('calculator');
              setActiveCalculator(null); // Reset to dashboard
            }}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${view === 'calculator' ? 'bg-metarh-medium text-white shadow-md shadow-metarh-medium/20' : 'text-gray-500 hover:bg-gray-50 hover:text-metarh-medium'}`}
          >
            <Calculator size={22} className={`transition-transform group-hover:scale-110 ${view === 'calculator' ? '' : 'text-gray-400 group-hover:text-metarh-medium'}`} />
            <span className="hidden lg:block ml-3 font-medium">Calculadoras</span>
          </button>

          {currentUser.isAdmin && (
            <button
              onClick={() => setView('layout-editor')}
              className="w-full flex items-center p-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-metarh-medium transition-all duration-200 group"
            >
              <Layout size={22} className="text-gray-400 group-hover:text-metarh-medium transition-transform group-hover:scale-110" />
              <span className="hidden lg:block ml-3 font-medium">Layout Proposta</span>
            </button>
          )}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="hidden lg:block px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Histórico</p>
            {proposalHistory.length === 0 ? (
              <div className="hidden lg:block px-3 py-4 text-sm text-gray-400 italic text-center bg-gray-50 rounded-lg mx-2 border border-dashed border-gray-200">
                Nenhuma proposta recente
              </div>
            ) : (
              <div className="space-y-1">
                {proposalHistory.slice(0, 3).map((prop) => (
                  <button
                    key={prop.id}
                    className="w-full flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-metarh-medium transition-colors text-left group"
                  >
                    <FileDown size={18} className="text-gray-400 group-hover:text-metarh-medium min-w-[18px]" />
                    <div className="hidden lg:block ml-3 overflow-hidden">
                      <p className="text-sm font-medium truncate">{prop.clientName}</p>
                      <p className="text-xs text-gray-400">{new Date(prop.createdAt).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group" onClick={() => setIsProfileModalOpen(true)}>
            <div className="relative">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-metarh-medium transition-colors"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden lg:block ml-3 overflow-hidden">
              <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser.role}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            {currentUser.isAdmin && (
              <>
                <button
                  onClick={() => setIsUserManagementOpen(true)}
                  className="flex-1 p-2 text-gray-400 hover:text-metarh-medium hover:bg-white rounded-lg transition-all"
                  title="Gerenciar Usuários"
                >
                  <Shield size={18} className="mx-auto" />
                </button>
                <button
                  onClick={() => setIsAppSettingsModalOpen(true)}
                  className="flex-1 p-2 text-gray-400 hover:text-metarh-medium hover:bg-white rounded-lg transition-all"
                  title="Configurar Valores"
                >
                  <Settings size={18} className="mx-auto" />
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
              title="Sair"
            >
              <LogOut size={18} className="mx-auto" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-20 lg:ml-64 transition-all duration-300 flex flex-col h-screen overflow-hidden`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-metarh-medium transition-colors" size={20} />
              <input
                type="text"
                placeholder="Buscar soluções, serviços ou pacotes..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent focus:bg-white focus:border-metarh-medium focus:ring-4 focus:ring-metarh-medium/10 rounded-xl transition-all outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            <SupabaseStatus />
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 bg-metarh-medium/10 px-4 py-2 rounded-full border border-metarh-medium/20">
              <ShoppingBag size={20} className="text-metarh-medium" />
              <span className="font-bold text-metarh-dark">{cartCount}</span>
              <span className="text-sm text-gray-600 hidden sm:inline">itens selecionados</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-24">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{greeting}, {currentUser.name.split(' ')[0]}!</h1>
              <p className="text-gray-500 mt-1">Explore nosso catálogo de soluções e crie propostas incríveis.</p>
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
                  const isExpanded = expandedGroups[group] ?? true; // Default expanded

                  return (
                    <div key={group} className="animate-slide-up">
                      <div
                        className="flex items-center gap-3 mb-6 cursor-pointer group select-none"
                        onClick={() => toggleGroup(group)}
                      >
                        <div className={`p-2 rounded-lg ${theme.color} shadow-lg shadow-metarh-medium/20 transition-transform group-hover:scale-110`}>
                          <PackageIcon name={group} className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 group-hover:text-metarh-medium transition-colors">{group}</h2>
                        <div className="flex-1 h-px bg-gray-200 group-hover:bg-metarh-medium/30 transition-colors"></div>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>

                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {groupedSolutions[group].map(solution => {
                            const inCart = cart.find(item => item.solution.id === solution.id);
                            return (
                              <div
                                key={solution.id}
                                className={`bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl group relative overflow-hidden flex flex-col ${inCart ? 'border-metarh-medium ring-1 ring-metarh-medium' : 'border-gray-100 hover:border-metarh-medium/30'}`}
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-colors group-hover:from-metarh-medium/5"></div>

                                <div className="mb-4 relative">
                                  <div className="flex justify-between items-start">
                                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 mb-3 group-hover:bg-metarh-medium/10 group-hover:text-metarh-dark transition-colors`}>
                                      {solution.code}
                                    </div>
                                    {inCart && (
                                      <span className="bg-metarh-medium text-white text-xs font-bold px-2 py-1 rounded-full animate-fade-in shadow-sm">
                                        Selecionado
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-metarh-medium transition-colors">{solution.name}</h3>
                                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 h-[60px]">{solution.description}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-3 relative z-10">
                                  <button
                                    onClick={() => setSelectedSolution(solution)}
                                    className="p-2 text-gray-400 hover:text-metarh-medium hover:bg-metarh-medium/5 rounded-lg transition-colors"
                                    title="Ver detalhes"
                                  >
                                    <Info size={20} />
                                  </button>

                                  {inCart ? (
                                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                      <button
                                        onClick={() => updateQuantity(solution.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors font-bold"
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm font-bold text-gray-800">{inCart.quantity}</span>
                                      <button
                                        onClick={() => updateQuantity(solution.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-metarh-medium transition-colors font-bold"
                                      >
                                        +
                                      </button>
                                      <button
                                        onClick={() => removeFromCart(solution.id)}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 border-l border-gray-200 transition-colors"
                                        title="Remover"
                                      >
                                        <LogOut size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => addToCart(solution)}
                                      className="flex-1 bg-gray-900 hover:bg-metarh-medium text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gray-200 hover:shadow-metarh-medium/30 flex items-center justify-center gap-2"
                                    >
                                      <Plus size={16} /> Adicionar
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
          </div>
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 animate-slide-up">
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
          onAddToCart={() => {
            addToCart(selectedSolution);
            setSelectedSolution(null);
          }}
        />
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onUpdateUser={handleUpdateUser}
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

      <SolutionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onUpdateSelections={updateSelections}
      />

      <AppSettingsModal
        isOpen={isAppSettingsModalOpen}
        onClose={() => setIsAppSettingsModalOpen(false)}
      />

      <ChatBot />
    </div>
  );
};

export default App;
