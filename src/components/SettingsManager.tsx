import React, { useState } from 'react';
import { CompanySettings } from '../types/accounting';
import { Settings, Building, Save, Upload, Download, Trash2 } from 'lucide-react';

interface SettingsManagerProps {
  settings: CompanySettings;
  onUpdateSettings: (settings: CompanySettings) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState(settings);
  const [activeTab, setActiveTab] = useState('company');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
  };

  const tabs = [
    { id: 'company', label: 'Companie', icon: Building },
    { id: 'fiscal', label: 'Setări Fiscale', icon: Settings },
    { id: 'backup', label: 'Backup & Export', icon: Download }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Setări</h2>
        <p className="text-gray-400">Configurează aplicația și datele companiei</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Company Settings */}
      {activeTab === 'company' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Informații Companie</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nume Companie</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Numele companiei"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">CUI</label>
                <input
                  type="text"
                  value={formData.cui}
                  onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Codul Unic de Înregistrare"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nr. Reg. Com.</label>
                <input
                  type="text"
                  value={formData.regCom}
                  onChange={(e) => setFormData({ ...formData, regCom: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Numărul de înregistrare"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Numărul de telefon"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresa de email"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="www.compania.ro"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Adresă</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Adresa completă a companiei"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvează Modificările
            </button>
          </form>
        </div>
      )}

      {/* Fiscal Settings */}
      {activeTab === 'fiscal' && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Setări Fiscale</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Cota TVA (%)</label>
                <input
                  type="number"
                  value={formData.vatRate}
                  onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Monedă</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RON">RON</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">An Fiscal</label>
                <input
                  type="text"
                  value={formData.fiscalYear}
                  onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Prefix Factură</label>
                <input
                  type="text"
                  value={formData.invoicePrefix}
                  onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="INV"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Următorul Număr</label>
                <input
                  type="number"
                  value={formData.invoiceCounter}
                  onChange={(e) => setFormData({ ...formData, invoiceCounter: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvează Setările
            </button>
          </form>
        </div>
      )}

      {/* Backup & Export */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Export Date</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <Download className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-medium">Export Facturi</p>
                <p className="text-gray-400 text-sm">PDF/Excel</p>
              </button>
              <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <Download className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-medium">Export Tranzacții</p>
                <p className="text-gray-400 text-sm">CSV/Excel</p>
              </button>
              <button className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <Download className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-medium">Backup Complet</p>
                <p className="text-gray-400 text-sm">JSON</p>
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Import Date</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">Importă backup sau date externe</p>
                <p className="text-gray-400 text-sm mb-4">Suportă JSON, CSV, Excel</p>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                  Selectează Fișier
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Zona Periculoasă
            </h3>
            <p className="text-gray-300 mb-4">
              Aceste acțiuni sunt ireversibile. Asigură-te că ai un backup înainte de a continua.
            </p>
            <div className="space-y-3">
              <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors">
                Șterge Toate Tranzacțiile
              </button>
              <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors">
                Resetează Aplicația
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};