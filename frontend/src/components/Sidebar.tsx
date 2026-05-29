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
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Loader2,
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

  // Form states
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);
  const [tempModel, setTempModel] = useState(model);

  // API Key validation states
  const [apiKeyValidating, setApiKeyValidating] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState(false);

  const handleOpenSettings = () => {
    setTempApiKey(apiKey);
    setTempApiUrl(apiUrl);
    setTempModel(model);
    setConfirmClear(false);
    setApiKeyError(null);
    setApiKeyValid(false);
    setIsSettingsOpen(true);
  };

  /**
   * Valide la clé API via un appel GET /models avant de sauvegarder.
   * Si la clé est vide, on skip la validation (backend sans auth).
   */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiKeyError(null);
    setApiKeyValid(false);

    // Si la clé est vide, pas de validation nécessaire
    if (!tempApiKey.trim()) {
      setApiKey('');
      setApiUrl(tempApiUrl);
      setModel(tempModel);
      setIsSettingsOpen(false);
      return;
    }

    // Appel test sur GET /v1/models pour valider la clé
    setApiKeyValidating(true);
    const baseUrl = tempApiUrl.endsWith('/') ? tempApiUrl.slice(0, -1) : tempApiUrl;
    try {
      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tempApiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        // ✅ Clé valide → sauvegarder et fermer
        setApiKeyValid(true);
        setApiKey(tempApiKey);
        setApiUrl(tempApiUrl);
        setModel(tempModel);
        setTimeout(() => setIsSettingsOpen(false), 800);
      } else {
        const status = response.status;
        if (status === 401 || status === 403) {
          setApiKeyError(`Clé API refusée par le serveur (HTTP ${status}). Vérifiez la clé saisie.`);
        } else if (status === 404) {
          setApiKeyError(`Route /models introuvable (HTTP 404). Vérifiez que l'URL se termine bien par /v1 (ex: http://192.168.10.90/v1).`);
        } else {
          setApiKeyError(`Erreur serveur inattendue (HTTP ${status}). Consultez les logs LiteLLM.`);
        }
      }
    } catch (err: any) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        setApiKeyError(`Timeout : le serveur ${baseUrl} ne répond pas après 8s. Vérifiez qu'il est bien démarré.`);
      } else if (err instanceof TypeError) {
        // TypeError = erreur réseau (CORS, DNS, connexion refusée)
        // Le navigateur bloque les détails pour des raisons de sécurité
        setApiKeyError(
          `Erreur réseau vers ${baseUrl}. Causes possibles : ` +
          `(1) mauvaise URL — vérifiez qu'elle pointe bien sur le bon serveur et non "localhost", ` +
          `(2) CORS non activé sur LiteLLM — ajoutez allow_origins=["*"] dans la config, ` +
          `(3) serveur éteint. Appuyez sur F12 → Console pour voir l'erreur exacte.`
        );
      } else {
        setApiKeyError(`Erreur inattendue : ${err.message || 'inconnue'}. Appuyez sur F12 → Console pour le détail.`);
      }
    } finally {
      setApiKeyValidating(false);
    }
  };

  const handleClearAll = () => {
    clearAllConversations();
    setConfirmClear(false);
    setIsSettingsOpen(false);
  };

  // Chronological grouping
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
      {/* Light glassmorphism sidebar */}
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

        {/* Bottom Settings Button */}
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

      {/* Settings Modal */}
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

            {/* Form */}
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

              {/* API Key avec validation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Clé API (SK_API_KEY)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => {
                      setTempApiKey(e.target.value);
                      setApiKeyError(null);
                      setApiKeyValid(false);
                    }}
                    placeholder={apiKey ? "••••••••••••••••" : "Entrez votre clé API"}
                    className={`w-full bg-slate-50 border rounded-lg py-2 px-3 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none transition-colors pr-8 ${
                      apiKeyError
                        ? 'border-red-300 focus:border-red-400 bg-red-50'
                        : apiKeyValid
                        ? 'border-emerald-300 focus:border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 focus:border-slate-400'
                    }`}
                  />
                  {/* Icône de statut */}
                  {apiKeyValid && (
                    <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                  {apiKeyError && (
                    <AlertTriangle className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>

                {/* Message d'erreur validation */}
                {apiKeyError && (
                  <p className="text-[10px] text-red-600 font-sans flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {apiKeyError}
                  </p>
                )}
                {apiKeyValid && (
                  <p className="text-[10px] text-emerald-600 font-sans flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    Clé API validée avec succès !
                  </p>
                )}
                {!apiKeyError && !apiKeyValid && (
                  <p className="text-[10px] text-slate-400 font-sans">
                    La clé sera testée via <code className="font-mono text-slate-500">GET /models</code> avant d'être sauvegardée.
                  </p>
                )}
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

              {/* Danger Zone + Actions */}
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
                    disabled={apiKeyValidating}
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-sans font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={apiKeyValidating}
                    className="py-1.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm disabled:opacity-60 disabled:pointer-events-none flex items-center gap-2"
                  >
                    {apiKeyValidating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      'Enregistrer'
                    )}
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
