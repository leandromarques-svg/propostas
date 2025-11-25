
import React, { useState, useMemo, useEffect } from 'react';
import { Logo } from './components/Logo';
import { SOLUTIONS_DATA } from './constants'; // Removed USERS import
import { SolutionData, ViewState, CartItem, CartSelections, User, SavedProposal } from './types';
import { DetailModal } from './components/DetailModal';
import { ProposalView } from './components/ProposalView';
import { LoginScreen } from './components/LoginScreen';
import { ProfileModal } from './components/ProfileModal';
import { UserManagementModal } from './components/UserManagementModal';
import { SolutionSummaryModal } from './components/SolutionSummaryModal';
import { ChatBot } from './components/ChatBot';
import { Search, ShoppingBag, Plus, Edit3, ChevronDown, ChevronUp, Layers, Download, LogOut, User as UserIcon, Shield, BookOpen, Info, FileDown, Briefcase, Stethoscope, Users, Star, Cpu, Map, Store, Crown, Zap, Filter, ArrowDown } from 'lucide-react';
import { supabase } from './lib/supabase';

// Package Themes Helper - Updated to use Standard METARH Colors (MIV) & Specific Flat Icons
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

// Helper function to get greeting message based on time of day
const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Bom dia';
    if (hours >= 12 && hours < 18) return 'Boa tarde';
    return 'Boa noite';
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]); // We will fetch this if admin
  const [view, setView] = useState<ViewState>('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [proposalHistory, setProposalHistory] = useState<SavedProposal[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<SolutionData | null>(null);
  
  // Transition State
  const [isLoginExiting, setIsLoginExiting] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedSummaryPackage, setSelectedSummaryPackage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Derived state: Group solutions by package
  const groupedSolutions = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    
    // Filter first
    const filtered = SOLUTIONS_DATA.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      s.description.toLowerCase().includes(lower) ||
      s.solutionPackage.toLowerCase().includes(lower)
    );

    // Then group
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

  // Check for active session on load
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchUserProfile(session.user.id, session.user.email || '');
        }
        setIsLoadingAuth(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
            await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
            setCurrentUser(null);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
      try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (data) {
              setCurrentUser({
                  id: data.id,
                  name: data.full_name || 'Usuário',
                  email: data.email || email,
                  role: data.role || 'Consultor',
                  bio: data.bio || '',
                  phone: data.phone || '',
                  linkedin: data.linkedin || '',
                  avatarUrl: data.avatar_url || '',
                  isAdmin: data.is_admin || false,
                  username: email // fallback
              });
          } else {
              // First time login, profile might not exist yet
              const newUser: User = {
                  id: userId,
                  name: 'Novo Usuário',
                  email: email,
                  role: 'Consultor',
                  bio: '',
                  phone: '',
                  linkedin: '',
                  isAdmin: false,
                  username: email
              };
              setCurrentUser(newUser);
              // Optional: Create profile entry
          }
      } catch (err) {
          console.error("Erro ao buscar perfil:", err);
      }
  };

  // Auto-expand groups when searching
  useEffect(() => {
    if (searchTerm) {
      const allOpen = groupKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {});
      setExpandedGroups(allOpen);
    }
  }, [searchTerm, groupKeys]); 

  // Handlers
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCart([]);
    setView('catalog');
  };

  const handleUpdateProfile = async (updatedUser: User) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: updatedUser.id,
                full_name: updatedUser.name,
                role: updatedUser.role,
                bio: updatedUser.bio,
                phone: updatedUser.phone,
                linkedin: updatedUser.linkedin,
                email: updatedUser.email,
                avatar_url: updatedUser.avatarUrl
            });

        if (error) throw error;

        setCurrentUser(updatedUser);
        alert("Perfil atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("Erro ao salvar perfil. Tente novamente.");
    }
  };

  // Admin User Management Handlers (Simplified for Supabase)
  // Note: Creating new users programmatically usually requires Service Role (Backend)
  // For this demo, we will assume users are created via the App (SignUp) or Dashboard
  // We can however list users from the profiles table if we set up RLS correctly
  const fetchAllUsers = async () => {
      if (!currentUser?.isAdmin) return;
      const { data } = await supabase.from('profiles').select('*');
      if (data) {
          const mappedUsers: User[] = data.map(p => ({
              id: p.id,
              name: p.full_name,
              email: p.email,
              role: p.role,
              bio: p.bio,
              phone: p.phone,
              linkedin: p.linkedin,
              avatarUrl: p.avatar_url,
              isAdmin: p.is_admin,
              username: p.email
          }));
          setAllUsers(mappedUsers);
      }
  };

  useEffect(() => {
      if (isUserManagementOpen) {
          fetchAllUsers();
      }
  }, [isUserManagementOpen]);

  // Placeholder handlers for User Management Modal
  const handleCreateUser = (newUser: User) => {
      alert("Para criar novos usuários, utilize o painel do Supabase ou a tela de cadastro.");
  };

  const handleUpdateUser = (updatedUser: User) => {
      // Admin updating other users
      // This requires RLS policy allowing admin to update others
      alert("Funcionalidade de edição de terceiros requer configuração avançada de backend.");
  };

  const handleDeleteUser = (userId: string) => {
      alert("Funcionalidade de exclusão requer configuração avançada de backend.");
  };

  const handleOpenDetail = (solution: SolutionData) => {
    setSelectedSolution(solution);
    setIsModalOpen(true);
  };

  // Quick Add handler (skip modal)
  const handleQuickAdd = (solution: SolutionData) => {
    const defaultSelections: CartSelections = {
        benefits: [...solution.benefits],
        publicNeeds: [...solution.publicNeeds],
        toolsUsed: [...solution.toolsUsed],
        notes: ''
    };
    addToCart(solution, defaultSelections);
  };

  const addToCart = (solution: SolutionData, selections: CartSelections) => {
    setCart(prev => {
      const existing = prev.findIndex(item => item.solution.id === solution.id);
      if (existing >= 0) {
        // Update existing
        const newCart = [...prev];
        newCart[existing] = { solution, selections };
        return newCart;
      }
      // Add new
      return [...prev, { solution, selections }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.solution.id !== id));
  };

  const handleSaveToHistory = (proposal: SavedProposal) => {
    setProposalHistory(prev => [proposal, ...prev]);
  };

  const getExistingSelections = (solutionId: string): CartSelections | undefined => {
    return cart.find(c => c.solution.id === solutionId)?.selections;
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleScrollToSection = (packageKey: string) => {
    // Expand the group first if needed
    setExpandedGroups(prev => ({ ...prev, [packageKey]: true }));
    
    // Scroll
    setTimeout(() => {
        const element = document.getElementById(`section-${packageKey}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
  };

  const handleDownloadPresentation = (packageKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Não existe um arquivo para download, por favor, solicite essa apresentação ao time de Marketing");
  };

  const handleOpenSummary = (packageKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSummaryPackage(packageKey);
    setIsSummaryModalOpen(true);
  };

  if (isLoadingAuth) {
      return <div className="min-h-screen flex items-center justify-center bg-metarh-dark"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>;
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={() => {}} isExiting={isLoginExiting} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      
      {/* Abstract Background Shapes (Blobs) */}
      <div className="blob-shape bg-metarh-medium w-96 h-96 rounded-full top-[-100px] left-[-100px] mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="blob-shape bg-metarh-pink w-96 h-96 rounded-full bottom-[-100px] right-[-100px] mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView('catalog')}>
            <Logo />
          </div>
          
          <div className="flex items-center gap-6">
             
             {/* User Profile Summary - Friendly & Visual */}
             <div className="hidden md:flex items-center gap-3 mr-2 relative">
                <div 
                    className="flex items-baseline gap-1 text-sm cursor-pointer group"
                    onClick={() => setIsProfileModalOpen(true)}
                    title="Editar Perfil"
                >
                     <span className="text-gray-500 font-medium">{greeting},</span>
                     <span className="text-metarh-dark font-bold text-base group-hover:text-metarh-medium transition-colors">{currentUser.name}</span>
                </div>
                
                <div className="relative group-avatar">
                    <div 
                        className="w-9 h-9 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-all"
                        onClick={() => setIsProfileModalOpen(true)}
                    >
                        {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-metarh-medium flex items-center justify-center text-white font-bold">
                                {currentUser.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Admin Crown - Clickable to open Management */}
                    {currentUser.isAdmin && (
                        <button
                            onClick={() => setIsUserManagementOpen(true)}
                            className="absolute -top-3 -right-2 w-6 h-6 hover:scale-110 transition-transform cursor-pointer drop-shadow-md z-10 bg-white rounded-full p-0.5 flex items-center justify-center"
                            title="Gerenciar Equipe (Admin)"
                        >
                            <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                        </button>
                    )}
                </div>
             </div>

             <button 
               onClick={() => setView('proposal')}
               className="relative group flex items-center gap-3 px-5 py-2.5 bg-metarh-dark text-white rounded-full transition-all hover:bg-metarh-medium shadow-md"
             >
               <ShoppingBag size={18} />
               <span className="font-medium hidden sm:inline">Minhas Propostas</span>
               {cartCount > 0 && (
                 <span className="absolute -top-2 -right-2 bg-metarh-lime text-metarh-dark w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full shadow-sm animate-bounce">
                   {cartCount}
                 </span>
               )}
             </button>

             <button 
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Sair"
             >
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto z-10 relative">
        {view === 'catalog' ? (
          <div className="p-4 md:p-8 space-y-8 animate-fade-in pb-32">
            
            {/* Hero Wrapper for Stacked Tabs */}
            <div className="relative mb-12">
                {/* Hero Section */}
                <div className="bg-metarh-dark rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl min-h-[400px] flex flex-col justify-center z-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-metarh-medium rounded-full mix-blend-screen opacity-30 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    
                    {/* Custom Graphic Image */}
                    <div className="absolute top-8 right-8 bottom-8 w-[50%] pointer-events-none hidden md:block opacity-90">
                        <img 
                            src="https://metarh.com.br/wp-content/uploads/2025/11/Executivos-grafismo.png" 
                            alt="Executivos METARH" 
                            className="w-full h-full object-contain object-right"
                        />
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                        <span className="text-metarh-lime text-2xl md:text-4xl block mt-2">
                            Vamos construir uma proposta incrível hoje, <span className="text-white font-extrabold">{currentUser.name.split(' ')[0]}</span>?
                        </span>
                        </h1>
                        <p className="text-2xl text-gray-200 mb-8 font-light leading-relaxed">
                        Explore nossa <strong className="font-bold text-white">árvore de soluções</strong> e personalize cada item para criar propostas exclusivas para nossos clientes.
                        </p>

                        <div className="relative rounded-full shadow-lg max-w-xl">
                        <input 
                            type="text" 
                            placeholder="Busque por serviços ou soluções (ex: Hunting, R&S, Tech)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-full text-gray-800 focus:ring-2 focus:ring-metarh-pink outline-none placeholder-gray-400 transition-all shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Drawer Tabs (Navigation) */}
                {groupKeys.length > 0 && !searchTerm && (
                    <div className="absolute top-full left-0 right-0 -mt-8 pt-8 px-8 flex justify-center z-10 overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex items-start gap-2">
                            {groupKeys.map((key, index) => {
                                const theme = getPackageTheme(key);
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleScrollToSection(key)}
                                        className="flex items-center gap-2 bg-white px-5 py-3 rounded-b-2xl shadow-md border-x border-b border-gray-100 hover:bg-gray-50 hover:pt-5 hover:pb-4 transition-all duration-300 transform hover:shadow-lg group whitespace-nowrap opacity-0 animate-slide-down-stagger"
                                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                                    >
                                        <div className={`p-1 rounded-full ${theme.color}`}>
                                            <PackageIcon name={key} size={14} className="text-white" />
                                        </div>
                                        <span className="font-bold text-metarh-dark text-sm group-hover:text-metarh-medium">{key}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Grouped Lists */}
            <div className="flex flex-col gap-6 pt-6">
              {groupKeys.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">Nenhuma solução encontrada para "{searchTerm}".</p>
                  <button 
                      onClick={() => setSearchTerm('')} 
                      className="mt-4 text-metarh-medium hover:underline font-medium"
                  >
                      Limpar busca
                  </button>
                </div>
              ) : (
                groupKeys.map(packageKey => {
                    const solutions = groupedSolutions[packageKey];
                    const packageDescription = solutions[0]?.aboutSolution;
                    const isExpanded = expandedGroups[packageKey] || false;
                    const itemsInCartCount = solutions.filter(s => cart.some(c => c.solution.id === s.id)).length;
                    const theme = getPackageTheme(packageKey);

                    return (
                        <section id={`section-${packageKey}`} key={packageKey} className="animate-slide-up group w-full scroll-mt-28">
                            <div 
                              className={`bg-white rounded-[2.5rem] shadow-sm border transition-all duration-300 overflow-hidden w-full flex flex-col
                                ${isExpanded ? `border-metarh-medium shadow-md ring-1 ring-metarh-medium/20` : 'border-gray-100 hover:border-gray-300'}
                              `}
                            >
                                {/* Header Toggle - List Style */}
                                <div 
                                  onClick={() => toggleGroup(packageKey)}
                                  className="w-full text-left p-6 md:px-8 cursor-pointer bg-white relative hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                                        
                                        {/* Icon & Title Area */}
                                        <div className="flex items-center gap-6 flex-1 pr-16 md:pr-0">
                                           <div className={`p-3 md:p-4 rounded-3xl shrink-0 transition-colors duration-300 ${theme.color} w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-lg shadow-purple-100`}>
                                              <PackageIcon name={packageKey} className="text-white" size={32} />
                                           </div>
                                           <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-bold text-metarh-dark">
                                                    {packageKey}
                                                </h2>
                                                {itemsInCartCount > 0 && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-metarh-lime text-metarh-dark rounded-full">
                                                    {itemsInCartCount} selecionado(s)
                                                    </span>
                                                )}
                                              </div>
                                              <p className="text-black font-medium text-sm mt-1 leading-relaxed max-w-3xl">
                                                  {packageDescription}
                                              </p>
                                           </div>
                                        </div>

                                        {/* Action Toolbar & Expansion */}
                                        <div className="flex items-center gap-4 self-end md:self-auto">
                                             <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => handleOpenSummary(packageKey, e)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-full text-purple-50 hover:bg-gray-200 hover:text-metarh-dark transition-all"
                                                    title="Resumo Prático Comercial"
                                                >
                                                    <Info size={18} className="text-purple-500 hover:text-metarh-dark" />
                                                </button>
                                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                                <button
                                                    onClick={(e) => handleDownloadPresentation(packageKey, e)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-full text-purple-50 hover:bg-purple-100 hover:text-metarh-medium transition-all"
                                                    title="Baixar apresentação"
                                                >
                                                    <FileDown size={18} className="text-purple-500 hover:text-metarh-medium"/>
                                                </button>
                                             </div>
                                             
                                             <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border
                                                ${isExpanded ? 'bg-metarh-medium text-white border-metarh-medium rotate-180' : 'bg-white text-gray-400 border-gray-200 hover:border-metarh-medium hover:text-metarh-medium'}
                                             `}>
                                                <ChevronDown size={20} />
                                             </div>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Service Count */}
                                    <div className="md:hidden mt-2 text-xs text-gray-400 pl-[4.5rem]">
                                        {solutions.length} serviços disponíveis
                                    </div>
                                </div>
                                
                                {/* Expanded Content */}
                                {isExpanded && (
                                  <div className="border-t border-gray-100 bg-gray-50/50 flex-1">
                                      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                          {solutions.map((solution) => {
                                              const isInCart = cart.some(c => c.solution.id === solution.id);
                                              return (
                                                  <div 
                                                      key={solution.id}
                                                      className={`bg-white rounded-[2rem] p-6 shadow-sm border transition-all relative overflow-hidden group-service flex flex-col
                                                          ${isInCart ? 'border-metarh-lime ring-1 ring-metarh-lime shadow-md' : 'border-gray-100 hover:shadow-lg hover:border-metarh-medium/30 hover:-translate-y-1'}
                                                      `}
                                                  >
                                                      <div className="flex justify-between items-start mb-3 mt-1">
                                                          <h3 className="font-bold text-gray-800 text-lg leading-tight group-service-hover:text-metarh-dark">
                                                              {solution.name}
                                                          </h3>
                                                          {isInCart && <div className="text-metarh-lime bg-metarh-dark rounded-full p-1.5 shrink-0"><Edit3 size={12}/></div>}
                                                      </div>
                                                      
                                                      <p className="text-black text-sm mb-6 flex-grow leading-relaxed">
                                                          {solution.description}
                                                      </p>
                                                      
                                                      <div className="flex gap-3 mt-auto">
                                                          <button 
                                                              onClick={() => handleOpenDetail(solution)}
                                                              className="flex-1 py-2.5 px-3 border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                                          >
                                                              Detalhes
                                                          </button>
                                                          
                                                          {isInCart ? (
                                                              <button 
                                                                  onClick={() => handleOpenDetail(solution)}
                                                                  className="px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-bold hover:bg-green-100 transition-colors"
                                                              >
                                                                  Atualizar
                                                              </button>
                                                          ) : (
                                                              <button 
                                                                  onClick={() => handleQuickAdd(solution)}
                                                                  className={`px-4 py-2.5 ${theme.color} text-white rounded-full hover:opacity-90 transition-colors shadow-sm flex items-center justify-center`}
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
                                  </div>
                                )}
                            </div>
                        </section>
                    );
                })
              )}
            </div>

          </div>
        ) : (
          <ProposalView 
            cart={cart}
            user={currentUser}
            history={proposalHistory}
            onRemove={removeFromCart} 
            onBack={() => setView('catalog')}
            onSaveToHistory={handleSaveToHistory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-metarh-dark text-white py-12 mt-20 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="opacity-90 hover:opacity-100 transition-opacity">
               <Logo variant="white" />
           </div>
           <div className="text-center md:text-right">
                <p className="text-white font-medium text-lg mb-1">Feito por e para pessoas.</p>
                <a href="https://www.metarh.com.br" target="_blank" rel="noreferrer" className="text-metarh-medium hover:text-metarh-lime transition-colors text-sm">
                    www.metarh.com.br
                </a>
           </div>
        </div>
      </footer>

      {/* ChatBot */}
      {currentUser && (
        <ChatBot solutions={SOLUTIONS_DATA} userName={currentUser.name.split(' ')[0]} />
      )}

      {/* Detail Modal */}
      <DetailModal 
        solution={selectedSolution}
        initialSelections={selectedSolution ? getExistingSelections(selectedSolution.id) : undefined} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAddToProposal={(s, selections) => {
            addToCart(s, selections);
        }}
      />

      {/* Profile Modal - for editing own profile */}
      {currentUser && (
          <ProfileModal 
            user={currentUser}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onSave={handleUpdateProfile}
          />
      )}

      {/* Admin User Management Modal */}
      {currentUser && currentUser.isAdmin && (
        <UserManagementModal
            currentUser={currentUser}
            users={allUsers}
            isOpen={isUserManagementOpen}
            onClose={() => setIsUserManagementOpen(false)}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
        />
      )}

      {/* Solution Summary Modal */}
      {selectedSummaryPackage && (
        <SolutionSummaryModal
            packageKey={selectedSummaryPackage}
            solutions={groupedSolutions[selectedSummaryPackage]}
            isOpen={isSummaryModalOpen}
            onClose={() => setIsSummaryModalOpen(false)}
            theme={getPackageTheme(selectedSummaryPackage)}
        />
      )}

    </div>
  );
};

export default App;
