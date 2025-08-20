import React from 'react';
import { BankReconciliation } from '../types/banking';
import { 
  Link, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FileText,
  Building,
  Eye,
  Edit,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface ReconciliationCardProps {
  reconciliation: BankReconciliation;
  onManualReconcile?: (reconciliationId: string) => void;
}

export const ReconciliationCard: React.FC<ReconciliationCardProps> = ({ 
  reconciliation, 
  onManualReconcile 
}) => {
  const getStatusIcon = () => {
    switch (reconciliation.status) {
      case 'matched':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'partial':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'unmatched':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'manual':
        return <Edit className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusText = () => {
    switch (reconciliation.status) {
      case 'matched':
        return 'Reconciliat';
      case 'partial':
        return 'Parțial';
      case 'unmatched':
        return 'Nereconciliat';
      case 'manual':
        return 'Manual';
    }
  };

  const getStatusColor = () => {
    switch (reconciliation.status) {
      case 'matched':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'partial':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'unmatched':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'manual':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }
  };

  const { bankTransaction } = reconciliation;
  const totalMatches = reconciliation.matchedDocuments.length + reconciliation.matchedInvoices.length;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 group transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
            <Link className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base mb-1">
              {bankTransaction.description}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-sm">{bankTransaction.reference}</p>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <p className="text-gray-400 text-sm">{bankTransaction.date.toLocaleDateString('ro-RO')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Eye className="w-4 h-4 text-gray-400" />
          </button>
          {onManualReconcile && reconciliation.status !== 'matched' && (
            <button 
              onClick={() => onManualReconcile(reconciliation.id)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Edit className="w-4 h-4 text-blue-400" />
            </button>
          )}
        </div>
      </div>

      {/* Status and Amount */}
      <div className="flex items-center justify-between mb-6">
        <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        <div className="flex items-center gap-2">
          {bankTransaction.type === 'credit' ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-lg font-bold ${
            bankTransaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
          }`}>
            {bankTransaction.type === 'credit' ? '+' : '-'}{Math.abs(bankTransaction.amount).toLocaleString()} RON
          </span>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Încredere reconciliere:</span>
          <span className="text-white font-semibold">{reconciliation.confidence}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              reconciliation.confidence > 70 ? 'bg-green-500' :
              reconciliation.confidence > 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${reconciliation.confidence}%` }}
          ></div>
        </div>
      </div>

      {/* Bank Transaction Details */}
      <div className="space-y-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h4 className="text-white font-medium mb-3">Detalii Tranzacție Bancară</h4>
        {bankTransaction.counterparty && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Contrapartidă:</span>
            <span className="text-white text-sm font-semibold">{bankTransaction.counterparty}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Sold după:</span>
          <span className="text-white text-sm font-semibold">{bankTransaction.balance.toLocaleString()} RON</span>
        </div>
        {bankTransaction.category && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Categorie:</span>
            <span className="text-blue-400 text-sm font-semibold">{bankTransaction.category}</span>
          </div>
        )}
      </div>

      {/* Matched Items */}
      {totalMatches > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm text-green-400 font-semibold">
              {totalMatches} potriviri găsite
            </span>
          </div>
          
          <div className="space-y-2">
            {reconciliation.matchedDocuments.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{reconciliation.matchedDocuments.length} documente</span>
              </div>
            )}
            {reconciliation.matchedInvoices.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Building className="w-4 h-4 text-purple-400" />
                <span>{reconciliation.matchedInvoices.length} facturi</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Variance */}
      {reconciliation.variance && reconciliation.variance !== 0 && (
        <div className="mb-6 p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <div>
              <span className="text-sm font-medium text-orange-400">
                Diferență: {reconciliation.variance.toLocaleString()} RON
              </span>
              <p className="text-xs text-gray-400 mt-1">
                Verifică manual această reconciliere
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      {reconciliation.notes && (
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <span className="text-gray-400 text-sm font-medium mb-2 block">Note:</span>
          <p className="text-white text-sm leading-relaxed">{reconciliation.notes}</p>
        </div>
      )}
    </div>
  );
};