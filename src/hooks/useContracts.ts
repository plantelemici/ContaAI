import { useState, useCallback } from 'react';
import { Contract, ContractMilestone } from '../types/contracts';
import { analyzeContract, ContractGeminiAnalysis } from '../services/contractService';

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processContract = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    const newContract: Contract = {
      id: Date.now().toString(),
      number: `CTR-${Date.now()}`,
      title: '',
      clientId: '',
      clientName: '',
      supplierId: '',
      supplierName: '',
      type: 'other',
      status: 'draft',
      startDate: new Date(),
      endDate: new Date(),
      value: 0,
      currency: 'RON',
      paymentTerms: '',
      description: '',
      terms: [],
      deliverables: [],
      milestones: [],
      attachments: [{
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
        uploadedAt: new Date()
      }],
      linkedInvoices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      geminiAnalysis: {
        confidence: 0,
        extractedData: {
          parties: [],
          obligations: [],
          paymentTerms: [],
          deliverables: [],
          penalties: [],
          terminationClauses: []
        },
        riskAssessment: {
          level: 'medium',
          factors: [],
          recommendations: []
        },
        keyDates: {
          paymentDates: [],
          milestones: []
        },
        insights: [],
        warnings: []
      }
    };

    setContracts(prev => [...prev, newContract]);

    try {
      const analysis: ContractGeminiAnalysis = await analyzeContract(file);
      
      const updatedContract: Contract = {
        ...newContract,
        title: analysis.title,
        clientName: analysis.clientName,
        supplierName: analysis.supplierName,
        type: mapContractType(analysis.contractType),
        status: 'active',
        startDate: parseDate(analysis.startDate) || new Date(),
        endDate: parseDate(analysis.endDate) || new Date(),
        value: parseAmount(analysis.value),
        currency: analysis.currency || 'RON',
        paymentTerms: analysis.paymentTerms,
        description: analysis.description,
        terms: analysis.terms,
        deliverables: analysis.deliverables,
        updatedAt: new Date(),
        geminiAnalysis: {
          confidence: analysis.confidence,
          extractedData: {
            parties: analysis.parties,
            obligations: analysis.obligations,
            paymentTerms: [analysis.paymentTerms],
            deliverables: analysis.deliverables,
            penalties: analysis.penalties,
            terminationClauses: analysis.terminationClauses
          },
          riskAssessment: {
            level: analysis.riskLevel,
            factors: analysis.riskFactors,
            recommendations: analysis.recommendations
          },
          keyDates: {
            startDate: parseDate(analysis.startDate),
            endDate: parseDate(analysis.endDate),
            paymentDates: analysis.keyDates.map(d => parseDate(d)).filter(Boolean) as Date[],
            milestones: []
          },
          insights: analysis.insights,
          warnings: analysis.warnings
        }
      };

      setContracts(prev => prev.map(contract => 
        contract.id === newContract.id ? updatedContract : contract
      ));
      
    } catch (error) {
      console.error('Eroare la procesarea contractului:', error);
      setContracts(prev => prev.map(contract => 
        contract.id === newContract.id ? { ...contract, status: 'cancelled' } : contract
      ));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const addMilestone = useCallback((contractId: string, milestone: Omit<ContractMilestone, 'id'>) => {
    const newMilestone: ContractMilestone = {
      ...milestone,
      id: Date.now().toString()
    };

    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, milestones: [...contract.milestones, newMilestone] }
        : contract
    ));
  }, []);

  const linkInvoice = useCallback((contractId: string, invoiceId: string) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, linkedInvoices: [...contract.linkedInvoices, invoiceId] }
        : contract
    ));
  }, []);

  const updateContractStatus = useCallback((contractId: string, status: Contract['status']) => {
    setContracts(prev => prev.map(contract => 
      contract.id === contractId 
        ? { ...contract, status, updatedAt: new Date() }
        : contract
    ));
  }, []);

  return {
    contracts,
    isProcessing,
    processContract,
    addMilestone,
    linkInvoice,
    updateContractStatus
  };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const parseAmount = (amountStr: string): number => {
  const numberMatch = amountStr.match(/[\d,.-]+/);
  if (numberMatch) {
    return parseFloat(numberMatch[0].replace(',', '.'));
  }
  return 0;
};

const mapContractType = (type: string): Contract['type'] => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('servicii') || lowerType.includes('service')) return 'service';
  if (lowerType.includes('furnizare') || lowerType.includes('supply')) return 'supply';
  if (lowerType.includes('mentenanță') || lowerType.includes('maintenance')) return 'maintenance';
  if (lowerType.includes('consultanță') || lowerType.includes('consulting')) return 'consulting';
  return 'other';
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Try different date formats
  const formats = [
    /(\d{2})\.(\d{2})\.(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})\/(\d{2})\/(\d{4})/
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[1]) { // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else { // DD.MM.YYYY or DD/MM/YYYY
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
  }
  
  return null;
};