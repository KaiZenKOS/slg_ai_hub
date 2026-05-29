import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import Background3D from './components/Background3D';
import InfoPage from './components/InfoPage';
import { useChatStore } from './stores/chatStore';
import { useChat } from './hooks/useChat';
import { Menu, ShieldAlert, Cpu, BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    apiKey,
    createConversation,
    model
  } = useChatStore();

  const { sendMessage, stopGeneration, isLoading, isStreaming } = useChat();
  const [isInfoPageOpen, setIsInfoPageOpen] = useState(false);

  const handleSendPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="w-full h-full flex overflow-hidden relative font-sans text-slate-800 bg-[#ebf0f4]">

      {/* 3D WebGL Background Scene */}
      <Background3D />

      {/* Left Collapsible Sidebar */}
      <Sidebar />

      {/* Main Chat Area Panel */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">

        {/* Top Header Bar */}
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

            {/* Logo */}
            <span className="font-sans font-bold text-[9px] md:text-[11px] tracking-[0.25em] text-slate-800 uppercase">
              S L G &nbsp; A I &nbsp; H U B
            </span>
          </div>

          <div className="flex items-center gap-6 md:gap-8">

            {/* Guide & Intégrations button (remplace "Technologie") */}
            <button
              id="info-page-open-btn"
              onClick={() => setIsInfoPageOpen(true)}
              className="autono-nav-link text-[10px] uppercase tracking-widest cursor-pointer hover:opacity-80 flex items-center gap-1.5"
              title="Guide & Intégrations"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guide & Intégrations</span>
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

            {/* Nouveau Chat button */}
            <button
              onClick={() => createConversation()}
              className="py-1.5 px-4 md:px-5 rounded-full bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-slate-800 hover:scale-[1.03] active:scale-[0.97] transition-all duration-150 shadow-sm cursor-pointer"
            >
              Nouveau Chat
            </button>
          </div>
        </header>

        {/* Scrollable messages container */}
        <ChatArea onSendPrompt={handleSendPrompt} isStreaming={isStreaming} />

        {/* Bottom Input Area */}
        <div className="p-4 md:p-6 w-full flex-shrink-0 z-10 bg-gradient-to-t from-white/80 via-white/40 to-transparent">
          <ChatInput
            onSend={handleSendPrompt}
            onStop={stopGeneration}
            disabled={isLoading && !isStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </div>

      {/* Info Page Modal */}
      {isInfoPageOpen && (
        <InfoPage onClose={() => setIsInfoPageOpen(false)} />
      )}
    </div>
  );
};

export default App;
