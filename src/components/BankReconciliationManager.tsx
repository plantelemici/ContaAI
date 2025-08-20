import React, { useState } from 'react';
import { BankStatement, BankTransaction, BankReconciliation } from '../types/banking';
import { BankStatementCard } from './BankStatementCard';
import { ReconciliationCard } from './ReconciliationCard';
import { FileUpload } from './FileUpload';
import { DateFilter } from './DateFilter';
import { 
  CreditCard, 
  Plus, 
  Filter,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Link as LinkIcon
} from 'lucide-react';

interface BankReconciliationManagerProps {
  bankStatements: BankStatement[];
  bankTransactions: BankTransaction[];
  reconciliations: BankReconciliation[];
  isProcessing: boolean;
  onProcessBankStatement: (file: File) => void;
  onManualReconcile?: (reconciliationId: string) => void;
  reconciliationSummary: {
    totalBankTransactions: number;
    matchedTransactions: number;
    unmatchedTransactions: number;
    partialMatches: number;
    totalVariance: number;
    reconciliationRate: number;
  };
}

export const BankReconciliationManager: React.FC<BankReconciliationManagerProps> = ({ 
  bankStatements,
  bankTransactions,
  reconciliations,
  isProcessing,
  onProcessBankStatement,
  onManualReconcile,
  reconciliationSummary
}) => {
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<'statements' | 'reconciliations' | 'transactions'>('statements');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const filteredTransactions = bankTransactions
    .filter(transaction => {
      if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;
      if (typeFilter !== 'all' && transaction.type !== typeFilter) return false;
      if (monthFilter || yearFilter) {
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getFullYear().toString();
        const transactionMonth = (transactionDate.getMonth() + 1).toString().padStart(2, '0');
        
        if (yearFilter && transactionYear !== yearFilter) return false;
        if (monthFilter && transactionMonth !== monthFilter) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-high':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'amount-low':
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

  const filteredReconciliations = reconciliations
    .filter(rec => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence-high':
          return b.confidence - a.confidence;
        case 'confidence-low':
          return a.confidence - b.confidence;
        default:
          return new Date(b.reconciliationDate).getTime() - new Date(a.reconciliationDate).getTime();
      }
    });

  const tabs = [
    { id: 'statements', label: 'Extrase Bancare', count: bankStatements.length },
    { id: 'reconciliations', label: 'Reconcilieri', count: reconciliations.length },
    { id: 'transactions', label: 'Tranzacții Individuale', count: bankTransactions.length }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Reconciliere Bancară</h2>
          <p className="text-gray-400">Procesează extrase bancare cu AI și reconciliază automat</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-green-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-green-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Încarcă Extras
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Tranzacții</p>
              <p className="text-2xl font-bold text-white mt-1">{reconciliationSummary.totalBankTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Reconciliate</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{reconciliationSummary.matchedTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Nereconciliate</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{reconciliationSummary.unmatchedTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Rata Reconciliere</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{reconciliationSummary.reconciliationRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.id === 'transactions' && <CreditCard className="w-4 h-4" />}
            {tab.id === 'reconciliations' && <LinkIcon className="w-4 h-4" />}
            {tab.id === 'statements' && <FileText className="w-4 h-4" />}
            {tab.label}
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toate statusurile</option>
            {activeTab === 'transactions' && (
              <>
                <option value="completed">Procesat</option>
                <option value="processing">În procesare</option>
                <option value="error">Eroare</option>
              </>
            )}
            {activeTab === 'reconciliations' && (
              <>
                <option value="matched">Reconciliat</option>
                <option value="partial">Parțial</option>
                <option value="unmatched">Nereconciliat</option>
                <option value="manual">Manual</option>
              </>
            )}
          </select>

          {activeTab === 'transactions' && (
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toate tipurile</option>
              <option value="credit">Încasări</option>
              <option value="debit">Plăți</option>
            </select>
          )}

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Cele mai noi</option>
            <option value="oldest">Cele mai vechi</option>
            {activeTab === 'transactions' && (
              <>
                <option value="amount-high">Sumă mare</option>
                <option value="amount-low">Sumă mică</option>
              </>
            )}
            {activeTab === 'reconciliations' && (
              <>
                <option value="confidence-high">Încredere mare</option>
                <option value="confidence-low">Încredere mică</option>
              </>
            )}
          </select>

          <DateFilter
            selectedMonth={monthFilter}
            selectedYear={yearFilter}
            onMonthChange={setMonthFilter}
            onYearChange={setYearFilter}
            onClear={() => {
              setMonthFilter('');
              setYearFilter('');
            }}
          />
        </div>
        <div className="text-sm text-gray-400">
          {activeTab === 'transactions' && `${filteredTransactions.length} din ${bankTransactions.length} tranzacții`}
          {activeTab === 'reconciliations' && `${filteredReconciliations.length} din ${reconciliations.length} reconcilieri`}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Încarcă Extras Bancar</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <FileUpload onFileUpload={onProcessBankStatement} isProcessing={isProcessing} />
            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-400 font-medium">
                    Se procesează extrasul bancar cu AI...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {activeTab === 'statements' && bankStatements.map((statement) => (
          <BankStatementCard 
            key={statement.id} 
            statement={statement}
            onReconcile={onManualReconcile ? () => onManualReconcile(statement.id) : undefined}
          />
        ))}

        {activeTab === 'transactions' && filteredTransactions.map((transaction) => (
          <div key={transaction.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{transaction.description}</h3>
                <p className="text-gray-400 text-sm">{transaction.date.toLocaleDateString('ro-RO')}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Suma:</span>
                <span className={`font-semibold ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} RON
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tip:</span>
                <span className="text-white">{transaction.type === 'credit' ? 'Încasare' : 'Plată'}</span>
              </div>
              {transaction.counterparty && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Contrapartidă:</span>
                  <span className="text-white">{transaction.counterparty}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {activeTab === 'reconciliations' && filteredReconciliations.map((reconciliation) => (
          <ReconciliationCard 
            key={transaction.id} 
            reconciliation={reconciliation}
            onManualReconcile={onManualReconcile}
          />
        ))}

        {/* Empty States */}
        {activeTab === 'statements' && bankStatements.length === 0 && (
          <div className="col-span-full text-center py-16">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nu există extrase bancare</h3>
            <p className="text-gray-400 mb-6">Începe prin a încărca primul extras bancar pentru procesare cu AI</p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-600 rounded-2xl text-white font-semibold hover:from-blue-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              Încarcă primul extras
            </button>
          </div>
        )}

        {activeTab === 'transactions' && filteredTransactions.length === 0 && bankTransactions.length > 0 && (
          <div className="col-span-full text-center py-16">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nu s-au găsit tranzacții</h3>
            <p className="text-gray-400 mb-6">Încearcă să modifici filtrele de căutare</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setMonthFilter('');
                setYearFilter('');
                setSortBy('newest');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-green-700 transition-all duration-300"
            >
              Resetează filtrele
            </button>
          </div>
        )}
      </div>
    </div>
  );
};