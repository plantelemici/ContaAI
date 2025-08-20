import React, { useState } from 'react';
import { Invoice, Client, InvoiceItem } from '../types/accounting';
import { FileText, Plus, Eye, Download, Send, DollarSign, Calendar, User, Edit, Trash2, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';

interface InvoiceManagerProps {
  invoices: Invoice[];
  clients: Client[];
  onCreateInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt' | 'client'>) => void;
  onAddClient?: (client: Omit<Client, 'id' | 'createdAt' | 'totalInvoiced' | 'totalPaid'>) => void;
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({ 
  invoices, 
  clients, 
  onCreateInvoice,
  onAddClient 
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: '', quantity: 1, unitPrice: 0, vatRate: 19, total: 0 }
  ]);
  const [invoiceData, setInvoiceData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 30,
    currency: 'RON',
    notes: '',
    status: 'draft' as const
  });

  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    cui: '',
    regCom: '',
    iban: '',
    bank: '',
    status: 'active' as const
  });

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      case 'sent': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'paid': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'cancelled': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    }
  };

  const getStatusText = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'Ciornă';
      case 'sent': return 'Trimisă';
      case 'paid': return 'Plătită';
      case 'overdue': return 'Întârziată';
      case 'cancelled': return 'Anulată';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
    }
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unitPrice: 0, vatRate: 19, total: 0 }]);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const updateInvoiceItem = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice' || field === 'vatRate') {
      const item = updatedItems[index];
      const subtotal = item.quantity * item.unitPrice;
      const vatAmount = subtotal * (item.vatRate / 100);
      updatedItems[index].total = subtotal + vatAmount;
    }
    
    setInvoiceItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * (item.vatRate / 100));
    }, 0);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const { subtotal, vatAmount, total } = calculateTotals();
    
    const items: InvoiceItem[] = invoiceItems.map((item, index) => ({
      ...item,
      id: `item-${index}`
    }));

    onCreateInvoice({
      clientId: selectedClient,
      issueDate: new Date(invoiceData.issueDate),
      dueDate: new Date(invoiceData.dueDate),
      items,
      subtotal,
      vatAmount,
      total,
      status: invoiceData.status,
      notes: invoiceData.notes,
      paymentTerms: invoiceData.paymentTerms,
      currency: invoiceData.currency
    });

    // Reset form
    setShowCreateForm(false);
    setSelectedClient('');
    setInvoiceItems([{ description: '', quantity: 1, unitPrice: 0, vatRate: 19, total: 0 }]);
    setInvoiceData({
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 30,
      currency: 'RON',
      notes: '',
      status: 'draft'
    });
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddClient) {
      onAddClient(clientData);
    }
    setShowClientForm(false);
    setClientData({
      name: '',
      email: '',
      phone: '',
      address: '',
      cui: '',
      regCom: '',
      iban: '',
      bank: '',
      status: 'active'
    });
  };

  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const draftInvoices = invoices.filter(inv => inv.status === 'draft');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Facturi</h2>
          <p className="text-gray-400">Gestionează facturile emise și clienții</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowClientForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Client Nou
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Factură Nouă
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total facturi</p>
              <p className="text-white text-lg font-semibold">{invoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Plătite</p>
              <p className="text-white text-lg font-semibold">{paidInvoices.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">În așteptare</p>
              <p className="text-white text-lg font-semibold">{invoices.filter(inv => inv.status === 'sent').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Întârziate</p>
              <p className="text-white text-lg font-semibold">{overdueInvoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="p-6">
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{invoice.number}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {invoice.client.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {invoice.issueDate.toLocaleDateString('ro-RO')}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Scadență: {invoice.dueDate.toLocaleDateString('ro-RO')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-semibold">{invoice.total.toLocaleString()} {invoice.currency}</p>
                    <span className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Send className="w-4 h-4 text-blue-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-yellow-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {invoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Nu există facturi emise</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  Creează prima factură
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Factură Nouă</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-6">
              {/* Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selectează client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status</label>
                  <select
                    value={invoiceData.status}
                    onChange={(e) => setInvoiceData({ ...invoiceData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Ciornă</option>
                    <option value="sent">Trimisă</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Data emiterii</label>
                  <input
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Data scadenței</label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Termeni plată (zile)</label>
                  <input
                    type="number"
                    value={invoiceData.paymentTerms}
                    onChange={(e) => setInvoiceData({ ...invoiceData, paymentTerms: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Articole factură</h4>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă articol
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Descriere"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Cantitate"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Preț unitar"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="TVA %"
                          value={item.vatRate}
                          onChange={(e) => updateInvoiceItem(index, 'vatRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        <span className="text-white font-medium">
                          {((item.quantity * item.unitPrice) * (1 + item.vatRate / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(index)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                          disabled={invoiceItems.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white font-medium">{calculateTotals().subtotal.toFixed(2)} RON</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">TVA:</span>
                      <span className="text-white font-medium">{calculateTotals().vatAmount.toFixed(2)} RON</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-white/20 pt-2">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">{calculateTotals().total.toFixed(2)} RON</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Note</label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Note suplimentare..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                >
                  Creează Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Client Nou</h3>
              <button
                onClick={() => setShowClientForm(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nume client"
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={clientData.email}
                  onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  placeholder="Telefon"
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="CUI"
                  value={clientData.cui}
                  onChange={(e) => setClientData({ ...clientData, cui: e.target.value })}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <textarea
                placeholder="Adresă"
                value={clientData.address}
                onChange={(e) => setClientData({ ...clientData, address: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="IBAN"
                  value={clientData.iban}
                  onChange={(e) => setClientData({ ...clientData, iban: e.target.value })}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Bancă"
                  value={clientData.bank}
                  onChange={(e) => setClientData({ ...clientData, bank: e.target.value })}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClientForm(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300"
                >
                  Salvează Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};