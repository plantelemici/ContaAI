import { useState, useCallback } from 'react';
import { BankTransaction, BankReconciliation, BankStatement, ReconciliationSummary } from '../types/banking';
import { Document, Transaction } from '../types';
import { Invoice } from '../types/accounting';
import { analyzeBankStatement, BankStatementGeminiAnalysis } from '../services/bankingService';

export const useBankReconciliation = (documents: Document[], transactions: Transaction[], invoices: Invoice[]) => {
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processBankStatement = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    const newStatement: BankStatement = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      bankName: '',
      accountNumber: '',
      statementPeriod: {
        startDate: new Date(),
        endDate: new Date()
      },
      transactions: [],
      uploadedAt: new Date(),
      status: 'processing',
      totalTransactions: 0,
      openingBalance: 0,
      closingBalance: 0
    };

    setBankStatements(prev => [...prev, newStatement]);

    try {
      const analysis: BankStatementGeminiAnalysis = await analyzeBankStatement(file);
      
      // Convert analyzed transactions to BankTransaction objects
      const processedTransactions: BankTransaction[] = analysis.transactions.map((tx, index) => ({
        id: `${newStatement.id}-tx-${index}`,
        date: parseDate(tx.date) || new Date(),
        description: tx.description,
        amount: parseAmount(tx.amount),
        balance: parseAmount(tx.balance),
        reference: tx.reference,
        type: tx.type,
        category: tx.category,
        counterparty: tx.counterparty,
        iban: tx.iban,
        uploadedAt: new Date(),
        status: 'completed',
        geminiAnalysis: analysis.confidence,
        aiInsights: analysis.insights,
        recommendations: analysis.recommendations
      }));

      const updatedStatement: BankStatement = {
        ...newStatement,
        bankName: analysis.bankName,
        accountNumber: analysis.accountNumber,
        statementPeriod: {
          startDate: parseDate(analysis.statementPeriod.startDate) || new Date(),
          endDate: parseDate(analysis.statementPeriod.endDate) || new Date()
        },
        transactions: processedTransactions,
        status: 'completed',
        totalTransactions: processedTransactions.length,
        openingBalance: parseAmount(analysis.openingBalance),
        closingBalance: parseAmount(analysis.closingBalance)
      };

      setBankStatements(prev => prev.map(stmt => 
        stmt.id === newStatement.id ? updatedStatement : stmt
      ));

      setBankTransactions(prev => [...prev, ...processedTransactions]);

      // Auto-reconcile transactions
      autoReconcileTransactions(processedTransactions);
      
    } catch (error) {
      console.error('Eroare la procesarea extrasului bancar:', error);
      setBankStatements(prev => prev.map(stmt => 
        stmt.id === newStatement.id ? { ...stmt, status: 'error' } : stmt
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [documents, transactions, invoices]);

  const autoReconcileTransactions = useCallback((bankTxs: BankTransaction[]) => {
    const newReconciliations: BankReconciliation[] = [];

    bankTxs.forEach(bankTx => {
      const matchedDocs: string[] = [];
      const matchedInvoices: string[] = [];
      let confidence = 0;

      // Try to match with documents
      documents.forEach(doc => {
        const docAmount = parseAmount(doc.amount);
        const amountMatch = Math.abs(Math.abs(bankTx.amount) - docAmount) < 1; // 1 RON tolerance
        const dateMatch = isDateClose(bankTx.date, parseDate(doc.documentDate));
        const descriptionMatch = (bankTx.description ?? '').toLowerCase().includes((doc.supplier ?? '').toLowerCase()) ||
                                (doc.supplier ?? '').toLowerCase().includes((bankTx.counterparty ?? '').toLowerCase());

        if (amountMatch && (dateMatch || descriptionMatch)) {
          matchedDocs.push(doc.id);
          confidence += 30;
        }
      });

      // Try to match with invoices
      invoices.forEach(invoice => {
        const amountMatch = Math.abs(bankTx.amount - invoice.total) < 1;
        const dateMatch = isDateClose(bankTx.date, invoice.dueDate);
        const clientMatch = (bankTx.description ?? '').toLowerCase().includes((invoice.client.name ?? '').toLowerCase()) ||
                           (invoice.client.name ?? '').toLowerCase().includes((bankTx.counterparty ?? '').toLowerCase());

        if (amountMatch && (dateMatch || clientMatch)) {
          matchedInvoices.push(invoice.id);
          confidence += 40;
        }
      });

      // Try to match with existing transactions
      transactions.forEach(tx => {
        const amountMatch = Math.abs(Math.abs(bankTx.amount) - tx.amount) < 1;
        const dateMatch = isDateClose(bankTx.date, tx.date);
        const descriptionMatch = (bankTx.description ?? '').toLowerCase().includes((tx.description ?? '').toLowerCase());

        if (amountMatch && (dateMatch || descriptionMatch)) {
          confidence += 25;
        }
      });

      const status = confidence > 70 ? 'matched' : 
                    confidence > 40 ? 'partial' : 'unmatched';

      const reconciliation: BankReconciliation = {
        id: `rec-${bankTx.id}`,
        bankTransaction: bankTx,
        matchedDocuments: matchedDocs,
        matchedInvoices: matchedInvoices,
        status,
        variance: 0,
        reconciliationDate: new Date(),
        confidence
      };

      newReconciliations.push(reconciliation);
    });

    setReconciliations(prev => [...prev, ...newReconciliations]);
  }, [documents, transactions, invoices]);

  const manualReconcile = useCallback((reconciliationId: string, documentIds: string[], invoiceIds: string[]) => {
    setReconciliations(prev => prev.map(rec => 
      rec.id === reconciliationId 
        ? { 
            ...rec, 
            matchedDocuments: documentIds,
            matchedInvoices: invoiceIds,
            status: 'manual',
            reconciliationDate: new Date(),
            confidence: 100
          }
        : rec
    ));
  }, []);

  const getReconciliationSummary = useCallback((): ReconciliationSummary => {
    const totalBankTransactions = bankTransactions.length;
    const matchedTransactions = reconciliations.filter(r => r.status === 'matched').length;
    const unmatchedTransactions = reconciliations.filter(r => r.status === 'unmatched').length;
    const partialMatches = reconciliations.filter(r => r.status === 'partial').length;
    const totalVariance = reconciliations.reduce((sum, r) => sum + (r.variance || 0), 0);
    const reconciliationRate = totalBankTransactions > 0 ? (matchedTransactions / totalBankTransactions) * 100 : 0;

    return {
      totalBankTransactions,
      matchedTransactions,
      unmatchedTransactions,
      partialMatches,
      totalVariance,
      reconciliationRate
    };
  }, [bankTransactions, reconciliations]);

  return {
    bankStatements,
    bankTransactions,
    reconciliations,
    isProcessing,
    processBankStatement,
    manualReconcile,
    getReconciliationSummary
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
  if (!amountStr) return 0;
  const numberMatch = amountStr.replace(/[^\d.,-]/g, '').replace(',', '.');
  return parseFloat(numberMatch) || 0;
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const formats = [
    /(\d{2})\.(\d{2})\.(\d{4})/,
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{2})\/(\d{2})\/(\d{4})/
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[1]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
  }
  
  return null;
};

const isDateClose = (date1: Date, date2: Date | null, daysTolerance: number = 7): boolean => {
  if (!date2) return false;
  const diffTime = Math.abs(date1.getTime() - date2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysTolerance;
};