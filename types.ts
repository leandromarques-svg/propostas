
export interface SolutionData {
  id: string;
  code: string;
  solutionPackage: string; // The parent solution (e.g., Business, Tech Recruiter)
  name: string; // The specific service name (e.g., Hunting, Assessment)
  description: string;
  benefits: string[];
  publicNeeds: string[];
  areasInvolved: string[];
  toolsUsed: string[];
  laborType: string;
  sla: string;
  aboutSolution: string; // About the parent solution package
}

export type ViewState = 'catalog' | 'proposal';

export interface CartSelections {
  benefits: string[];
  publicNeeds: string[];
  toolsUsed: string[];
  notes?: string;
}

export interface CartItem {
  solution: SolutionData;
  selections: CartSelections;
}

export interface SavedProposal {
  id: string;
  clientName: string;
  date: string;
  itemsCount: number;
  totalSla: string; // A summary or range
  consultantName: string;
}

export interface User {
  id: string;
  username?: string; // Mantido para compatibilidade, mas usaremos email no login
  password?: string; // Não usado no frontend com Supabase (segurança)
  name: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  linkedin: string;
  avatarUrl?: string;
  isAdmin?: boolean; // Master user flag
}
