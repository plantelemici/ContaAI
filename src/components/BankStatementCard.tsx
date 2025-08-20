import React, { useState } from 'react';
import { BankStatement } from '../types/banking';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Download,
  Trash2,
  Brain,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BankStatementCardProps {
  statement: BankStatement;
  onReconcile?: (statementId: string) => void;
}

export const BankStatementCard: React.FC<BankStatementCardProps> = ({ 
  statement, 
  onReconcile 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (statement.status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (statement.status) {
      case 'processing':
        return 'Se procesează...';
      case 'completed':
        return 'Procesat';
      case 'error':
        return 'Eroare';
    }
  };

  const totalCredits = statement.transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = statement.transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netFlow = totalCredits - totalDebits;

  const transactionsByCategory = statement.transactions.reduce((acc, tx) => {
    const category = tx.category || 'Necategorizat';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(transactionsByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-1">
              {statement.fileName}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-xs">{statement.fileSize}</p>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <p className="text-gray-400 text-xs">{statement.uploadedAt.toLocaleDateString('ro-RO')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          {onReconcile && (
            <button 
              onClick={() => onReconcile(statement.id)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <CreditCard className="w-4 h-4 text-blue-400" />
            </button>
          )}
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
          {getStatusIcon()}
          <span className="text-xs font-medium text-gray-300">{getStatusText()}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <Brain className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium text-blue-400">Procesat cu AI</span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-6">
      {/* Bank Info */}
      <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <Building className="w-4 h-4" />
          Informații Bancă
        </h4>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Bancă:</span>
          <span className="text-white text-sm font-semibold">{statement.bankName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Cont:</span>
          <span className="text-blue-400 text-sm font-mono">{statement.accountNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Perioada:
          </span>
          <span className="text-white text-sm font-semibold">
            {statement.statementPeriod.startDate.toLocaleDateString('ro-RO')} - {statement.statementPeriod.endDate.toLocaleDateString('ro-RO')}
          </span>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Încasări</span>
          </div>
          <p className="text-xl font-bold text-green-400">{totalCredits.toLocaleString()} RON</p>
          <p className="text-xs text-gray-400">
            {statement.transactions.filter(t => t.type === 'credit').length} tranzacții
          </p>
        </div>
        
        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Plăți</span>
          </div>
          <p className="text-xl font-bold text-red-400">{totalDebits.toLocaleString()} RON</p>
          <p className="text-xs text-gray-400">
            {statement.transactions.filter(t => t.type === 'debit').length} tranzacții
          </p>
        </div>
      </div>

      {/* Balance Info */}
      <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Solduri
        </h4>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Sold inițial:</span>
          <span className="text-white text-sm font-semibold">{statement.openingBalance.toLocaleString()} RON</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Sold final:</span>
          <span className="text-white text-sm font-semibold">{statement.closingBalance.toLocaleString()} RON</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Flux net:</span>
          <span className={`text-sm font-bold ${netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netFlow >= 0 ? '+' : ''}{netFlow.toLocaleString()} RON
          </span>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Rezumat Tranzacții
        </h4>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total tranzacții:</span>
          <span className="text-white text-sm font-semibold">{statement.totalTransactions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Valoare medie:</span>
          <span className="text-white text-sm font-semibold">
            {statement.totalTransactions > 0 
              ? ((totalCredits + totalDebits) / statement.totalTransactions).toLocaleString() 
              : 0} RON
          </span>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Categorii
          </h4>
          {topCategories.map(([category, count], index) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">{category}:</span>
              <span className="text-white text-sm font-semibold">{count} tranzacții</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Transactions Preview */}
      <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <h4 className="text-white font-medium mb-3">Ultimele Tranzacții</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {statement.transactions.slice(0, 5).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                {transaction.type === 'credit' ? (
                  <TrendingUp className="w-3 h-3 text-green-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
                <span className="text-white text-xs truncate max-w-[120px]">
                  {transaction.description}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold ${
                  transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()}
                </span>
                <p className="text-gray-400 text-xs">
                  {transaction.date.toLocaleDateString('ro-RO')}
                </p>
              </div>
            </div>
          ))}
          {statement.transactions.length > 5 && (
            <div className="text-center py-2">
              <span className="text-gray-400 text-xs">
                +{statement.transactions.length - 5} mai multe tranzacții...
              </span>
            </div>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
};