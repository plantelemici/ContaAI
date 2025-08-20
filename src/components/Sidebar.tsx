import React from 'react';
import { FileText, Upload, BarChart3, CreditCard, Settings, TrendingUp, TrendingDown, DollarSign, Package, Building, User, Contact as FileContract } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard', count: null },
    { id: 'upload', icon: Upload, label: 'Încărcare Documente', count: null },
    { id: 'documents', icon: FileText, label: 'Documente', count: 12 },
    { id: 'contracts', icon: FileContract, label: 'Contracte', count: 8 },
    { id: 'invoices', icon: Building, label: 'Facturi', count: 15 },
    { id: 'inventory', icon: Package, label: 'Inventar', count: 45 },
    { id: 'reconciliation', icon: CreditCard, label: 'Reconciliere Bancară', count: 3 },
    { id: 'income', icon: TrendingUp, label: 'Venituri', count: 5 },
    { id: 'expenses', icon: TrendingDown, label: 'Cheltuieli', count: 18 },
    { id: 'reports', icon: DollarSign, label: 'Rapoarte', count: null },
    { id: 'settings', icon: Settings, label: 'Setări', count: null },
  ];

  return (
    <div className="w-64 h-full bg-black/20 backdrop-blur-xl border-r border-white/10">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ContaAI</h1>
            <p className="text-sm text-gray-400">Contabilitate Inteligentă</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeView === item.id
                  ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.count !== null && (
                <span className="ml-auto bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};