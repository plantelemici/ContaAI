import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  BarChart3, 
  CreditCard, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Building, 
  Contact as FileContract,
  Home,
  Calculator,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

interface MenuItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  count?: number | null;
  color?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-400' },
    { id: 'upload', icon: Upload, label: 'Încărcare', color: 'text-green-400' },
    { id: 'documents', icon: FileText, label: 'Documente', count: 12, color: 'text-purple-400' },
    { id: 'contracts', icon: FileContract, label: 'Contracte', count: 8, color: 'text-indigo-400' },
    { id: 'invoices', icon: Building, label: 'Facturi', count: 15, color: 'text-pink-400' },
    { id: 'income', icon: TrendingUp, label: 'Venituri', count: 5, color: 'text-green-400' },
    { id: 'expenses', icon: TrendingDown, label: 'Cheltuieli', count: 18, color: 'text-red-400' },
    { id: 'reconciliation', icon: CreditCard, label: 'Reconciliere', count: 3, color: 'text-cyan-400' },
    { id: 'inventory', icon: Package, label: 'Inventar', count: 45, color: 'text-emerald-400' },
    { id: 'reports', icon: BarChart3, label: 'Rapoarte', color: 'text-orange-400' },
    { id: 'settings', icon: Settings, label: 'Setări', color: 'text-gray-400' },
  ];

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeView === item.id;
    
    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
          isActive
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg backdrop-blur-sm border border-blue-500/30'
            : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
        }`}
      >
        <div className={`w-5 h-5 flex items-center justify-center ${
          isActive ? item.color || 'text-blue-400' : 'text-gray-400 group-hover:text-white'
        }`}>
          <item.icon className="w-5 h-5" />
        </div>
        <span className="font-medium flex-1 text-left">
          {item.label}
        </span>
        {item.count !== null && item.count !== undefined && (
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            isActive 
              ? 'bg-blue-500/30 text-blue-200' 
              : 'bg-white/10 text-gray-300 group-hover:bg-white/20 group-hover:text-white'
          }`}>
            {item.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-64 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ContaAI</h1>
            <p className="text-xs text-gray-400">Contabilitate Inteligentă</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => renderMenuItem(item))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm font-medium">Statistici</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Procesate:</span>
              <span className="text-green-400 font-semibold">127</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Luna aceasta:</span>
              <span className="text-blue-400 font-semibold">23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};