
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { SolutionData } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ChatBotProps {
  solutions: SolutionData[];
  userName: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  isError?: boolean;
}

export const ChatBot: React.FC<ChatBotProps> = ({ solutions, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize System Context with Solutions Data
  const systemInstruction = `
    Você é um Consultor Especialista da METARH, uma empresa de Recursos Humanos.
    Seu objetivo é ajudar consultores comerciais a encontrarem a melhor solução para seus clientes.
    
    Você tem acesso EXCLUSIVO à seguinte Árvore de Soluções (Portfólio):
    ${JSON.stringify(solutions.map(s => ({
        pacote: s.solutionPackage,
        servico: s.name,
        descricao: s.description,
        beneficios: s.benefits,
        dores_cliente: s.publicNeeds,
        sla: s.sla
    })))}

    Diretrizes:
    1. Responda de forma curta, persuasiva e direta (estilo comercial).
    2. Sempre recomende um serviço específico da lista acima.
    3. Se o usuário citar uma "dor" (ex: turnover alto), conecte com a solução ideal.
    4. Use formatação Markdown (negrito, tópicos) para facilitar a leitura.
    5. O usuário se chama ${userName}. Seja cordial, mas focado em negócios.
  `;

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: `Olá, ${userName}! Sou sua Inteligência Artificial METARH. \n\nPosso analisar dores dos clientes, comparar serviços ou criar argumentos de venda. Como posso ajudar hoje?`,
          sender: 'bot'
        }
      ]);
    }
  }, [userName, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    
    // Add User Message
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userText, sender: 'user' }]);
    setIsLoading(true);

    try {
        // Initialize Gemini
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Call Model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: userText }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7, // Balance between creative and factual
            }
        });

        const botResponse = response.text || "Desculpe, não consegui processar essa resposta agora.";

        setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            text: botResponse, 
            sender: 'bot' 
        }]);

    } catch (error) {
        console.error("Erro na IA:", error);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: "Erro de conexão com a IA. Verifique sua chave API.", 
            sender: 'bot',
            isError: true
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group
            ${isOpen ? 'bg-gray-800 rotate-90 scale-0 opacity-0' : 'bg-gradient-to-r from-metarh-medium to-metarh-dark text-white hover:scale-110'}
        `}
      >
        <Sparkles size={24} className="animate-pulse" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[90vw] md:w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right border border-gray-100 ring-1 ring-gray-100
            ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="bg-metarh-dark p-5 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-metarh-pink to-metarh-medium rounded-xl shadow-lg">
                    <Bot size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight">IA Consultiva</h3>
                    <p className="text-xs text-white/70 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Gemini Powered
                    </p>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={24} />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50 custom-scrollbar">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm
                            ${msg.sender === 'user' 
                                ? 'bg-metarh-dark text-white rounded-2xl rounded-tr-sm' 
                                : msg.isError 
                                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-2xl'
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-tl-sm'
                            }
                        `}
                    >
                        {msg.isError && <AlertCircle size={16} className="mb-1 inline-block mr-1"/>}
                        <div 
                            className="markdown-content"
                            dangerouslySetInnerHTML={{ 
                                __html: msg.text
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                                    .replace(/\n/g, '<br/>') // Line breaks
                                    .replace(/^- (.*)/gm, '• $1') // Lists
                            }} 
                        />
                    </div>
                </div>
            ))}
            
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-metarh-medium rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-metarh-medium rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-metarh-medium rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pergunte sobre soluções..."
                disabled={isLoading}
                className="flex-1 px-5 py-3.5 rounded-full bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-metarh-medium focus:bg-white outline-none text-sm transition-all"
            />
            <button 
                type="submit" 
                disabled={!inputText.trim() || isLoading}
                className="p-3.5 bg-metarh-medium text-white rounded-full hover:bg-metarh-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 transform hover:-translate-y-0.5"
            >
                <Send size={20} />
            </button>
        </form>
      </div>
    </>
  );
};
