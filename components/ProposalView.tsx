

import React, { useState } from 'react';
import { CartItem, User, SavedProposal } from '../types';
import { Trash2, ArrowLeft, Download, FileText, CheckCircle, Wrench, Users, ChevronDown, ChevronUp, Target, History, Calendar, Check } from 'lucide-react';

interface ProposalViewProps {
  cart: CartItem[];
  user: User;
  history: SavedProposal[];
  onRemove: (id: string) => void;
  onBack: () => void;
  onSaveToHistory: (proposal: SavedProposal) => void;
}

export const ProposalView: React.FC<ProposalViewProps> = ({ cart, user, history, onRemove, onBack, onSaveToHistory }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [clientName, setClientName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generatePDF = async () => {
    if (!clientName.trim()) {
      alert('Por favor, insira o nome do cliente.');
      return;
    }
    
    setIsGenerating(true);

    // @ts-ignore - jsPDF loaded via CDN
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxLineWidth = pageWidth - margin * 2;

    // METARH Branding Colors
    const primaryColor = '#470082'; // Dark Purple
    const accentColor = '#aa3ffe';  // Medium Purple
    const grayColor = '#6b7280';

    // --- HEADER ---
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Proposta Comercial', margin, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('METARH Recursos Humanos', margin, 30);

    // Client Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Cliente: ${clientName}`, margin, 55);
    doc.setFontSize(10);
    doc.setTextColor(grayColor);
    doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, margin, 62);
    
    let yPos = 80;

    cart.forEach((item, index) => {
        const { solution, selections } = item;

        // Check if we need a new page for the title and description
        if (yPos > 240) {
            doc.addPage();
            yPos = 30;
        }

        // --- ITEM HEADER ---
        // Solution Package Tag
        doc.setFontSize(10);
        doc.setTextColor(accentColor);
        doc.setFont('helvetica', 'bold');
        doc.text(solution.solutionPackage.toUpperCase(), margin, yPos);
        yPos += 7;

        // Service Name
        doc.setFontSize(18);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${solution.name}`, margin, yPos);
        yPos += 10;

        // Description
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(solution.description, maxLineWidth);
        doc.text(splitDesc, margin, yPos);
        yPos += (splitDesc.length * 5) + 8;

        // --- SELECTIONS ---
        
        // 1. Contexto / Necessidades (Public Needs)
        if (selections.publicNeeds.length > 0) {
            if (yPos > 250) { doc.addPage(); yPos = 30; }
            doc.setFontSize(11);
            doc.setTextColor(primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Contexto e Necessidades:', margin, yPos);
            yPos += 6;
            
            doc.setTextColor(60, 60, 60);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            selections.publicNeeds.forEach(need => {
                if (yPos > 280) { doc.addPage(); yPos = 30; }
                const splitNeed = doc.splitTextToSize(`• ${need}`, maxLineWidth - 5);
                doc.text(splitNeed, margin + 5, yPos);
                yPos += (splitNeed.length * 5);
            });
            yPos += 4;
        }

        // 2. Benefícios (Benefits)
        if (selections.benefits.length > 0) {
            if (yPos > 250) { doc.addPage(); yPos = 30; }
            doc.setFontSize(11);
            doc.setTextColor(primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Principais Benefícios:', margin, yPos);
            yPos += 6;
            
            doc.setTextColor(60, 60, 60);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            selections.benefits.forEach(benefit => {
                if (yPos > 280) { doc.addPage(); yPos = 30; }
                const splitBenefit = doc.splitTextToSize(`• ${benefit}`, maxLineWidth - 5);
                doc.text(splitBenefit, margin + 5, yPos);
                yPos += (splitBenefit.length * 5);
            });
            yPos += 4;
        }

        // 3. Ferramentas (Tools)
        if (selections.toolsUsed.length > 0) {
            if (yPos > 250) { doc.addPage(); yPos = 30; }
            doc.setFontSize(11);
            doc.setTextColor(primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Ferramentas e Metodologias:', margin, yPos);
            yPos += 6;
            
            doc.setTextColor(60, 60, 60);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            selections.toolsUsed.forEach(tool => {
                if (yPos > 280) { doc.addPage(); yPos = 30; }
                 const splitTool = doc.splitTextToSize(`• ${tool}`, maxLineWidth - 5);
                doc.text(splitTool, margin + 5, yPos);
                yPos += (splitTool.length * 5);
            });
            yPos += 4;
        }

        // --- SLA ---
        if (yPos > 270) { doc.addPage(); yPos = 30; }
        yPos += 2;
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(margin, yPos, maxLineWidth, 14, 2, 2, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Prazo Estimado (SLA):', margin + 4, yPos + 9);
        
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(solution.sla, margin + 45, yPos + 9);
        
        yPos += 25;
        
        // Separator line (except last item)
        if (index < cart.length - 1) {
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPos - 10, pageWidth - margin, yPos - 10);
        }
    });

    // --- CONSULTANT SIGNATURE ---
    doc.addPage();
    const signatureY = 100;
    
    // Background for contact section
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, signatureY, maxLineWidth, 80, 4, 4, 'F');
    
    // Profile
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, margin + 10, signatureY + 20);
    
    doc.setFontSize(11);
    doc.setTextColor(grayColor);
    doc.setFont('helvetica', 'normal');
    doc.text(user.role, margin + 10, signatureY + 28);
    
    // Divider
    doc.setDrawColor(accentColor);
    doc.line(margin + 10, signatureY + 35, margin + 60, signatureY + 35);
    
    // Bio
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'italic');
    const bioSplit = doc.splitTextToSize(`"${user.bio}"`, maxLineWidth - 20);
    doc.text(bioSplit, margin + 10, signatureY + 45);
    
    // Contact Info
    const contactY = signatureY + 45 + (bioSplit.length * 5) + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    
    doc.text('E-mail:', margin + 10, contactY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(user.email, margin + 25, contactY);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('Telefone:', margin + 10, contactY + 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(user.phone, margin + 28, contactY + 7);

    if (user.linkedin) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text('LinkedIn:', margin + 10, contactY + 14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(user.linkedin, margin + 28, contactY + 14);
    }


    // --- FOOTER ---
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Feito por e para pessoas.', pageWidth / 2, pageHeight - 15, { align: 'center' });
        doc.text('www.metarh.com.br', pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    doc.save(`Proposta_METARH_${clientName.replace(/\s+/g, '_')}.pdf`);
    
    // Save to History
    onSaveToHistory({
        id: `prop-${Date.now()}`,
        clientName: clientName,
        date: new Date().toLocaleString('pt-BR'),
        itemsCount: cart.length,
        consultantName: user.name,
        totalSla: cart.map(c => c.solution.sla).join(', ') // Simplified summary
    });

    setIsGenerating(false);
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-metarh-dark">Minhas Propostas</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-full">
            <button
                onClick={() => setActiveTab('current')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'current' ? 'bg-white text-metarh-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Proposta Atual
            </button>
            <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-metarh-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <History size={16} /> Histórico
            </button>
        </div>
      </div>

      {activeTab === 'history' ? (
          /* HISTORY TAB */
          <div className="animate-fade-in">
              {history.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                      <History size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Nenhuma proposta gerada no histórico.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {history.map((prop) => (
                          <div key={prop.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                              <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-800">{prop.clientName}</h3>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                      <span className="flex items-center gap-1"><Calendar size={14}/> {prop.date}</span>
                                      <span className="flex items-center gap-1"><CheckCircle size={14}/> {prop.itemsCount} itens</span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                      Gerada com sucesso
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      ) : (
          /* CURRENT PROPOSTA TAB */
          <>
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white rounded-3xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 p-6 rounded-full mb-6">
                        <FileText size={64} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sua proposta está vazia</h2>
                    <p className="text-gray-500 mb-8 max-w-md">
                    Explore o catálogo de soluções e adicione os itens que deseja incluir na proposta.
                    </p>
                    <button 
                    onClick={onBack}
                    className="px-8 py-3 bg-metarh-medium text-white rounded-full hover:bg-metarh-dark transition-colors font-medium shadow-lg shadow-purple-200"
                    >
                    Ir para Soluções
                    </button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                    {cart.map((item) => {
                        const isExpanded = expandedItems[item.solution.id];
                        
                        return (
                            <div key={item.solution.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <span className="inline-block px-2 py-0.5 bg-metarh-lime/30 text-metarh-dark text-[10px] font-bold rounded-full mb-2 uppercase">
                                                {item.solution.solutionPackage}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-800">{item.solution.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.solution.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => onRemove(item.solution.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Remover item"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mt-6">
                                        <button 
                                            onClick={() => toggleExpand(item.solution.id)}
                                            className="text-sm font-medium text-metarh-medium hover:text-metarh-dark flex items-center gap-1"
                                        >
                                            {isExpanded ? 'Ocultar descrição' : 'Ver descrição completa'}
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-sm space-y-4">
                                        {item.selections.publicNeeds.length > 0 && (
                                            <div>
                                                <p className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                    <Users size={14} className="text-metarh-pink"/> Necessidades
                                                </p>
                                                <ul className="list-disc list-inside text-gray-600 pl-2 space-y-1">
                                                    {item.selections.publicNeeds.map((i, idx) => <li key={idx}>{i}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {item.selections.benefits.length > 0 && (
                                            <div>
                                                <p className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                    <Target size={14} className="text-metarh-medium"/> Benefícios
                                                </p>
                                                <ul className="list-disc list-inside text-gray-600 pl-2 space-y-1">
                                                    {item.selections.benefits.map((i, idx) => <li key={idx}>{i}</li>)}
                                                </ul>
                                            </div>
                                        )}

                                        {item.selections.toolsUsed.length > 0 && (
                                            <div>
                                                <p className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                    <Wrench size={14} className="text-gray-500"/> Ferramentas
                                                </p>
                                                <ul className="list-disc list-inside text-gray-600 pl-2 space-y-1">
                                                    {item.selections.toolsUsed.map((i, idx) => <li key={idx}>{i}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    </div>

                    {/* Right Column: Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Finalizar Proposta</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-metarh-medium focus:border-transparent outline-none transition-all"
                                        placeholder="Ex: Empresa ABC Ltda"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                </div>
                                
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Serviços adicionados</span>
                                        <span className="font-bold text-metarh-dark text-lg">{cart.length}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg">
                                        <span className="block font-semibold mb-1">Responsável:</span>
                                        {user.name} <br/>
                                        {user.email}
                                    </div>
                                </div>

                                <button 
                                    onClick={generatePDF}
                                    disabled={isGenerating || !clientName.trim()}
                                    className={`w-full py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all
                                        ${!clientName.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-metarh-dark hover:bg-metarh-medium hover:-translate-y-1 shadow-purple-200'}
                                    `}
                                >
                                    {isGenerating ? (
                                        'Gerando...'
                                    ) : (
                                        <>
                                            <Download size={20} /> Baixar PDF
                                        </>
                                    )}
                                </button>
                                
                                {!clientName.trim() && (
                                    <p className="text-xs text-center text-red-400 mt-2">
                                        * Insira o nome do cliente para baixar
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </>
      )}
    </div>
  );
};