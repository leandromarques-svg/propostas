import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { SolutionData } from '../types';

interface ChatBotProps {
  solutions?: SolutionData[];
  userName: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  isError?: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({ solutions = [], userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: `Olá, ${userName}! Sou seu Assistente METARH.\n\nPosso ajudar a encontrar soluções no portfólio para o seu cliente ou tirar dúvidas sobre os pacotes de serviços. Como posso ajudar hoje?`,
          sender: 'bot'
        }
      ]);
    }
  }, [userName, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');

    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user' }]);
    setIsLoading(true);

    setTimeout(() => {
      const query = userText.toLowerCase();
      const matched = solutions.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.solutionPackage.toLowerCase().includes(query) ||
        s.publicNeeds.some(need => need.toLowerCase().includes(query))
      );

      let reply = '';
      if (matched.length > 0) {
        reply = `Encontrei **${matched.length}** solução(ões) recomendada(s):\n\n` +
          matched.slice(0, 3).map(s => `• **${s.name}** (${s.solutionPackage}): ${s.description}`).join('\n\n') +
          '\n\nVocê pode adicionar esses serviços à sua proposta navegando pelo catálogo.';
      } else {
        reply = `Entendido! Você pode explorar nossas soluções no catálogo por categorias como **Business**, **Staffing**, **Talent**, **Tech Recruiter** e **Trilhando +** para montar uma proposta personalizada.`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'bot'
      }]);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-metarh-medium text-white p-4 rounded-full shadow-2xl hover:bg-metarh-dark hover:scale-105 transition-all flex items-center gap-2 group"
        >
          <Bot size={24} className="group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-sm hidden md:inline">Assistente</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-metarh-pink opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-metarh-pink"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-[90vw] md:w-[400px] h-[550px] flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-metarh-dark to-metarh-medium p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-sm">
                <Bot size={20} className="text-metarh-lime" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Assistente METARH <Sparkles size={14} className="text-metarh-yellow" />
                </h3>
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Portfólio Ativo
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-metarh-medium text-white rounded-br-none shadow-md shadow-metarh-medium/10'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs md:text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-metarh-medium animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-metarh-medium animate-bounce [animation-delay:-.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-metarh-medium animate-bounce [animation-delay:-.5s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua dúvida ou busque um serviço..."
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-metarh-medium focus:ring-1 focus:ring-metarh-medium transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-metarh-medium hover:bg-metarh-dark text-white p-2.5 rounded-full disabled:opacity-50 transition-colors shadow-md shadow-metarh-medium/20"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};