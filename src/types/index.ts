export interface Document {
  id: string;
  fileName: string;
  fileSize: string;
  category: string;
  status: 'processing' | 'completed' | 'error';
  geminiAnalysis: number;
  supplier: string;
  amount: string;
  client: string;
  documentDate: string;
  invoiceNumber?: string;
  cui?: string;
  description: string;
  aiInsights: string[];
  recommendations: string[];
  generatedTransactions: Transaction[];
  uploadedAt: Date;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  documentId?: string;
}

export interface BankReconciliation {
  id: string;
  bankTransaction: BankTransaction;
  matchedDocuments: Document[];
  status: 'matched' | 'unmatched' | 'partial';
  variance?: number;
}

export interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  balance: number;
  reference: string;
}