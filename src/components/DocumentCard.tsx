import React, { useState } from 'react';
import { Document } from '../types';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Download,
  Trash2,
  Brain,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (document.status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (document.status) {
      case 'processing':
        return 'Se procesează...';
      case 'completed':
        return 'Procesat';
      case 'error':
        return 'Eroare';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Transport': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      'Servicii': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
      'Materiale': 'bg-green-500/20 text-green-300 border border-green-500/30',
      'Utilitati': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'default': 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm truncate max-w-[180px] mb-1">
              {document.fileName}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-xs">{document.fileSize}</p>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <p className="text-gray-400 text-xs">{document.uploadedAt.toLocaleDateString('ro-RO')}</p>
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
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Category and Status */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(document.category)}`}>
          {document.category || 'Necategorizat'}
        </span>
        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg">
          {getStatusIcon()}
          <span className="text-xs font-medium text-gray-300">{getStatusText()}</span>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-6">
      {/* AI Analysis */}
      {document.geminiAnalysis > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Eye className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-400">
              Analizat cu Gemini AI ({document.geminiAnalysis}%)
            </span>
          </div>
        </div>
      )}

      {/* Document Details */}
      {document.status === 'completed' && (
        <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Furnizor:</span>
            <span className="text-white font-semibold truncate max-w-[120px]">{document.supplier}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Suma:</span>
            <span className="text-green-400 font-bold">{document.amount}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Client:</span>
            <span className="text-white font-semibold truncate max-w-[120px]">{document.client}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Data:</span>
            <span className="text-white font-semibold">{document.documentDate}</span>
          </div>
          {document.invoiceNumber && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Nr. Factură:</span>
              <span className="text-blue-400 font-semibold">{document.invoiceNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {document.description && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-gray-400 text-xs font-medium mb-1 block">Descriere:</span>
          <p className="text-white text-xs leading-relaxed line-clamp-2">{document.description}</p>
        </div>
      )}

      {/* AI Insights */}
      {document.aiInsights.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-3 h-3 text-orange-400" />
            </div>
            <span className="text-xs text-orange-400 font-semibold">AI Insights</span>
          </div>
          <ul className="space-y-1 pl-3">
            {document.aiInsights.slice(0, 2).map((insight, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-orange-400 text-lg leading-none">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {document.recommendations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-yellow-400" />
            </div>
            <span className="text-xs text-yellow-400 font-semibold">Recomandări</span>
          </div>
          <ul className="space-y-1 pl-3">
            {document.recommendations.slice(0, 2).map((rec, index) => (
              <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                <span className="text-yellow-400 text-lg leading-none">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generated Transactions */}
      {document.generatedTransactions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-xs text-green-400 font-semibold">Tranzacții generate</span>
          </div>
          <div className="space-y-2">
            {document.generatedTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-white text-xs font-medium truncate max-w-[120px]">{transaction.description}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'expense' ? '-' : '+'}{transaction.amount} RON
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};