import { useState, useCallback } from 'react';
import { Supplier, Invoice, Product, TaxReport, BankAccount, Budget, CompanySettings, ChatMessage, CompanyProfile, Client } from '../types/accounting';

export const useAccounting = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: '',
    cui: '',
    regCom: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    vatRate: 19,
    currency: 'RON',
    fiscalYear: new Date().getFullYear().toString(),
    invoicePrefix: 'INV',
    invoiceCounter: 1,
    contactPerson: '',
    bankAccount: '',
    bankName: '',
    activityCode: '',
    employees: 1,
    foundedYear: new Date().getFullYear(),
    legalForm: 'SRL'
  });

  const addChatMessage = useCallback((message: string, response: string, type: ChatMessage['type'] = 'question') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      response,
      timestamp: new Date(),
      type
    };
    setChatHistory(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const addClient = useCallback((client: Omit<Client, 'id' | 'createdAt' | 'totalInvoiced' | 'totalPaid'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalInvoiced: 0,
      totalPaid: 0
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchased' | 'totalPaid'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date(),
      totalPurchased: 0,
      totalPaid: 0
    };
    setSuppliers(prev => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  }, []);

  const createInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'client'>) => {
    const client = clients.find(c => c.id === invoice.clientId) || {
      id: invoice.clientId,
      name: 'Client Necunoscut',
      email: '',
      phone: '',
      address: '',
      cui: '',
      regCom: '',
      iban: '',
      bank: '',
      createdAt: new Date(),
      totalInvoiced: 0,
      totalPaid: 0,
      status: 'active' as const
    };

    const newInvoice: Invoice = {
      ...invoice,
      client,
      id: Date.now().toString(),
      number: `${companySettings.invoicePrefix}-${companySettings.invoiceCounter.toString().padStart(4, '0')}`,
      createdAt: new Date()
    };
    setInvoices(prev => [...prev, newInvoice]);
    setCompanySettings(prev => ({ ...prev, invoiceCounter: prev.invoiceCounter + 1 }));
    
    // Update client's total invoiced
    setClients(prev => prev.map(c => 
      c.id === invoice.clientId 
        ? { ...c, totalInvoiced: c.totalInvoiced + newInvoice.total }
        : c
    ));
    
    return newInvoice;
  }, [companySettings.invoicePrefix, companySettings.invoiceCounter, clients]);

  const generateTaxReport = useCallback((period: string, type: 'monthly' | 'quarterly' | 'annual') => {
    // Calculate tax report based on transactions and invoices
    const report: TaxReport = {
      id: Date.now().toString(),
      period,
      type,
      totalIncome: 0,
      totalExpenses: 0,
      vatCollected: 0,
      vatPaid: 0,
      netVat: 0,
      profitBeforeTax: 0,
      incomeTax: 0,
      netProfit: 0,
      generatedAt: new Date(),
      status: 'draft'
    };
    setTaxReports(prev => [...prev, report]);
    return report;
  }, []);

  const addBankAccount = useCallback((account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setBankAccounts(prev => [...prev, newAccount]);
    return newAccount;
  }, []);

  const createBudget = useCallback((budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  }, []);

  return {
    clients,
    suppliers,
    invoices,
    products,
    taxReports,
    bankAccounts,
    budgets,
    companySettings,
    chatHistory,
    addClient,
    addSupplier,
    addProduct,
    createInvoice,
    generateTaxReport,
    addBankAccount,
    createBudget,
    setCompanySettings,
    addChatMessage
  };
};