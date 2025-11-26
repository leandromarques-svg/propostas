
import React, { useState, useRef, useEffect } from 'react';
import { ProposalSection, VisualElement, VisualElementType } from '../types';
import { Save, MousePointer2, Type, Square, Circle, Image as ImageIcon, Trash2, Layout, Undo, GripHorizontal, Upload, X, Maximize2, Palette, ChevronRight, BoxSelect } from 'lucide-react';

// Default template pages
export const DEFAULT_LAYOUT: ProposalSection[] = [
  { id: 'cover', title: 'Capa', elements: [], background: '#ffffff' },
  { id: 'intro', title: 'Introdução', elements: [], background: '#ffffff' },
  { id: 'solutions', title: 'Nossas Soluções', elements: [], background: '#ffffff' },
  { id: 'pricing', title: 'Investimento', elements: [], background: '#ffffff' },
  { id: 'final', title: 'Encerramento', elements: [], background: '#ffffff' }
];

interface ProposalLayoutEditorProps {
  initialLayout: ProposalSection[];
  onSave: (newLayout: ProposalSection[]) => void;
  onCancel: () => void;
}

// MIV Color Palette
const MIV_COLORS = [
  { name: 'Dark', value: '#470082' },
  { name: 'Medium', value: '#aa3ffe' },
  { name: 'Pink', value: '#ff27f9' },
  { name: 'Lime', value: '#c9f545' },
  { name: 'Yellow', value: '#fff24d' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#f3f4f6' },
  { name: 'Transparent', value: 'transparent' },
];

// METARH LOGOS & ICONS (Base64 or Paths would be ideal, using placeholders/urls for now)
const SVG_LIBRARY = [
    { name: 'Logo Horizontal', type: 'image', src: 'https://metarh.com.br/wp-content/uploads/2025/11/logo-metarh-azul.png' },
    { name: 'Logo Bola', type: 'image', src: 'https://metarh.com.br/wp-content/uploads/2025/11/logo_METARH.png' },
    { name: 'Grafismo Executivos', type: 'image', src: 'https://metarh.com.br/wp-content/uploads/2025/11/Executivos-grafismo.png' }
];

export const ProposalLayoutEditor: React.FC<ProposalLayoutEditorProps> = ({ initialLayout, onSave, onCancel }) => {
  const [activeView, setActiveView] = useState<'selection' | 'editor'>('selection');
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  
  // Editor State
  const [elements, setElements] = useState<VisualElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startDim, setStartDim] = useState({ w: 0, h: 0, x: 0, y: 0, mx: 0, my: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- SELECTION VIEW ---
  const handleSelectSection = (sectionId: string) => {
      setCurrentSectionId(sectionId);
      // Load existing elements for this section (mock for now, would load from layout prop)
      // In a real app, you'd find the section in initialLayout and setElements(section.elements)
      setElements([]); 
      setActiveView('editor');
  };

  // --- EDITOR VIEW LOGIC ---

  const addElement = (type: VisualElementType, content?: string) => {
    const newElement: VisualElement = {
      id: `el-${Date.now()}`,
      type,
      x: 960 - 100, // Center
      y: 540 - 50,
      width: type === 'text' ? 400 : 200,
      height: type === 'text' ? 100 : 200,
      color: type === 'text' ? '#000000' : '#aa3ffe',
      strokeColor: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
      content: content || (type === 'text' ? 'Novo Texto' : ''),
      fontSize: 48,
      zIndex: elements.length + 1,
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            addElement('image', event.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const addLibraryAsset = (src: string) => {
      addElement('image', src);
  };

  // --- MOUSE HANDLERS ---

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    if (isResizing) return; // Don't drag if resizing
    
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    
    const el = elements.find(el => el.id === id);
    if (el && canvasRef.current) {
        // Adjust for scaling if needed, but assuming simple offset for now
        // Note: e.nativeEvent.offsetX might be better in some cases, but clientX with rect calc is safer
        const rect = canvasRef.current.getBoundingClientRect();
        // We need to account for the CSS scale transform (e.g. 0.5 or similar if scaled down)
        const scaleX = 1920 / rect.width;
        const scaleY = 1080 / rect.height;

        setDragOffset({
            x: (e.clientX - rect.left) * scaleX - el.x,
            y: (e.clientY - rect.top) * scaleY - el.y
        });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string, id: string) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeHandle(handle);
      const el = elements.find(el => el.id === id);
      if (el) {
          setStartDim({
              w: el.width,
              h: el.height,
              x: el.x,
              y: el.y,
              mx: e.clientX,
              my: e.clientY
          });
      }
  };

  const handleGlobalMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 1920 / rect.width;
    const scaleY = 1080 / rect.height;

    if (isDragging && selectedId) {
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        setElements(prev => prev.map(el => {
            if (el.id === selectedId) {
                return {
                    ...el,
                    x: mouseX - dragOffset.x,
                    y: mouseY - dragOffset.y
                };
            }
            return el;
        }));
    }

    if (isResizing && selectedId && resizeHandle) {
        const deltaX = (e.clientX - startDim.mx) * scaleX;
        const deltaY = (e.clientY - startDim.my) * scaleY;

        setElements(prev => prev.map(el => {
            if (el.id !== selectedId) return el;

            let newW = startDim.w;
            let newH = startDim.h;
            let newX = startDim.x;
            let newY = startDim.y;

            if (resizeHandle.includes('e')) newW = startDim.w + deltaX;
            if (resizeHandle.includes('s')) newH = startDim.h + deltaY;
            if (resizeHandle.includes('w')) {
                newW = startDim.w - deltaX;
                newX = startDim.x + deltaX;
            }
            if (resizeHandle.includes('n')) {
                newH = startDim.h - deltaY;
                newY = startDim.y + deltaY;
            }

            return {
                ...el,
                width: Math.max(20, newW),
                height: Math.max(20, newH),
                x: newX,
                y: newY
            };
        }));
    }
  };

  const handleGlobalUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const updateProperty = (key: keyof VisualElement, value: any) => {
    if (!selectedId) return;
    setElements(prev => prev.map(el => el.id === selectedId ? { ...el, [key]: value } : el));
  };

  const deleteElement = () => {
    if (!selectedId) return;
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  // --- RENDER ---

  if (activeView === 'selection') {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 animate-fade-in">
              <div className="max-w-4xl w-full">
                  <div className="flex justify-between items-center mb-8">
                      <h1 className="text-3xl font-bold text-metarh-dark">Selecione o Slide para Editar</h1>
                      <button onClick={onCancel} className="px-6 py-2 border rounded-full text-gray-600 hover:bg-gray-100">Voltar</button>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                      {initialLayout.map(section => (
                          <div 
                            key={section.id}
                            onClick={() => handleSelectSection(section.id)}
                            className="bg-white aspect-video rounded-2xl shadow-md border-2 border-transparent hover:border-metarh-medium hover:shadow-xl cursor-pointer transition-all group flex flex-col items-center justify-center relative overflow-hidden"
                          >
                              <div className="absolute inset-0 bg-gray-100 group-hover:scale-105 transition-transform duration-500">
                                  {/* Preview mock */}
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <Layout size={48} />
                                  </div>
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <button className="opacity-0 group-hover:opacity-100 bg-metarh-medium text-white px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all">
                                      Editar
                                  </button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100">
                                  <h3 className="font-bold text-gray-800">{section.title}</h3>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col animate-fade-in h-screen overflow-hidden">
      
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-20 shrink-0 h-16">
        <div className="flex items-center gap-3">
            <button onClick={() => setActiveView('selection')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <Undo size={20} />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <h1 className="text-lg font-bold text-metarh-dark flex items-center gap-2">
                Editando: <span className="text-metarh-medium">{initialLayout.find(s => s.id === currentSectionId)?.title}</span>
            </h1>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => alert("Salvo temporariamente!")}
                className="px-6 py-2 rounded-full bg-metarh-medium text-white font-bold shadow-lg hover:bg-metarh-dark transition-colors flex items-center gap-2 text-sm"
            >
                <Save size={18} /> Salvar Alterações
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Toolbar */}
        <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4 z-10 shadow-lg overflow-y-auto hide-scrollbar shrink-0">
            <ToolButton icon={<MousePointer2 />} label="Mover" active onClick={() => setSelectedId(null)} />
            <div className="w-10 h-px bg-gray-100 my-1"></div>
            <ToolButton icon={<Type />} label="Texto" onClick={() => addElement('text')} />
            <ToolButton icon={<Square />} label="Retângulo" onClick={() => addElement('rectangle')} />
            <ToolButton icon={<Circle />} label="Círculo" onClick={() => addElement('circle')} />
            
            <div className="w-10 h-px bg-gray-100 my-1"></div>
            
            <div className="relative group w-full flex justify-center">
                <input 
                    type="file" 
                    id="svg-upload" 
                    className="hidden" 
                    accept=".svg,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                />
                <label htmlFor="svg-upload" className="cursor-pointer w-16 flex flex-col items-center gap-1 p-2 hover:bg-purple-50 rounded-xl text-gray-500 hover:text-metarh-medium transition-colors">
                    <Upload size={20} />
                    <span className="text-[9px] font-bold">Upload</span>
                </label>
            </div>

            <div className="w-full px-2 mt-4">
                <p className="text-[9px] font-bold text-gray-400 text-center mb-2 uppercase tracking-wider">Biblioteca</p>
                <div className="flex flex-col gap-2">
                    {SVG_LIBRARY.map((asset, idx) => (
                        <button 
                            key={idx}
                            onClick={() => addLibraryAsset(asset.src)}
                            className="w-full aspect-square bg-gray-50 border border-gray-200 rounded-lg p-2 hover:border-metarh-medium transition-colors flex items-center justify-center"
                            title={asset.name}
                        >
                            <img src={asset.src} alt={asset.name} className="w-full h-full object-contain" />
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Canvas Area */}
        <div 
            className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-12 relative" 
            onMouseUp={handleGlobalUp} 
            onMouseMove={handleGlobalMove}
        >
            
            {/* 1920x1080 Canvas Container - Scaled via CSS to fit viewport */}
            <div 
                ref={canvasRef}
                className="bg-white shadow-2xl relative overflow-hidden shrink-0"
                style={{ 
                    width: '1920px', 
                    height: '1080px', 
                    transform: 'scale(0.65)', // Fixed scale for MVP visibility
                    transformOrigin: 'center center',
                }}
                onClick={() => setSelectedId(null)} 
            >
                {/* Grid Background */}
                <div className="absolute inset-0 pointer-events-none opacity-5" 
                     style={{ backgroundImage: 'linear-gradient(#470082 1px, transparent 1px), linear-gradient(90deg, #470082 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {elements.map(el => (
                    <div
                        key={el.id}
                        onMouseDown={(e) => handleMouseDown(e, el.id)}
                        className={`absolute group ${selectedId === el.id ? 'z-50' : ''}`}
                        style={{
                            left: el.x,
                            top: el.y,
                            width: el.type === 'text' ? 'auto' : el.width,
                            height: el.type === 'text' ? 'auto' : el.height,
                            zIndex: el.zIndex,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                    >
                        {/* Render Content */}
                        {el.type === 'text' && (
                            <div 
                                className="whitespace-nowrap select-none px-2"
                                style={{ 
                                    color: el.color, 
                                    fontSize: `${el.fontSize}px`, 
                                    fontFamily: 'Barlow, sans-serif', 
                                    fontWeight: 'bold',
                                    border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.strokeColor}` : 'none',
                                    borderRadius: `${el.borderRadius}px`
                                }}
                            >
                                {el.content}
                            </div>
                        )}
                        
                        {el.type === 'rectangle' && (
                            <div 
                                className="w-full h-full"
                                style={{ 
                                    backgroundColor: el.color,
                                    border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.strokeColor}` : 'none',
                                    borderRadius: `${el.borderRadius}px`
                                }}
                            />
                        )}

                        {el.type === 'circle' && (
                            <div 
                                className="w-full h-full rounded-full"
                                style={{ 
                                    backgroundColor: el.color,
                                    border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.strokeColor}` : 'none',
                                }}
                            />
                        )}

                        {el.type === 'image' && (
                            <img 
                                src={el.content} 
                                alt="Elemento" 
                                className="w-full h-full object-contain pointer-events-none"
                                style={{
                                    border: el.strokeWidth ? `${el.strokeWidth}px solid ${el.strokeColor}` : 'none',
                                    borderRadius: `${el.borderRadius}px`
                                }}
                            />
                        )}

                        {/* Selection Frame & Handles */}
                        {selectedId === el.id && (
                            <>
                                <div className="absolute inset-0 border-2 border-metarh-pink pointer-events-none"></div>
                                {el.type !== 'text' && (
                                    <>
                                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-white border-2 border-metarh-pink cursor-nw-resize" onMouseDown={(e) => handleResizeStart(e, 'nw', el.id)} />
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white border-2 border-metarh-pink cursor-ne-resize" onMouseDown={(e) => handleResizeStart(e, 'ne', el.id)} />
                                        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white border-2 border-metarh-pink cursor-sw-resize" onMouseDown={(e) => handleResizeStart(e, 'sw', el.id)} />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-metarh-pink cursor-se-resize" onMouseDown={(e) => handleResizeStart(e, 'se', el.id)} />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Right Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-lg shrink-0 h-full overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <BoxSelect size={16} /> Propriedades
                </h2>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
                {selectedElement ? (
                    <>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-gray-400 uppercase">Tipo</label>
                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 capitalize">{selectedElement.type}</span>
                            </div>
                            
                            {selectedElement.type === 'text' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700">Conteúdo</label>
                                    <input 
                                        type="text" 
                                        value={selectedElement.content} 
                                        onChange={(e) => updateProperty('content', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-metarh-medium outline-none"
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <label className="text-xs font-bold text-gray-700 w-20">Tamanho</label>
                                        <input 
                                            type="number" 
                                            value={selectedElement.fontSize} 
                                            onChange={(e) => updateProperty('fontSize', Number(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {(selectedElement.type === 'rectangle' || selectedElement.type === 'image') && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700">Raio da Borda (Radius)</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            value={selectedElement.borderRadius || 0} 
                                            onChange={(e) => updateProperty('borderRadius', Number(e.target.value))}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-metarh-medium"
                                        />
                                        <span className="text-xs font-mono w-8 text-right">{selectedElement.borderRadius || 0}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><Palette size={12}/> Estilo</label>
                            
                            {selectedElement.type !== 'image' && (
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-2 block">Preenchimento</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {MIV_COLORS.map((c) => (
                                            <button
                                                key={c.value}
                                                onClick={() => updateProperty('color', c.value)}
                                                className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110
                                                    ${selectedElement.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'border-gray-200'}
                                                    ${c.value === 'transparent' ? 'bg-checkered' : ''}
                                                `}
                                                style={{ backgroundColor: c.value }}
                                                title={c.name}
                                            >
                                                {c.value === 'transparent' && <X size={14} className="text-red-400 mx-auto"/>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-2 block">Cor do Contorno</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {MIV_COLORS.map((c) => (
                                        <button
                                            key={c.value}
                                            onClick={() => updateProperty('strokeColor', c.value)}
                                            className={`w-8 h-8 rounded-full border shadow-sm transition-transform hover:scale-110
                                                ${selectedElement.strokeColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'border-gray-200'}
                                            `}
                                            style={{ backgroundColor: c.value }}
                                            title={c.name}
                                        >
                                             {c.value === 'transparent' && <X size={14} className="text-red-400 mx-auto"/>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-700 mb-2 block">Espessura do Contorno</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="20" 
                                        value={selectedElement.strokeWidth || 0} 
                                        onChange={(e) => updateProperty('strokeWidth', Number(e.target.value))}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-metarh-medium"
                                    />
                                    <span className="text-xs font-mono w-8 text-right">{selectedElement.strokeWidth || 0}px</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 mt-auto">
                            <button 
                                onClick={deleteElement}
                                className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Excluir Elemento
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                            <MousePointer2 size={32} className="opacity-30" />
                        </div>
                        <p className="text-sm font-medium px-8">Selecione um elemento no canvas para editar suas propriedades.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

const ToolButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }> = ({ icon, label, onClick, active }) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 w-16
            ${active ? 'bg-purple-50 text-metarh-medium shadow-inner' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}
        `}
    >
        <div className="text-2xl">{icon}</div>
        <span className="text-[10px] font-bold">{label}</span>
    </button>
);
