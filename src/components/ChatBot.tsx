import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { ChatMessage } from '../types/accounting';
import { Document, Transaction } from '../types';

interface ChatBotProps {
  chatHistory: ChatMessage[];
  onAddMessage: (message: string, response: string, type?: ChatMessage['type']) => void;
  documents: Document[];
  transactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
  companyName: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ 
  chatHistory, 
  onAddMessage, 
  documents, 
  transactions, 
  totalRevenue, 
  totalExpenses,
  companyName 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const generateResponse = (userMessage: string): { response: string; type: ChatMessage['type'] } => {
    const msg = userMessage.toLowerCase();
    
    // Analiza financiară
    if (msg.includes('venit') || msg.includes('încasar') || msg.includes('profit')) {
      return {
        response: `Analiza veniturilor pentru ${companyName}:
        
• Venituri totale: ${totalRevenue.toLocaleString()} RON
• Cheltuieli totale: ${totalExpenses.toLocaleString()} RON  
• Profit net: ${(totalRevenue - totalExpenses).toLocaleString()} RON
• Marja de profit: ${totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0}%

${totalRevenue - totalExpenses > 0 ? '✅ Compania este profitabilă' : '⚠️ Compania înregistrează pierderi'}`,
        type: 'analysis'
      };
    }

    // Informații despre documente
    if (msg.includes('document') || msg.includes('factur') || msg.includes('bon')) {
      const completedDocs = documents.filter(d => d.status === 'completed').length;
      const processingDocs = documents.filter(d => d.status === 'processing').length;
      
      return {
        response: `Status documente pentru ${companyName}:

• Total documente: ${documents.length}
• Procesate cu succes: ${completedDocs}
• În procesare: ${processingDocs}
• Rata de succes: ${documents.length > 0 ? (completedDocs / documents.length * 100).toFixed(1) : 0}%

${processingDocs > 0 ? `⏳ ${processingDocs} documente se procesează momentan` : '✅ Toate documentele sunt procesate'}`,
        type: 'analysis'
      };
    }

    // Analiza tranzacțiilor
    if (msg.includes('tranzac') || msg.includes('plat') || msg.includes('cheltuiel')) {
      const incomeTransactions = transactions.filter(t => t.type === 'income');
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      
      return {
        response: `Analiza tranzacțiilor pentru ${companyName}:

• Total tranzacții: ${transactions.length}
• Tranzacții venituri: ${incomeTransactions.length}
• Tranzacții cheltuieli: ${expenseTransactions.length}
• Valoare medie venit: ${incomeTransactions.length > 0 ? (incomeTransactions.reduce((sum, t) => sum + t.amount, 0) / incomeTransactions.length).toLocaleString() : 0} RON
• Valoare medie cheltuială: ${expenseTransactions.length > 0 ? (expenseTransactions.reduce((sum, t) => sum + t.amount, 0) / expenseTransactions.length).toLocaleString() : 0} RON`,
        type: 'analysis'
      };
    }

    // Categorii de cheltuieli
    if (msg.includes('categor') || msg.includes('breakdown')) {
      const categories = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

      const sortedCategories = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      return {
        response: `Top 5 categorii de cheltuieli pentru ${companyName}:

${sortedCategories.map(([category, amount], index) => 
  `${index + 1}. ${category}: ${amount.toLocaleString()} RON`
).join('\n')}

💡 Recomandare: Monitorizează categoria cu cele mai mari cheltuieli pentru optimizări.`,
        type: 'analysis'
      };
    }

    // Recomandări generale
    if (msg.includes('recomand') || msg.includes('sfat') || msg.includes('optimiz')) {
      const profitMargin = totalRevenue > 0 ? (totalRevenue - totalExpenses) / totalRevenue * 100 : 0;
      
      let recommendations = [`Recomandări pentru ${companyName}:`];
      
      if (profitMargin < 10) {
        recommendations.push('⚠️ Marja de profit este scăzută. Analizează posibilitatea de creștere a prețurilor sau reducerea costurilor.');
      }
      
      if (documents.length < 10) {
        recommendations.push('📄 Încarcă mai multe documente pentru o analiză mai precisă.');
      }
      
      if (transactions.length > 0) {
        const avgTransaction = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length;
        if (avgTransaction < 100) {
          recommendations.push('💰 Valoarea medie a tranzacțiilor este mică. Consideră servicii cu valoare mai mare.');
        }
      }
      
      recommendations.push('✅ Continuă să folosești AI pentru procesarea automată a documentelor.');
      recommendations.push('📊 Verifică rapoartele lunare pentru tendințe.');
      
      return {
        response: recommendations.join('\n\n'),
        type: 'analysis'
      };
    }

    // Răspuns general
    return {
      response: `Salut! Sunt asistentul AI pentru contabilitatea companiei ${companyName}. 

Pot să te ajut cu:
• 📊 Analize financiare (venituri, cheltuieli, profit)
• 📄 Status documente și facturi  
• 💳 Informații despre tranzacții
• 📈 Breakdown pe categorii
• 💡 Recomandări de optimizare

Întreabă-mă orice despre datele financiare ale companiei!`,
      type: 'question'
    };
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setIsTyping(true);

    // Simulăm un delay pentru răspuns
    setTimeout(() => {
      const { response, type } = generateResponse(userMessage);
      onAddMessage(userMessage, response, type);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    { text: "Care sunt veniturile totale?", icon: TrendingUp },
    { text: "Status documente procesate", icon: FileText },
    { text: "Analiza pe categorii", icon: DollarSign },
    { text: "Recomandări de optimizare", icon: Bot }
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">Asistent AI</h3>
                <p className="text-gray-400 text-xs">Contabilitate inteligentă</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-sm mb-4">
                  Salut! Sunt aici să te ajut cu analiza datelor financiare.
                </p>
                <div className="space-y-2">
                  {quickQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(q.text)}
                      className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm text-gray-300 transition-colors flex items-center gap-2"
                    >
                      <q.icon className="w-4 h-4" />
                      {q.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((chat) => (
              <div key={chat.id} className="space-y-3">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rounded-br-md p-3">
                    <p className="text-white text-sm">{chat.message}</p>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="max-w-[80%] bg-white/5 rounded-2xl rounded-bl-md p-3">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans">{chat.response}</pre>
                    <p className="text-gray-500 text-xs mt-2">
                      {chat.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-bl-md p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Întreabă despre datele financiare..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};