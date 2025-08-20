import React, { useState } from 'react';
import { Contract } from '../types/contracts';
import { ContractCard } from './ContractCard';
import { FileUpload } from './FileUpload';
import { DateFilter } from './DateFilter';
import { 
  FileText, 
  Plus, 
  Filter,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ContractsManagerProps {
  contracts: Contract[];
  onProcessContract: (file: File) => void;
  isProcessing: boolean;
  onLinkInvoice?: (contractId: string) => void;
}

export const ContractsManager: React.FC<ContractsManagerProps> = ({ 
  contracts, 
  onProcessContract, 
  isProcessing,
  onLinkInvoice 
}) => {
  const [showUpload, setShowUpload] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const expiringSoon = contracts.filter(c => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return c.endDate <= thirtyDaysFromNow && c.status === 'active';
  }).length;
  const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);

  const filteredAndSortedContracts = contracts
    .filter(contract => {
      if (statusFilter !== 'all' && contract.status !== statusFilter) return false;
      if (typeFilter !== 'all' && contract.type !== typeFilter) return false;
      if (monthFilter || yearFilter) {
        const contractDate = new Date(contract.createdAt);
        const contractYear = contractDate.getFullYear().toString();
        const contractMonth = (contractDate.getMonth() + 1).toString().padStart(2, '0');
        
        if (yearFilter && contractYear !== yearFilter) return false;
        if (monthFilter && contractMonth !== monthFilter) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'value-high':
          return b.value - a.value;
        case 'value-low':
          return a.value - b.value;
        case 'end-date':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Contracte</h2>
          <p className="text-gray-400">Gestionează contractele cu extragere AI</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Contract Nou
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Contracte</p>
              <p className="text-2xl font-bold text-white mt-1">{contracts.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{activeContracts}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Expiră în 30 zile</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{expiringSoon}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Valoare Totală</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalValue.toLocaleString()} RON</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Toate statusurile</option>
            <option value="draft">Ciornă</option>
            <option value="active">Activ</option>
            <option value="completed">Finalizat</option>
            <option value="cancelled">Anulat</option>
            <option value="expired">Expirat</option>
          </select>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Toate tipurile</option>
            <option value="service">Servicii</option>
            <option value="supply">Furnizare</option>
            <option value="maintenance">Mentenanță</option>
            <option value="consulting">Consultanță</option>
            <option value="other">Altele</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="newest">Cele mai noi</option>
            <option value="oldest">Cele mai vechi</option>
            <option value="value-high">Valoare mare</option>
            <option value="value-low">Valoare mică</option>
            <option value="end-date">Data expirării</option>
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
          {filteredAndSortedContracts.length} din {contracts.length} contracte
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Încarcă Contract Nou</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <FileUpload onFileUpload={onProcessContract} isProcessing={isProcessing} />
            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-400 font-medium">
                    Se procesează contractul cu AI...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredAndSortedContracts.map((contract) => (
          <ContractCard 
            key={contract.id} 
            contract={contract} 
            onLinkInvoice={onLinkInvoice}
          />
        ))}
        
        {filteredAndSortedContracts.length === 0 && contracts.length > 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Nu s-au găsit contracte</h3>
            <p className="text-gray-400 mb-6">Încearcă să modifici filtrele de căutare</p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setMonthFilter('');
                setYearFilter('');
                setSortBy('newest');
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl text-white font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-300"
            >
              Resetează filtrele
            </button>
          </div>
        )}
        
        {contracts.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Nu există contracte încărcate</h3>
            <p className="text-gray-400 mb-6">Începe prin a încărca primul contract pentru procesare cu AI</p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl text-white font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Încarcă primul contract
            </button>
          </div>
        )}
      </div>
    </div>
  );
};