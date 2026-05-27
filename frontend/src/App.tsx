import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import Background3D from './components/Background3D';
import { useChatStore } from './stores/chatStore';
import { useChat } from './hooks/useChat';
import { Menu, ShieldAlert, Cpu, X, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    apiKey,
    createConversation,
    model
  } = useChatStore();
  
  const { sendMessage, isLoading } = useChat();
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);

  const handleSendPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="w-full h-full flex overflow-hidden relative font-sans text-slate-800 bg-[#ebf0f4]">
      
      {/* 3D WebGL Background Scene (Light theme) */}
      <Background3D />

      {/* Left Collapsible Sidebar */}
      <Sidebar />

      {/* Main Chat Area Panel */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        {/* Top Header Bar mimicking Autono navbar */}
        <header className="h-16 w-full flex items-center justify-between px-6 md:px-12 bg-transparent z-10 flex-shrink-0 select-none border-b border-slate-300/10">
          <div className="flex items-center gap-4">
            {/* Toggle Sidebar Button when closed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 cursor-pointer transition-colors"
                title="Ouvrir le menu latéral"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo spaced out */}
            <span className="font-sans font-bold text-[9px] md:text-[11px] tracking-[0.25em] text-slate-800 uppercase">
              S L G &nbsp; A I &nbsp; H U B
            </span>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            {/* Tech stack description link */}
            <button
              onClick={() => setIsTechModalOpen(true)}
              className="autono-nav-link text-[10px] uppercase tracking-widest cursor-pointer hover:opacity-80"
            >
              Technologie
            </button>

            {/* Warning if API Key is not set */}
            {apiKey === '' && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-light font-sans">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clé API absente</span>
              </div>
            )}

            {/* Model Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 text-[10px] font-bold text-slate-600 tracking-wider">
              <Cpu className="w-3 h-3 text-slg-cyan" />
              <span className="font-mono">{model.toUpperCase()}</span>
            </div>

            {/* Black Pill Button mimicking "S'abonner" */}
            <button
              onClick={() => createConversation()}
              className="py-1.5 px-4 md:px-5 rounded-full bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-slate-800 hover:scale-[1.03] active:scale-[0.97] transition-all duration-150 shadow-sm cursor-pointer"
            >
              Nouveau Chat
            </button>
          </div>
        </header>

        {/* Scrollable messages container */}
        <ChatArea onSendPrompt={handleSendPrompt} />

        {/* Bottom Input Area */}
        <div className="p-4 md:p-6 w-full flex-shrink-0 z-10 bg-gradient-to-t from-white/80 via-white/40 to-transparent">
          <ChatInput onSend={handleSendPrompt} disabled={isLoading} />
        </div>
      </div>

      {/* Technology Stack Info Modal */}
      {isTechModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-sans flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Spécifications Techniques
              </h2>
              <button
                onClick={() => setIsTechModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-700 font-sans">
              <p className="font-light leading-relaxed">
                Le portail **SLG AI Hub** repose sur une architecture moderne conçue pour la rapidité, la sécurité et l'ergonomie.
              </p>
              
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Frontend</span>
                <span className="col-span-2 font-mono">React 18 / TypeScript / Vite</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Moteur 3D</span>
                <span className="col-span-2 font-mono">React Three Fiber (WebGL)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Styles CSS</span>
                <span className="col-span-2 font-mono">Tailwind CSS v4 (Glassmorphic)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Service IA</span>
                <span className="col-span-2 font-mono">Proxy LiteLLM & Qwen</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-2">
                <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Streaming</span>
                <span className="col-span-2 font-mono">Server-Sent Events (SSE)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
              <button
                onClick={() => setIsTechModalOpen(false)}
                className="py-1.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-semibold cursor-pointer shadow-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
