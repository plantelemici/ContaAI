import React from 'react';
import { BankTransaction } from '../types/banking';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Link,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface BankTransactionCardProps {
  transaction: BankTransaction;
  onReconcile?: (transactionId: string) => void;
}

export const BankTransactionCard: React.FC<BankTransactionCardProps> = ({ 
  transaction, 
  onReconcile 
}) => {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 'processing':
        return 'Se procesează...';
      case 'completed':
        return 'Procesat';
      case 'error':
        return 'Eroare';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'credit' 
      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
      : 'bg-red-500/20 text-red-300 border border-red-500/30';
  };

  const getTypeText = (type: string) => {
    return type === 'credit' ? 'Încasare' : 'Plată';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'transfer': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'card': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      'comision': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      'incasare': 'bg-green-500/20 text-green-300 border border-green-500/30',
      'default': 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
            <CreditCard className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base mb-1">
              {transaction.description}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-sm">{transaction.reference}</p>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <p className="text-gray-400 text-sm">{transaction.date.toLocaleDateString('ro-RO')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          {onReconcile && (
            <button 
              onClick={() => onReconcile(transaction.id)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Link className="w-4 h-4 text-blue-400" />
            </button>
          )}
        </div>
      </div>

      {/* Type and Status */}
      <div className="flex items-center justify-between mb-6">
        <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getTypeColor(transaction.type)}`}>
          {getTypeText(transaction.type)}
        </span>
        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-300">{getStatusText()}</span>
        </div>
      </div>

      {/* AI Analysis */}
      {transaction.geminiAnalysis > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm font-medium text-green-400">
              Analizat cu Gemini AI ({transaction.geminiAnalysis}%)
            </span>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      {transaction.status === 'completed' && (
        <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Suma:</span>
            <div className="flex items-center gap-2">
              {transaction.type === 'credit' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-bold ${
                transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString()} RON
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Sold după:</span>
            <span className="text-white text-sm font-semibold">{transaction.balance.toLocaleString()} RON</span>
          </div>
          {transaction.counterparty && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Contrapartidă:</span>
              <span className="text-white text-sm font-semibold">{transaction.counterparty}</span>
            </div>
          )}
          {transaction.category && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Categorie:</span>
              <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(transaction.category)}`}>
                {transaction.category}
              </span>
            </div>
          )}
          {transaction.iban && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">IBAN:</span>
              <span className="text-blue-400 text-sm font-mono">{transaction.iban}</span>
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      {transaction.aiInsights.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-sm text-orange-400 font-semibold">AI Insights</span>
          </div>
          <ul className="space-y-2 pl-4">
            {transaction.aiInsights.slice(0, 3).map((insight, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-3">
                <span className="text-orange-400 text-lg leading-none">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {transaction.recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-sm text-yellow-400 font-semibold">Recomandări</span>
          </div>
          <ul className="space-y-2 pl-4">
            {transaction.recommendations.slice(0, 2).map((rec, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-3">
                <span className="text-yellow-400 text-lg leading-none">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};