import React from 'react';
import { Document, Transaction } from '../types';
import { Contract } from '../types/contracts';
import { BankStatement, BankReconciliation } from '../types/banking';
import { Invoice, Product, CompanySettings } from '../types/accounting';
import { 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  CreditCard, 
  DollarSign, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Package, 
  Building, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  Eye, 
  Download, 
  Contact as FileContract, 
  Banknote, 
  ShoppingCart, 
  Target, 
  Activity, 
  Zap,
  PieChart,
  ArrowUp,
  ArrowDown,
  Percent,
  Calculator,
  Wallet,
  CreditCard as Card,
  Timer,
  Award,
  Briefcase
} from 'lucide-react';

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
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

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
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoiceValue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const overdueInvoiceValue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);

  // Product stats
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);

  // Monthly data for trend analysis
  const currentYear = new Date().getFullYear();
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthTransactions = transactions.filter(t => 
      t.date.getMonth() + 1 === month && t.date.getFullYear() === currentYear
    );
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      month: new Date(currentYear, i, 1).toLocaleDateString('ro-RO', { month: 'short' }),
      income,
      expenses,
      profit: income - expenses
    };
  });

  // Category breakdown
  const categoryBreakdown = transactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { income: 0, expenses: 0, total: 0 };
    }
    if (transaction.type === 'income') {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expenses += transaction.amount;
    }
    acc[category].total = acc[category].income + acc[category].expenses;
    return acc;
  }, {} as Record<string, { income: number; expenses: number; total: number }>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 5);

  // Financial health indicators
  const cashFlow = totalIncome - totalExpenses;
  const averageTransactionValue = transactions.length > 0 ? (totalIncome + totalExpenses) / transactions.length : 0;
  const invoiceCollectionRate = totalInvoiceValue > 0 ? (paidInvoiceValue / totalInvoiceValue) * 100 : 0;

  // Performance indicators
  const performanceIndicators = [
    {
      title: 'Lichiditate',
      value: `${cashFlow.toLocaleString()} RON`,
      trend: cashFlow >= 0 ? 'up' : 'down',
      color: cashFlow >= 0 ? 'text-green-400' : 'text-red-400',
      bg: cashFlow >= 0 ? 'bg-green-500/20' : 'bg-red-500/20',
      icon: Wallet,
      description: 'Fluxul de numerar disponibil'
    },
    {
      title: 'Marja Profit',
      value: `${profitMargin.toFixed(1)}%`,
      trend: profitMargin >= 15 ? 'up' : profitMargin >= 5 ? 'stable' : 'down',
      color: profitMargin >= 15 ? 'text-green-400' : profitMargin >= 5 ? 'text-yellow-400' : 'text-red-400',
      bg: profitMargin >= 15 ? 'bg-green-500/20' : profitMargin >= 5 ? 'bg-yellow-500/20' : 'bg-red-500/20',
      icon: Percent,
      description: 'Profitabilitatea operațiunilor'
    },
    {
      title: 'Rata Colectare',
      value: `${invoiceCollectionRate.toFixed(1)}%`,
      trend: invoiceCollectionRate >= 90 ? 'up' : invoiceCollectionRate >= 70 ? 'stable' : 'down',
      color: invoiceCollectionRate >= 90 ? 'text-green-400' : invoiceCollectionRate >= 70 ? 'text-yellow-400' : 'text-red-400',
      bg: invoiceCollectionRate >= 90 ? 'bg-green-500/20' : invoiceCollectionRate >= 70 ? 'bg-yellow-500/20' : 'bg-red-500/20',
      icon: Calculator,
      description: 'Eficiența colectării facturilor'
    },
    {
      title: 'Reconciliere',
      value: `${reconciliationRate.toFixed(1)}%`,
      trend: reconciliationRate >= 85 ? 'up' : reconciliationRate >= 60 ? 'stable' : 'down',
      color: reconciliationRate >= 85 ? 'text-green-400' : reconciliationRate >= 60 ? 'text-yellow-400' : 'text-red-400',
      bg: reconciliationRate >= 85 ? 'bg-green-500/20' : reconciliationRate >= 60 ? 'bg-yellow-500/20' : 'bg-red-500/20',
      icon: Card,
      description: 'Acuratețea reconcilierii bancare'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4" />;
    }
  };

  const recentDocuments = completedDocuments.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);
  const recentContracts = contracts.slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      {/* Company Header with Key Metrics */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {companySettings.name || 'Compania Ta'}
            </h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span>CUI: {companySettings.cui || 'Necompletat'}</span>
              <span>•</span>
              <span>Activitate: {companySettings.activityCode || 'Nespecificată'}</span>
              <span>•</span>
              <span>Angajați: {companySettings.employees || 1}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">
                {profitMargin >= 15 ? 'Performanță Excelentă' : 
                 profitMargin >= 5 ? 'Performanță Bună' : 'Necesită Atenție'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Ultima activitate: {new Date().toLocaleDateString('ro-RO')}</p>
          </div>
        </div>

        {/* Quick Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Venituri Luna</p>
                <p className="text-xl font-bold text-green-400">
                  {monthlyData[new Date().getMonth()]?.income.toLocaleString() || 0} RON
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Cheltuieli Luna</p>
                <p className="text-xl font-bold text-red-400">
                  {monthlyData[new Date().getMonth()]?.expenses.toLocaleString() || 0} RON
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profit Luna</p>
                <p className={`text-xl font-bold ${
                  (monthlyData[new Date().getMonth()]?.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {monthlyData[new Date().getMonth()]?.profit.toLocaleString() || 0} RON
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Facturi Restante</p>
                <p className="text-xl font-bold text-orange-400">{overdueInvoices}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceIndicators.map((indicator, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${indicator.bg} rounded-xl flex items-center justify-center`}>
                <indicator.icon className={`w-6 h-6 ${indicator.color}`} />
              </div>
              {getTrendIcon(indicator.trend)}
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium">{indicator.title}</p>
              <p className={`text-2xl font-bold mt-1 ${indicator.color}`}>{indicator.value}</p>
              <p className="text-gray-500 text-xs mt-1">{indicator.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts and Warnings */}
      {(processingDocuments.length > 0 || expiringSoonContracts > 0 || overdueInvoices > 0 || lowStockProducts > 0) && (
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-semibold text-orange-400">Atenție Necesară</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {processingDocuments.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Documente în procesare</span>
                </div>
                <p className="text-white text-lg font-bold">{processingDocuments.length}</p>
              </div>
            )}
            {expiringSoonContracts > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-medium">Contracte expiră curând</span>
                </div>
                <p className="text-white text-lg font-bold">{expiringSoonContracts}</p>
              </div>
            )}
            {overdueInvoices > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">Facturi restante</span>
                </div>
                <p className="text-white text-lg font-bold">{overdueInvoices}</p>
                <p className="text-red-300 text-sm">{overdueInvoiceValue.toLocaleString()} RON</p>
              </div>
            )}
            {lowStockProducts > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">Stoc scăzut</span>
                </div>
                <p className="text-white text-lg font-bold">{lowStockProducts}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Evoluție Financiară {currentYear}
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">Venituri</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-gray-400">Cheltuieli</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400">Profit</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses, Math.abs(d.profit))));
              return (
                <div key={index} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">{data.month}</span>
                    <span className={`font-semibold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.profit >= 0 ? '+' : ''}{data.profit.toLocaleString()} RON
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-xs text-gray-400">Venituri</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${maxValue > 0 ? (data.income / maxValue) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-20 text-xs text-green-400 text-right">
                        {data.income.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-xs text-gray-400">Cheltuieli</div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${maxValue > 0 ? (data.expenses / maxValue) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="w-20 text-xs text-red-400 text-right">
                        {data.expenses.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Analysis */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Analiza pe Categorii
          </h3>
          <div className="space-y-4">
            {topCategories.map(([category, data], index) => {
              const percentage = totalIncome + totalExpenses > 0 ? (data.total / (totalIncome + totalExpenses)) * 100 : 0;
              return (
                <div key={category} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-medium">{category}</span>
                    <span className="text-gray-400 text-sm font-semibold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Venituri: {data.income.toLocaleString()} RON</span>
                      <span className="text-red-400">Cheltuieli: {data.expenses.toLocaleString()} RON</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">
                        Total: {data.total.toLocaleString()} RON
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Status */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Status Facturi
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Plătite</span>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold">{paidInvoices}</p>
                <p className="text-green-300 text-sm">{paidInvoiceValue.toLocaleString()} RON</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-medium">În așteptare</span>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-bold">{pendingInvoices}</p>
                <p className="text-blue-300 text-sm">
                  {(totalInvoiceValue - paidInvoiceValue - overdueInvoiceValue).toLocaleString()} RON
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Restante</span>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-bold">{overdueInvoices}</p>
                <p className="text-red-300 text-sm">{overdueInvoiceValue.toLocaleString()} RON</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Overview */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileContract className="w-5 h-5" />
            Contracte Active
          </h3>
          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <div key={contract.id} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <FileContract className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm truncate">
                      {contract.title || contract.number}
                    </p>
                    <p className="text-gray-400 text-xs">{contract.clientName}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    Expirare: {contract.endDate.toLocaleDateString('ro-RO')}
                  </span>
                  <span className="text-green-400 font-semibold">
                    {contract.value.toLocaleString()} RON
                  </span>
                </div>
              </div>
            ))}
            {recentContracts.length === 0 && (
              <p className="text-gray-400 text-center py-8">Nu există contracte active</p>
            )}
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Indicatori Cheie
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Valoare medie tranzacție:</span>
              <span className="text-white font-semibold">{averageTransactionValue.toLocaleString()} RON</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Valoare contracte:</span>
              <span className="text-blue-400 font-semibold">{totalContractValue.toLocaleString()} RON</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Valoare inventar:</span>
              <span className="text-emerald-400 font-semibold">{totalInventoryValue.toLocaleString()} RON</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Documente procesate:</span>
              <span className="text-cyan-400 font-semibold">{completedDocuments.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Rata reconciliere:</span>
              <span className="text-purple-400 font-semibold">{reconciliationRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
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
                    {transaction.type === 'expense' ? '-' : '+'}{transaction.amount.toLocaleString()} RON
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

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Acțiuni Rapide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium text-center">Încarcă Document</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileContract className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium text-center">Contract Nou</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium text-center">Factură Nouă</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium text-center">Extras Bancar</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium text-center">Raport Fiscal</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 group">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-sm font-medium text-center">Produs Nou</span>
          </button>
        </div>
      </div>
    </div>
  );
};