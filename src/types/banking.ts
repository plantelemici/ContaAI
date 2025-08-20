export interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  balance: number;
  reference: string;
  type: 'debit' | 'credit';
  category?: string;
  counterparty?: string;
  iban?: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  geminiAnalysis: number;
  aiInsights: string[];
  recommendations: string[];
}

export interface BankReconciliation {
  id: string;
  bankTransaction: BankTransaction;
  matchedDocuments: string[]; // Document IDs
  matchedInvoices: string[]; // Invoice IDs
  status: 'matched' | 'unmatched' | 'partial' | 'manual';
  variance?: number;
  reconciliationDate: Date;
  notes?: string;
  confidence: number;
}

export interface BankStatement {
  id: string;
  fileName: string;
  fileSize: string;
  bankName: string;
  accountNumber: string;
  statementPeriod: {
    startDate: Date;
    endDate: Date;
  };
  transactions: BankTransaction[];
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  totalTransactions: number;
  openingBalance: number;
  closingBalance: number;
}

export interface ReconciliationSummary {
  totalBankTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  partialMatches: number;
  totalVariance: number;
  reconciliationRate: number;
}