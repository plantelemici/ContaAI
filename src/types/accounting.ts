export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cui: string;
  regCom: string;
  iban: string;
  bank: string;
  createdAt: Date;
  totalInvoiced: number;
  totalPaid: number;
  status: 'active' | 'inactive';
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cui: string;
  regCom: string;
  iban: string;
  bank: string;
  createdAt: Date;
  totalPurchased: number;
  totalPaid: number;
  status: 'active' | 'inactive';
  category: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  paymentTerms: number;
  currency: string;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
  productId?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  unitPrice: number;
  vatRate: number;
  stock: number;
  minStock: number;
  unit: string;
  supplier?: string;
  createdAt: Date;
  status: 'active' | 'inactive';
}

export interface TaxReport {
  id: string;
  period: string;
  type: 'monthly' | 'quarterly' | 'annual';
  totalIncome: number;
  totalExpenses: number;
  vatCollected: number;
  vatPaid: number;
  netVat: number;
  profitBeforeTax: number;
  incomeTax: number;
  netProfit: number;
  generatedAt: Date;
  status: 'draft' | 'submitted';
}

export interface BankAccount {
  id: string;
  name: string;
  iban: string;
  bank: string;
  currency: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit';
  isDefault: boolean;
  createdAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  period: string;
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  status: 'active' | 'completed' | 'exceeded';
  createdAt: Date;
}

export interface BudgetCategory {
  category: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
}

export interface CompanySettings {
  name: string;
  cui: string;
  regCom: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  vatRate: number;
  currency: string;
  fiscalYear: string;
  invoicePrefix: string;
  invoiceCounter: number;
  contactPerson: string;
  bankAccount: string;
  bankName: string;
  activityCode: string;
  employees: number;
  foundedYear: number;
  legalForm: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  type: 'question' | 'analysis' | 'report';
}

export interface CompanyProfile {
  id: string;
  settings: CompanySettings;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalInvoices: number;
  totalProducts: number;
  totalTransactions: number;
  lastActivity: Date;
  createdAt: Date;
}