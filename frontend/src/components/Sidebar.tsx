import React, { useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import type { Conversation } from '../stores/chatStore';
import { 
  Plus, 
  Trash2, 
  Settings, 
  X, 
  MessageSquare, 
  Database,
  KeyRound,
  Wrench
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    apiKey,
    apiUrl,
    model,
    setSidebarOpen,
    setApiKey,
    setApiUrl,
    setModel,
    setActiveConversationId,
    createConversation,
    deleteConversation,
    clearAllConversations,
  } = useChatStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Form states for settings
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [tempModel, setTempModel] = useState(model);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(tempApiKey);
    setApiUrl(tempApiUrl);
    setModel(tempModel);
    setIsSettingsOpen(false);
  };

  const handleOpenSettings = () => {
    setTempApiKey(apiKey);
    setTempApiUrl(apiUrl);
    setTempModel(model);
    setConfirmClear(false);
    setIsSettingsOpen(true);
  };

  const handleClearAll = () => {
    clearAllConversations();
    setConfirmClear(false);
    setIsSettingsOpen(false);
  };

  // Chronological grouping function
  const getGroupedConversations = () => {
    const groups: { [key: string]: Conversation[] } = {
      "Aujourd'hui": [],
      "Hier": [],
      "Cette semaine": [],
      "Plus tôt": [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    conversations.forEach((conv) => {
      const convDate = new Date(conv.createdAt);
      if (convDate >= today) {
        groups["Aujourd'hui"].push(conv);
      } else if (convDate >= yesterday) {
        groups["Hier"].push(conv);
      } else if (convDate >= sevenDaysAgo) {
        groups["Cette semaine"].push(conv);
      } else {
        groups["Plus tôt"].push(conv);
      }
    });

    // Remove empty groups
    return Object.keys(groups).reduce((acc, key) => {
      if (groups[key].length > 0) {
        acc[key] = groups[key];
      }
      return acc;
    }, {} as { [key: string]: Conversation[] });
  };

  const groupedConversations = getGroupedConversations();

  if (!sidebarOpen) {
    return null;
  }

  return (
    <>
      {/* Light glassmorphism sidebar container */}
      <div className="w-72 h-full bg-white/20 backdrop-blur-2xl flex flex-col border-r border-slate-300/40 z-20 flex-shrink-0 relative select-none">
        
        {/* Header / Brand */}
        <div className="p-4 flex items-center justify-between border-b border-slate-300/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
              S
            </div>
            <span className="font-sans font-bold text-slate-800 text-xs tracking-[0.2em] uppercase">
              SLG AI Hub
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => createConversation()}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-300 text-xs font-sans font-semibold text-slate-800 bg-white/40 hover:bg-white/70 hover:border-slate-400 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau chat
          </button>
        </div>

        {/* History Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-sans font-light">
              Aucun historique
            </div>
          ) : (
            Object.entries(groupedConversations).map(([groupTitle, list]) => (
              <div key={groupTitle} className="space-y-1">
                <h3 className="px-3 text-[9px] font-bold text-slate-500/80 uppercase tracking-widest font-sans">
                  {groupTitle}
                </h3>
                {list.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center justify-between rounded-lg transition-all duration-150 relative ${
                        isActive
                          ? 'bg-white/60 text-slate-950 font-medium border-l-2 border-slate-800 shadow-sm'
                          : 'text-slate-700 hover:bg-white/20 hover:text-slate-950'
                      }`}
                    >
                      <button
                        onClick={() => setActiveConversationId(conv.id)}
                        className="flex-1 flex items-center gap-2 py-2 px-3 text-left text-xs truncate font-sans cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                        <span className="truncate">{conv.title}</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 text-slate-400 hover:text-red-600 hover:bg-white/40 rounded-md cursor-pointer transition-all duration-150"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Bottom Options / Settings */}
        <div className="p-3 border-t border-slate-300/30 bg-white/10">
          <button
            onClick={handleOpenSettings}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-slate-700 hover:text-slate-950 hover:bg-white/30 text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Réglages API & Modèle</span>
            {apiKey === '' && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </div>

      {/* Settings Modal - Light theme matching Autono style */}
      {isSettingsOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-slate-800" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-sans">Réglages du Moteur</h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-900 p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              {/* API URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  URL de l'API locale (LiteLLM)
                </label>
                <input
                  type="text"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  placeholder="http://localhost:8000/v1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-mono focus:border-slate-400 focus:bg-white focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Clé API (SK_API_KEY)
                </label>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={apiKey ? "••••••••••••••••" : "Entrez votre clé API"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-mono focus:border-slate-400 focus:bg-white focus:outline-none transition-colors"
                />
                <p className="text-[10px] text-slate-400 font-sans">
                  La clé est stockée localement dans votre navigateur.
                </p>
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Nom du Modèle
                </label>
                <input
                  type="text"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  placeholder="qwen-3.6"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 font-mono focus:border-slate-400 focus:bg-white focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Actions & Danger Zone */}
              <div className="pt-4 border-t border-slate-100 mt-6 flex flex-col gap-4">
                
                {/* Clear conversations */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-red-500 font-sans">Zone de danger</h4>
                    <p className="text-[10px] text-slate-400 font-sans">Effacer l'historique local.</p>
                  </div>
                  {confirmClear ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold font-sans cursor-pointer transition-colors"
                      >
                        Confirmer
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClear(false)}
                        className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-sans cursor-pointer transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className="py-1 px-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded text-[10px] font-sans font-medium transition-all duration-150 cursor-pointer"
                    >
                      Tout supprimer
                    </button>
                  )}
                </div>

                {/* Save & Cancel */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-medium transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
