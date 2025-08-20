import React, { useState } from 'react';
import { Contract } from '../types/contracts';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Eye,
  Download,
  Trash2,
  Brain,
  Shield,
  Calendar,
  DollarSign,
  Users,
  Link,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ContractCardProps {
  contract: Contract;
  onLinkInvoice?: (contractId: string) => void;
}

export const ContractCard: React.FC<ContractCardProps> = ({ contract, onLinkInvoice }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (contract.status) {
      case 'draft':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    }
  };

  const getStatusText = () => {
    switch (contract.status) {
      case 'draft':
        return 'Ciornă';
      case 'active':
        return 'Activ';
      case 'completed':
        return 'Finalizat';
      case 'cancelled':
        return 'Anulat';
      case 'expired':
        return 'Expirat';
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'service': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      'supply': 'bg-green-500/20 text-green-300 border border-green-500/30',
      'maintenance': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      'consulting': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
      'other': 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getTypeText = (type: string) => {
    const types = {
      'service': 'Servicii',
      'supply': 'Furnizare',
      'maintenance': 'Mentenanță',
      'consulting': 'Consultanță',
      'other': 'Altele'
    };
    return types[type as keyof typeof types] || 'Altele';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low':
        return 'Risc Scăzut';
      case 'medium':
        return 'Risc Mediu';
      case 'high':
        return 'Risc Ridicat';
      default:
        return 'Risc Necunoscut';
    }
  };

  const isExpiringSoon = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return contract.endDate <= thirtyDaysFromNow && contract.status === 'active';
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group transform hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-purple-500/20">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-1 truncate max-w-[180px]">
              {contract.title || contract.number}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-xs">{contract.number}</p>
              <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
              <p className="text-gray-400 text-xs">{contract.createdAt.toLocaleDateString('ro-RO')}</p>
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
          {onLinkInvoice && (
            <button 
              onClick={() => onLinkInvoice(contract.id)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Link className="w-4 h-4 text-blue-400" />
            </button>
          )}
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Type and Status */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getTypeColor(contract.type)}`}>
          {getTypeText(contract.type)}
        </span>
        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg">
          {getStatusIcon()}
          <span className="text-xs font-medium text-gray-300">{getStatusText()}</span>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      {isExpiringSoon() && (
        <div className="mb-4 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-medium text-orange-400">
              Contractul expiră în curând!
            </span>
          </div>
        </div>
      )}

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-6">
      {/* AI Analysis */}
      {contract.geminiAnalysis.confidence > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-3 h-3 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-purple-400">
              Analizat cu Gemini AI ({contract.geminiAnalysis.confidence}%)
            </span>
          </div>
        </div>
      )}

      {/* Contract Details */}
      <div className="space-y-2 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Client:
          </span>
          <span className="text-white font-semibold truncate max-w-[120px]">{contract.clientName}</span>
        </div>
        {contract.supplierName && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Furnizor:</span>
            <span className="text-white font-semibold truncate max-w-[120px]">{contract.supplierName}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Valoare:
          </span>
          <span className="text-green-400 font-bold">
            {contract.value.toLocaleString()} {contract.currency}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Perioada:
          </span>
          <span className="text-white font-semibold">
            {contract.startDate.toLocaleDateString('ro-RO')} - {contract.endDate.toLocaleDateString('ro-RO')}
          </span>
        </div>
        {contract.linkedInvoices.length > 0 && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Facturi legate:</span>
            <span className="text-blue-400 font-semibold">{contract.linkedInvoices.length}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {contract.description && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <span className="text-gray-400 text-xs font-medium mb-1 block">Descriere:</span>
          <p className="text-white text-xs leading-relaxed line-clamp-2">{contract.description}</p>
        </div>
      )}

      {/* Risk Assessment */}
      <div className="mb-6">
        <div className={`flex items-center gap-3 mb-3 p-3 rounded-xl border ${getRiskColor(contract.geminiAnalysis.riskAssessment.level)}`}>
          <div className="w-8 h-8 bg-current/20 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold">
            {getRiskText(contract.geminiAnalysis.riskAssessment.level)}
          </span>
        </div>
        {contract.geminiAnalysis.riskAssessment.factors.length > 0 && (
          <ul className="space-y-1 pl-4">
            {contract.geminiAnalysis.riskAssessment.factors.slice(0, 3).map((factor, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-orange-400 text-lg leading-none">•</span>
                {factor}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Deliverables */}
      {contract.deliverables.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm text-blue-400 font-semibold">Livrabile</span>
          </div>
          <ul className="space-y-1 pl-4">
            {contract.deliverables.slice(0, 3).map((deliverable, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-blue-400 text-lg leading-none">•</span>
                {deliverable}
              </li>
            ))}
            {contract.deliverables.length > 3 && (
              <li className="text-sm text-gray-400 pl-3">
                +{contract.deliverables.length - 3} mai multe...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* AI Insights */}
      {contract.geminiAnalysis.insights.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-sm text-green-400 font-semibold">AI Insights</span>
          </div>
          <ul className="space-y-1 pl-4">
            {contract.geminiAnalysis.insights.slice(0, 2).map((insight, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-400 text-lg leading-none">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {contract.geminiAnalysis.warnings.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm text-red-400 font-semibold">Avertismente</span>
          </div>
          <ul className="space-y-1 pl-4">
            {contract.geminiAnalysis.warnings.slice(0, 2).map((warning, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-red-400 text-lg leading-none">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
        </div>
      )}
    </div>
  );
};