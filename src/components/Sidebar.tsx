import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  BarChart3, 
  CreditCard, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Building, 
  User, 
  Contact as FileContract,
  ChevronDown,
  ChevronRight,
  Home,
  FolderOpen,
  Calculator,
  PieChart,
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
  children?: MenuItem[];
  badge?: string;
  color?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main', 'financial']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const menuGroups = [
    {
      id: 'main',
      label: 'Principal',
      items: [
        { id: 'dashboard', icon: Home, label: 'Dashboard', count: null, color: 'text-blue-400' },
        { id: 'upload', icon: Upload, label: 'Încărcare', count: null, color: 'text-green-400' },
      ]
    },
    {
      id: 'documents',
      label: 'Documente',
      items: [
        { id: 'documents', icon: FileText, label: 'Toate Documentele', count: 12, color: 'text-purple-400' },
        { id: 'contracts', icon: FileContract, label: 'Contracte', count: 8, color: 'text-indigo-400' },
        { id: 'invoices', icon: Building, label: 'Facturi', count: 15, color: 'text-pink-400' },
      ]
    },
    {
      id: 'financial',
      label: 'Financiar',
      items: [
        { id: 'income', icon: TrendingUp, label: 'Venituri', count: 5, color: 'text-green-400' },
        { id: 'expenses', icon: TrendingDown, label: 'Cheltuieli', count: 18, color: 'text-red-400' },
        { id: 'reconciliation', icon: CreditCard, label: 'Reconciliere', count: 3, color: 'text-cyan-400' },
      ]
    },
    {
      id: 'business',
      label: 'Business',
      items: [
        { id: 'inventory', icon: Package, label: 'Inventar', count: 45, color: 'text-emerald-400' },
        { id: 'reports', icon: BarChart3, label: 'Rapoarte', count: null, color: 'text-orange-400' },
      ]
    },
    {
      id: 'system',
      label: 'Sistem',
      items: [
        { id: 'settings', icon: Settings, label: 'Setări', count: null, color: 'text-gray-400' },
      ]
    }
  ];

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const isActive = activeView === item.id;
    
    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
          isActive
            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg backdrop-blur-sm border border-blue-500/30'
            : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'
        } ${isChild ? 'ml-4 py-2' : ''}`}
      >
        <div className={`w-5 h-5 flex items-center justify-center ${
          isActive ? item.color || 'text-blue-400' : 'text-gray-400 group-hover:text-white'
        }`}>
          <item.icon className="w-5 h-5" />
        </div>
        <span className={`font-medium flex-1 text-left ${isChild ? 'text-sm' : ''}`}>
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
        {item.badge && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-72 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ContaAI</h1>
            <p className="text-sm text-gray-400">Contabilitate Inteligentă</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Sistem Activ</span>
          </div>
          <p className="text-gray-400 text-xs">AI procesează documentele</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          
          return (
            <div key={group.id} className="space-y-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center gap-2 px-2 py-1 text-gray-400 hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                {group.label}
              </button>
              
              {isExpanded && (
                <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {group.items.map((item) => renderMenuItem(item))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm font-medium">Statistici Rapide</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Documente procesate:</span>
              <span className="text-green-400 font-semibold">127</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Această lună:</span>
              <span className="text-blue-400 font-semibold">23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};