import React from 'react';
import { Document, Transaction } from '../types';
import { Contract } from '../types/contracts';
import { BankStatement, BankReconciliation } from '../types/banking';
import { Invoice, Product, CompanySettings } from '../types/accounting';
import { TrendingUp, TrendingDown, FileText, CreditCard, DollarSign, Users, Calendar, AlertTriangle, Package, Building, BarChart3, CheckCircle, Clock, Eye, Download, Contact as FileContract, Banknote, ShoppingCart, Target, Activity, Zap } from 'lucide-react';

interface DashboardProps {
  documents: Document[];
  transactions: Transaction[];
  contracts: Contract[];
  bankStatements: BankStatement[];
  reconciliations: BankReconciliation[];
  invoices: Invoice[];
  products: Product[];
  companySettings: CompanySettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  documents = [], 
  transactions = [], 
  contracts = [],
  bankStatements = [],
  reconciliations = [],
  invoices = [],
  products = [],
  companySettings
}) => {
  const completedDocuments = documents.filter(doc => doc.status === 'completed');
  const processingDocuments = documents.filter(doc => doc.status === 'processing');
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Contract stats
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const expiringSoonContracts = contracts.filter(c => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return c.endDate <= thirtyDaysFromNow && c.status === 'active';
  }).length;
  const totalContractValue = contracts.reduce((sum, c) => sum + c.value, 0);

  // Bank reconciliation stats
  const totalBankTransactions = bankStatements.reduce((sum, stmt) => sum + stmt.totalTransactions, 0);
  const reconciledTransactions = reconciliations.filter(r => r.status === 'matched').length;
  const reconciliationRate = totalBankTransactions > 0 ? (reconciledTransactions / totalBankTransactions) * 100 : 0;

  // Invoice stats
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0);

  // Product stats
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);

  const mainStats = [
    {
      title: 'Venituri Totale',
      value: `${totalIncome.toLocaleString()} RON`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      change: '+12.5%',
      changeColor: 'text-green-400'
    },
    {
      title: 'Cheltuieli Totale',
      value: `${totalExpenses.toLocaleString()} RON`,
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      change: '+8.2%',
      changeColor: 'text-red-400'
    },
    {
      title: 'Profit Net',
      value: `${netProfit.toLocaleString()} RON`,
      icon: DollarSign,
      color: netProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bg: netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20',
      change: netProfit >= 0 ? '+15.3%' : '-5.2%',
      changeColor: netProfit >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Rata Reconciliere',
      value: `${reconciliationRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      change: '+3.1%',
      changeColor: 'text-blue-400'
    }
  ];

  const moduleStats = [
    {
      title: 'Documente',
      value: completedDocuments.length,
      total: documents.length,
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      processing: processingDocuments.length
    },
    {
      title: 'Contracte',
      value: activeContracts,
      total: contracts.length,
      icon: FileContract,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      expiring: expiringSoonContracts
    },
    {
      title: 'Facturi',
      value: paidInvoices,
      total: invoices.length,
      icon: Building,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/20',
      overdue: overdueInvoices
    },
    {
      title: 'Produse',
      value: products.length - lowStockProducts,
      total: products.length,
      icon: Package,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      lowStock: lowStockProducts
    },
    {
      title: 'Extrase Bancare',
      value: bankStatements.filter(s => s.status === 'completed').length,
      total: bankStatements.length,
      icon: Banknote,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      processing: bankStatements.filter(s => s.status === 'processing').length
    },
    {
      title: 'Reconcilieri',
      value: reconciledTransactions,
      total: totalBankTransactions,
      icon: CreditCard,
      color: 'text-teal-400',
      bg: 'bg-teal-500/20',
      pending: totalBankTransactions - reconciledTransactions
    }
  ];

  const recentDocuments = completedDocuments.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);
  const recentContracts = contracts.slice(0, 3);

  // Quick actions
  const quickActions = [
    { label: 'Încarcă Document', icon: FileText, color: 'bg-blue-500', action: 'upload' },
    { label: 'Contract Nou', icon: FileContract, color: 'bg-purple-500', action: 'contract' },
    { label: 'Factură Nouă', icon: Building, color: 'bg-indigo-500', action: 'invoice' },
    { label: 'Extras Bancar', icon: Banknote, color: 'bg-cyan-500', action: 'bank' },
    { label: 'Raport Fiscal', icon: BarChart3, color: 'bg-green-500', action: 'report' },
    { label: 'Produs Nou', icon: Package, color: 'bg-emerald-500', action: 'product' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Company Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {companySettings.name || 'Compania Ta'}
            </h1>
            <p className="text-gray-400">
              CUI: {companySettings.cui || 'Necompletat'} • 
              Activitate: {companySettings.activityCode || 'Nespecificată'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Ultima activitate</p>
            <p className="text-white font-semibold">{new Date().toLocaleDateString('ro-RO')}</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${stat.changeColor}`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Alert */}
      {processingDocuments.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">
              {processingDocuments.length} documente se procesează cu AI...
            </span>
          </div>
        </div>
      )}

      {/* Module Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moduleStats.map((module, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${module.bg} rounded-xl flex items-center justify-center`}>
                <module.icon className={`w-5 h-5 ${module.color}`} />
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{module.value}</span>
                <span className="text-gray-400">/{module.total}</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-2">{module.title}</h3>
            <div className="space-y-1">
              {module.processing !== undefined && module.processing > 0 && (
                <p className="text-yellow-400 text-sm">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {module.processing} în procesare
                </p>
              )}
              {module.expiring !== undefined && module.expiring > 0 && (
                <p className="text-orange-400 text-sm">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {module.expiring} expiră curând
                </p>
              )}
              {module.overdue !== undefined && module.overdue > 0 && (
                <p className="text-red-400 text-sm">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {module.overdue} întârziate
                </p>
              )}
              {module.lowStock !== undefined && module.lowStock > 0 && (
                <p className="text-red-400 text-sm">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {module.lowStock} stoc scăzut
                </p>
              )}
              {module.pending !== undefined && module.pending > 0 && (
                <p className="text-gray-400 text-sm">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {module.pending} în așteptare
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Acțiuni Rapide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-sm font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documente Recente
            </h3>
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium truncate max-w-[150px]">
                      {doc.fileName}
                    </p>
                    <p className="text-gray-400 text-xs">{doc.supplier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{doc.amount}</p>
                  <p className="text-gray-400 text-xs">{doc.documentDate}</p>
                </div>
              </div>
            ))}
            {recentDocuments.length === 0 && (
              <p className="text-gray-400 text-center py-8">Nu există documente procesate</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Tranzacții Recente
            </h3>
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium truncate max-w-[150px]">
                      {transaction.description}
                    </p>
                    <p className="text-gray-400 text-xs">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}{transaction.amount} RON
                  </p>
                  <p className="text-gray-400 text-xs">
                    {transaction.date.toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-gray-400 text-center py-8">Nu există tranzacții</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileContract className="w-5 h-5" />
            Contracte Active
          </h3>
          <button className="text-blue-400 hover:text-blue-300 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentContracts.map((contract) => (
            <div key={contract.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <FileContract className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{contract.title || contract.number}</p>
                  <p className="text-gray-400 text-xs">{contract.clientName}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valoare:</span>
                  <span className="text-green-400 font-semibold">{contract.value.toLocaleString()} RON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expirare:</span>
                  <span className="text-white">{contract.endDate.toLocaleDateString('ro-RO')}</span>
                </div>
              </div>
            </div>
          ))}
          {recentContracts.length === 0 && (
            <p className="text-gray-400 text-center py-8 col-span-3">Nu există contracte active</p>
          )}
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Breakdown pe Categorii
          </h3>
          <div className="space-y-3">
            {Object.entries(
              transactions.reduce((acc, transaction) => {
                acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount);
                return acc;
              }, {} as Record<string, number>)
            ).slice(0, 5).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <span className="text-gray-300 font-medium">{category}</span>
                <span className="text-white font-semibold">{amount.toLocaleString()} RON</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Indicatori Cheie
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Marja de profit:</span>
              <span className={`font-semibold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Valoare contracte:</span>
              <span className="text-blue-400 font-semibold">{totalContractValue.toLocaleString()} RON</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Valoare facturi:</span>
              <span className="text-indigo-400 font-semibold">{totalInvoiceValue.toLocaleString()} RON</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Valoare inventar:</span>
              <span className="text-emerald-400 font-semibold">{totalInventoryValue.toLocaleString()} RON</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Rata reconciliere:</span>
              <span className="text-cyan-400 font-semibold">{reconciliationRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};