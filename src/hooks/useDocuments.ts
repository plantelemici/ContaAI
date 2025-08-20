import { useState, useCallback } from 'react';
import { Document, Transaction } from '../types';
import { analyzeDocument, GeminiAnalysis } from '../services/geminiService';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processDocument = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    const newDocument: Document = {
      id: Date.now().toString(),
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      category: '',
      status: 'processing',
      geminiAnalysis: 0,
      supplier: '',
      amount: '',
      client: '',
      documentDate: '',
      description: '',
      aiInsights: [],
      recommendations: [],
      generatedTransactions: [],
      uploadedAt: new Date()
    };

    setDocuments(prev => [...prev, newDocument]);

    try {
      const analysis: GeminiAnalysis = await analyzeDocument(file);
      
      // Generate transaction from analysis
      const generatedTransaction: Transaction = {
        id: `${newDocument.id}-tx-1`,
        description: analysis.description,
        amount: parseAmount(analysis.amount),
        type: categorizeTransactionType(analysis.category),
        category: analysis.category,
        date: parseDate(analysis.documentDate) || new Date(),
        documentId: newDocument.id
      };

      const updatedDocument: Document = {
        ...newDocument,
        category: analysis.category,
        status: 'completed',
        geminiAnalysis: analysis.confidence,
        supplier: analysis.supplier,
        amount: analysis.amount,
        client: analysis.client,
        documentDate: analysis.documentDate,
        invoiceNumber: analysis.invoiceNumber,
        cui: analysis.cui,
        description: analysis.description,
        aiInsights: analysis.insights,
        recommendations: analysis.recommendations,
        generatedTransactions: [generatedTransaction]
      };

      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id ? updatedDocument : doc
      ));

      setTransactions(prev => [...prev, generatedTransaction]);
      
    } catch (error) {
      console.error('Eroare la procesarea documentului:', error);
      setDocuments(prev => prev.map(doc => 
        doc.id === newDocument.id ? { ...doc, status: 'error' } : doc
      ));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    documents,
    transactions,
    isProcessing,
    processDocument
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

const categorizeTransactionType = (category: string): 'income' | 'expense' => {
  const incomeCategories = ['servicii', 'consultanta', 'vanzari'];
  return incomeCategories.some(cat => 
    category.toLowerCase().includes(cat)
  ) ? 'income' : 'expense';
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