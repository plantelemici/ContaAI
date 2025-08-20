export interface Contract {
  id: string;
  number: string;
  title: string;
  clientId: string;
  clientName: string;
  supplierId?: string;
  supplierName?: string;
  type: 'service' | 'supply' | 'maintenance' | 'consulting' | 'other';
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  value: number;
  currency: string;
  paymentTerms: string;
  description: string;
  terms: string[];
  deliverables: string[];
  milestones: ContractMilestone[];
  attachments: ContractAttachment[];
  linkedInvoices: string[]; // Invoice IDs
  createdAt: Date;
  updatedAt: Date;
  geminiAnalysis: ContractAnalysis;
}

export interface ContractMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  value: number;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  invoiceId?: string;
}

export interface ContractAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedAt: Date;
}

export interface ContractAnalysis {
  confidence: number;
  extractedData: {
    parties: string[];
    obligations: string[];
    paymentTerms: string[];
    deliverables: string[];
    penalties: string[];
    terminationClauses: string[];
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };
  keyDates: {
    startDate?: Date;
    endDate?: Date;
    paymentDates: Date[];
    milestones: Date[];
  };
  insights: string[];
  warnings: string[];
}