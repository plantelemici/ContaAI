import React, { useState } from 'react';
import { FileText, Calendar, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DocumentCard } from './components/DocumentCard';
import { FileUpload } from './components/FileUpload';
import { CompanyProfile } from './components/CompanyProfile';
import { ChatBot } from './components/ChatBot';
import { InvoiceManager } from './components/InvoiceManager';
import { ReportsManager } from './components/ReportsManager';
import { InventoryManager } from './components/InventoryManager';
import { SettingsManager } from './components/SettingsManager';
import { useDocuments } from './hooks/useDocuments';
import { useAccounting } from './hooks/useAccounting';
import { useContracts } from './hooks/useContracts';
import { useBankReconciliation } from './hooks/useBankReconciliation';
import { ContractsManager } from './components/ContractsManager';
import { BankReconciliationManager } from './components/BankReconciliationManager';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { documents, transactions, isProcessing, processDocument } = useDocuments();
  const { contracts, isProcessing: isProcessingContract, processContract, linkInvoice } = useContracts();
  const { 
    suppliers, 
    invoices, 
    clients,
    products, 
    taxReports, 
    bankAccounts, 
    budgets, 
    companySettings,
    chatHistory,
    addClient,
    addSupplier,
    addProduct,
    createInvoice,
    generateTaxReport,
    addBankAccount,
    createBudget,
    setCompanySettings,
    addChatMessage
  } = useAccounting();
  const { 
    bankStatements, 
    bankTransactions, 
    reconciliations, 
    isProcessing: isProcessingBank, 
    processBankStatement, 
    manualReconcile,
    getReconciliationSummary 
  } = useBankReconciliation(documents, transactions, invoices);

  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            documents={documents} 
            transactions={transactions}
            contracts={contracts}
            bankStatements={bankStatements}
            reconciliations={reconciliations}
            invoices={invoices}
            products={products}
            companySettings={companySettings}
          />
        );
      
      case 'upload':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Încărcare Documente</h2>
              <p className="text-gray-400">
                Încarcă facturi, bonuri și documente contabile pentru procesare automată cu AI
              </p>
            </div>
            <FileUpload onFileUpload={processDocument} isProcessing={isProcessing} />
          </div>
        );
      
      case 'contracts':
        return (
          <ContractsManager 
            contracts={contracts}
            onProcessContract={processContract}
            isProcessing={isProcessingContract}
            onLinkInvoice={linkInvoice}
          />
        );
      
      case 'documents':
        const filteredAndSortedDocuments = documents
          .filter(doc => {
            if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
            if (dateFilter && doc.documentDate) {
              const docDate = new Date(doc.documentDate.split('.').reverse().join('-'));
              const filterDate = new Date(dateFilter);
              return docDate.toDateString() === filterDate.toDateString();
            }
            return true;
          })
          .sort((a, b) => {
            switch (sortBy) {
              case 'newest':
                return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
              case 'oldest':
                return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
              case 'document-date-newest':
                if (!a.documentDate || !b.documentDate) return 0;
                const dateA = new Date(a.documentDate.split('.').reverse().join('-'));
                const dateB = new Date(b.documentDate.split('.').reverse().join('-'));
                return dateB.getTime() - dateA.getTime();
              case 'document-date-oldest':
                if (!a.documentDate || !b.documentDate) return 0;
                const dateA2 = new Date(a.documentDate.split('.').reverse().join('-'));
                const dateB2 = new Date(b.documentDate.split('.').reverse().join('-'));
                return dateA2.getTime() - dateB2.getTime();
              case 'amount-high':
                const amountA = parseFloat(a.amount.replace(/[^\d.-]/g, '')) || 0;
                const amountB = parseFloat(b.amount.replace(/[^\d.-]/g, '')) || 0;
                return amountB - amountA;
              case 'amount-low':
                const amountA2 = parseFloat(a.amount.replace(/[^\d.-]/g, '')) || 0;
                const amountB2 = parseFloat(b.amount.replace(/[^\d.-]/g, '')) || 0;
                return amountA2 - amountB2;
              default:
                return 0;
            }
          });
        
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Documente</h2>
              <p className="text-gray-400">
                Toate documentele procesate și analizate de sistemul AI
              </p>
            </div>
            
            {/* Filter and Sort Controls */}
            <div className="flex items-center justify-between mb-6 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex items-center gap-4">
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toate categoriile</option>
                  <option value="Transport">Transport</option>
                  <option value="Servicii">Servicii</option>
                  <option value="Materiale">Materiale</option>
                  <option value="Utilitati">Utilități</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Cele mai noi</option>
                  <option value="oldest">Cele mai vechi</option>
                  <option value="document-date-newest">Data document (nouă)</option>
                  <option value="document-date-oldest">Data document (veche)</option>
                  <option value="amount-high">Sumă mare</option>
                  <option value="amount-low">Sumă mică</option>
                </select>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Filtrează după dată"
                  />
                  {dateFilter && (
                    <button
                      onClick={() => setDateFilter('')}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      title="Șterge filtrul de dată"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {filteredAndSortedDocuments.length} din {documents.length} documente
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
              {filteredAndSortedDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
              {filteredAndSortedDocuments.length === 0 && documents.length > 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nu s-au găsit documente</h3>
                  <p className="text-gray-400 mb-6">Încearcă să modifici filtrele de căutare</p>
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setDateFilter('');
                      setSortBy('newest');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Resetează filtrele
                  </button>
                </div>
              )}
              {documents.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Nu există documente încărcate</h3>
                  <p className="text-gray-400 mb-6">Începe prin a încărca primul document pentru procesare cu AI</p>
                  <button
                    onClick={() => setActiveView('upload')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Încarcă primul document
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'invoices':
        return <InvoiceManager invoices={invoices} clients={clients} onCreateInvoice={createInvoice} onAddClient={addClient} />;
      
      case 'inventory':
        return <InventoryManager products={products} onAddProduct={addProduct} />;
      
      case 'reconciliation':
        return (
          <BankReconciliationManager 
            bankStatements={bankStatements}
            bankTransactions={bankTransactions}
            reconciliations={reconciliations}
            isProcessing={isProcessingBank}
            onProcessBankStatement={processBankStatement}
            onManualReconcile={manualReconcile}
            reconciliationSummary={getReconciliationSummary()}
          />
        );
      
      case 'income':
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Venituri</h2>
              <p className="text-gray-400">Toate veniturile înregistrate</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="p-6">
                <div className="space-y-4">
                  {incomeTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-sm">{transaction.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-semibold">+{transaction.amount} RON</p>
                        <p className="text-gray-400 text-sm">{transaction.date.toLocaleDateString('ro-RO')}</p>
                      </div>
                    </div>
                  ))}
                  {incomeTransactions.length === 0 && (
                    <p className="text-gray-400 text-center py-8">Nu există venituri înregistrate</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'expenses':
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Cheltuieli</h2>
              <p className="text-gray-400">Toate cheltuielile înregistrate</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="p-6">
                <div className="space-y-4">
                  {expenseTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-sm">{transaction.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-semibold">-{transaction.amount} RON</p>
                        <p className="text-gray-400 text-sm">{transaction.date.toLocaleDateString('ro-RO')}</p>
                      </div>
                    </div>
                  ))}
                  {expenseTransactions.length === 0 && (
                    <p className="text-gray-400 text-center py-8">Nu există cheltuieli înregistrate</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <ReportsManager 
            transactions={transactions} 
            taxReports={taxReports} 
            contracts={contracts}
            bankStatements={bankStatements}
            invoices={invoices}
            products={products}
            onGenerateReport={generateTaxReport} 
          />
        );
      
      case 'settings':
        return <SettingsManager settings={companySettings} onUpdateSettings={setCompanySettings} />;
      
      default:
        return (
          <div className="p-6 flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">În dezvoltare</h2>
              <p className="text-gray-400">Această secțiune este în dezvoltare</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 flex overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
      <ChatBot 
        chatHistory={chatHistory}
        onAddMessage={addChatMessage}
        documents={documents}
        transactions={transactions}
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        companyName={companySettings.name || 'Compania Ta'}
      />
    </div>
  );
}

export default App;