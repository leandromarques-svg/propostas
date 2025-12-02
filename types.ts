

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

export type ViewState = 'catalog' | 'proposal' | 'layout_editor' | 'calculator';

export interface CartSelections {
  benefits: string[];
  publicNeeds: string[];
  toolsUsed: string[];
  notes?: string;
}

export interface CartItem {
  solution: SolutionData;
  selections: CartSelections;
  quantity: number;
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

// --- PROPOSAL LAYOUT TYPES ---

export type VisualElementType = 'text' | 'rectangle' | 'circle' | 'image' | 'svg';

export interface VisualElement {
  id: string;
  type: VisualElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // Text content or Image Data URL
  color?: string; // Fill color
  strokeColor?: string; // Border color
  strokeWidth?: number; // Border width
  borderRadius?: number; // Corner radius (for rectangles)
  fontSize?: number;
  rotation?: number;
  zIndex: number;
}

export interface ProposalSection {
  id: string;
  title: string;
  elements: VisualElement[];
  background?: string;
}

// --- PROJECT PRICING CALCULATOR TYPES ---

export interface WeightOption {
  label: string;
  value: number;
}

export interface Position {
  id: string;
  roleName: string;
  salary: number;
  vacancies: number;
}

export interface FixedCostItem {
  id: string;
  name: string;
  cost: number;
  quantity: number;
}

export interface ProjectPricingInputs {
  // Scope - Multiple Positions
  positions: Position[];

  // Weights (Dropdown Selections)
  weight_complexity: number;
  // weight_job_level: number; // Removed
  // weight_location: number; // Removed
  // weight_work_model: number; // Removed
  // weight_urgency: number; // Removed
  // weight_profile_difficulty: number; // Removed

  // Team Costs (Inputs)
  demandedDays: number; // Alterado para receber dias
  qtyConsultant2: number; // C2
  qtyConsultant1: number; // C1
  qtyAssistant: number;   // A

  // Fixed Costs (Dynamic List)
  fixedItems: FixedCostItem[];

  // Margin
  marginMultiplier: number; // Manual input

  // FIX: Added selectedCity to the interface to match its usage in the component state.
  selectedCity: string;
}

export interface PricingResult {
  // Coefficients
  totalWeight: number;
  weightPercentage: number;
  suggestedMargin: number;

  // Operational Costs
  workingHours: number; // Horas Úteis (Dias * 9)
  teamCostTotal: number;
  fixedItemsCostTotal: number;
  totalOperationalCost: number;

  // Pricing
  adminFee: number; // Taxa Administrativa (Revenue)
  referenceSalaryTotal: number; // Salary * Vacancies

  // Taxes
  taxIss: number;
  taxPis: number;
  taxCofins: number;
  taxIrrf: number;
  taxCsll: number;
  totalTaxes: number;

  // Final
  grossNF: number; // Total Bruto NF
  retentionIR: number; // 1.5% Retention
  netLiquid: number; // Total Líquido

  // Profit Analysis
  realProfit: number; // Net Liquid - All Costs
  profitMarginPercentage: number; // (Real Profit / Net Liquid) * 100
  suggestedTeam: string; // Team suggestion based on complexity
  profitMargin: number; // Profit margin value
}