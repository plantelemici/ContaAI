import React, { useState } from 'react';
import { Transaction } from '../types';
import { TaxReport } from '../types/accounting';
import { Contract } from '../types/contracts';
import { BankStatement } from '../types/banking';
import { Invoice, Product } from '../types/accounting';
import { DateFilter } from './DateFilter';
import { BarChart3, TrendingUp, TrendingDown, FileText, Download, Calendar, DollarSign, PieChart, Activity, Target } from 'lucide-react';

interface ReportsManagerProps {
  transactions: Transaction[];
  taxReports: TaxReport[];
  contracts: Contract[];
  bankStatements: BankStatement[];
  invoices: Invoice[];
  products: Product[];
  onGenerateReport: (period: string, type: 'monthly' | 'quarterly' | 'annual') => void;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({ 
  transactions, 
  taxReports, 
  contracts,
  bankStatements,
  invoices,
  products,
  onGenerateReport 
}) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [activeReportTab, setActiveReportTab] = useState<'financial' | 'contracts' | 'inventory' | 'banking'>('financial');

  const currentYear = new Date().getFullYear();
  
  // Filter transactions based on selected period
  const filteredTransactions = transactions.filter(t => {
    if (selectedYear) {
      const transactionYear = t.date.getFullYear().toString();
      if (transactionYear !== selectedYear) return false;
    }
    if (selectedMonth) {
      const transactionMonth = (t.date.getMonth() + 1).toString().padStart(2, '0');
      if (transactionMonth !== selectedMonth) return false;
    }
    return true;
  });
  
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Contract analytics
  const activeContracts = contracts.filter(c => c.status === 'active');
  const totalContractValue = contracts.reduce((sum, c) => sum + c.value, 0);
  const contractsByType = contracts.reduce((acc, contract) => {
    acc[contract.type] = (acc[contract.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Invoice analytics
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

  // Product analytics
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Banking analytics
  const totalBankTransactions = bankStatements.reduce((sum, stmt) => sum + stmt.totalTransactions, 0);
  const totalBankValue = bankStatements.reduce((sum, stmt) => sum + Math.abs(stmt.closingBalance - stmt.openingBalance), 0);

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthTransactions = filteredTransactions.filter(t => 
      t.date.getMonth() + 1 === month && t.date.getFullYear() === parseInt(selectedYear || currentYear.toString())
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

  const reportTabs = [
    { id: 'financial', label: 'Financiar', icon: DollarSign },
    { id: 'contracts', label: 'Contracte', icon: FileText },
    { id: 'inventory', label: 'Inventar', icon: Activity },
    { id: 'banking', label: 'Bancar', icon: Target }
  ];

  const categoryBreakdown = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { income: 0, expenses: 0 };
    }
    if (transaction.type === 'income') {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expenses += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expenses: number }>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Rapoarte</h2>
          <p className="text-gray-400">
            Analize financiare și rapoarte fiscale
            {(selectedMonth || selectedYear) && (
              <span className="ml-2 text-blue-400">
                - {selectedMonth ? `${getMonthName(selectedMonth)} ` : ''}{selectedYear || 'Toate anii'}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <DateFilter
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onClear={() => {
              setSelectedMonth('');
              setSelectedYear('');
            }}
            showClear={!!(selectedMonth || selectedYear)}
          />
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'monthly' | 'quarterly' | 'annual')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">Lunar</option>
            <option value="quarterly">Trimestrial</option>
            <option value="annual">Anual</option>
          </select>
          <button
            onClick={() => onGenerateReport(`${selectedYear || 'all'}-${selectedMonth || 'all'}`, reportType)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Generează Raport
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
              activeReportTab === tab.id
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {activeReportTab === 'financial' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Venituri Totale</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{totalIncome.toLocaleString()} RON</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Cheltuieli Totale</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{totalExpenses.toLocaleString()} RON</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Profit Net</p>
                <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netProfit.toLocaleString()} RON
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <DollarSign className={`w-6 h-6 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'contracts' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Contracte</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{contracts.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Contracte Active</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{activeContracts.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Valoare Totală</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{totalContractValue.toLocaleString()} RON</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Valoare Medie</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">
                  {contracts.length > 0 ? (totalContractValue / contracts.length).toLocaleString() : 0} RON
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Produse</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Stoc Scăzut</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{lowStockProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Valoare Inventar</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{totalInventoryValue.toLocaleString()} RON</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Valoare Medie</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">
                  {products.length > 0 ? (totalInventoryValue / products.length).toLocaleString() : 0} RON
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'banking' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Extrase Bancare</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{bankStatements.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Tranzacții</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{totalBankTransactions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Valoare Procesată</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{totalBankValue.toLocaleString()} RON</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Facturi Plătite</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{paidInvoices.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeReportTab === 'financial' && (
          <>
            {/* Monthly Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Evoluție Lunară {selectedYear || currentYear}
              </h3>
              <div className="space-y-3">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-gray-300 font-medium">{data.month}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-400">+{data.income.toLocaleString()}</span>
                      <span className="text-red-400">-{data.expenses.toLocaleString()}</span>
                      <span className={`font-semibold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.profit >= 0 ? '+' : ''}{data.profit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Breakdown pe Categorii</h3>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="p-3 bg-white/5 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{category}</span>
                      <span className="text-gray-400 text-sm">
                        {((data.income + data.expenses) / (totalIncome + totalExpenses) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Venituri: {data.income.toLocaleString()} RON</span>
                      <span className="text-red-400">Cheltuieli: {data.expenses.toLocaleString()} RON</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeReportTab === 'contracts' && (
          <>
            {/* Contract Types */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Contracte pe Tipuri
              </h3>
              <div className="space-y-3">
                {Object.entries(contractsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-gray-300 font-medium capitalize">{type}</span>
                    <span className="text-white font-semibold">{count} contracte</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract Values */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Valori Contracte</h3>
              <div className="space-y-3">
                {contracts.slice(0, 5).map((contract) => (
                  <div key={contract.id} className="p-3 bg-white/5 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{contract.title || contract.number}</span>
                      <span className="text-blue-400 font-semibold">{contract.value.toLocaleString()} RON</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{contract.clientName}</span>
                      <span className="text-gray-400">{contract.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeReportTab === 'inventory' && (
          <>
            {/* Top Products */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Top Produse (Valoare)</h3>
              <div className="space-y-3">
                {products
                  .sort((a, b) => (b.stock * b.unitPrice) - (a.stock * a.unitPrice))
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="p-3 bg-white/5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{product.name}</span>
                        <span className="text-emerald-400 font-semibold">
                          {(product.stock * product.unitPrice).toLocaleString()} RON
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Stoc: {product.stock} {product.unit}</span>
                        <span className="text-gray-400">Preț: {product.unitPrice} RON</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Produse Stoc Scăzut</h3>
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{product.name}</span>
                      <span className="text-red-400 font-semibold">{product.stock} {product.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Minim: {product.minStock} {product.unit}</span>
                      <span className="text-red-400">Stoc scăzut!</span>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length === 0 && (
                  <p className="text-gray-400 text-center py-8">Toate produsele au stoc suficient</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeReportTab === 'banking' && (
          <>
            {/* Bank Statements */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Extrase Bancare</h3>
              <div className="space-y-3">
                {bankStatements.slice(0, 5).map((statement) => (
                  <div key={statement.id} className="p-3 bg-white/5 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{statement.bankName}</span>
                      <span className="text-cyan-400 font-semibold">{statement.totalTransactions} tranzacții</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{statement.accountNumber}</span>
                      <span className="text-gray-400">
                        {statement.statementPeriod.startDate.toLocaleDateString('ro-RO')} - 
                        {statement.statementPeriod.endDate.toLocaleDateString('ro-RO')}
                      </span>
                    </div>
                  </div>
                ))}
                {bankStatements.length === 0 && (
                  <p className="text-gray-400 text-center py-8">Nu există extrase bancare</p>
                )}
              </div>
            </div>

            {/* Invoice Status */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Status Facturi</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">Plătite</span>
                    <span className="text-green-400 font-semibold">{paidInvoices.length} facturi</span>
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 font-medium">Întârziate</span>
                    <span className="text-red-400 font-semibold">{overdueInvoices.length} facturi</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 font-medium">Valoare Totală</span>
                    <span className="text-blue-400 font-semibold">{totalInvoiceValue.toLocaleString()} RON</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tax Reports */}
      <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Rapoarte Fiscale</h3>
        <div className="space-y-3">
          {taxReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Raport {report.type} - {report.period}</p>
                  <p className="text-gray-400 text-sm">
                    Generat: {report.generatedAt.toLocaleDateString('ro-RO')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white font-semibold">{report.netProfit.toLocaleString()} RON</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {report.status === 'draft' ? 'Ciornă' : 'Trimis'}
                  </span>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
          {taxReports.length === 0 && (
            <p className="text-gray-400 text-center py-8">Nu există rapoarte generate</p>
          )}
        </div>
      </div>
    </div>
  );
};

const getMonthName = (month: string): string => {
  const months = [
    '', 'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  return months[parseInt(month)] || '';
};