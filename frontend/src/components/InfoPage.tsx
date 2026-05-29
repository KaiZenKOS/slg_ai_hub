import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Terminal, Code2, MessageCircle, ChevronRight, Copy, Check, Sparkles, Keyboard, Zap } from 'lucide-react';

interface InfoPageProps {
  onClose: () => void;
}

// Petit composant de bloc de code copiable
const CopyBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang = 'json' }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200/60 shadow-sm my-3">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0f172a]/90 text-[10px] text-slate-400 font-mono">
        <span className="font-bold tracking-wider uppercase">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 py-0.5 px-2 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copié !</span></> : <><Copy className="w-3 h-3" /><span>Copier</span></>}
        </button>
      </div>
      <pre className="bg-[#1e293b] text-slate-300 text-[11px] font-mono p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">{code}</pre>
    </div>
  );
};

// Badge pill
const Pill: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'slate' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
    color === 'cyan' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
    color === 'green' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    color === 'orange' ? 'bg-orange-50 text-orange-700 border-orange-200' :
    'bg-slate-100 text-slate-600 border-slate-200'
  }`}>{children}</span>
);

const SECTIONS = [
  { id: 'usage', label: 'Utilisation', icon: MessageCircle },
  { id: 'continue', label: 'Continue.dev', icon: Code2 },
  { id: 'aider', label: 'Aider', icon: Terminal },
  { id: 'tech', label: 'Architecture', icon: BookOpen },
];

export const InfoPage: React.FC<InfoPageProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('usage');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-sans">Guide & Intégrations</h2>
                <p className="text-[10px] text-slate-400 font-sans font-light mt-0.5">SLG AI Hub — Documentation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="info-page-close-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Nav */}
            <nav className="w-52 flex-shrink-0 border-r border-slate-100 py-4 px-3 space-y-1 bg-slate-50/50">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all duration-150 cursor-pointer text-left ${
                    activeSection === id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                  {activeSection === id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

              {/* ─────────────────────── USAGE ─────────────────────── */}
              {activeSection === 'usage' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 font-sans">Comment utiliser SLG AI Hub</h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      SLG AI Hub est une interface de chat connectée à votre backend LiteLLM privé. Voici tout ce que vous devez savoir pour en tirer le meilleur parti.
                    </p>
                  </div>

                  {/* Quick start */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Démarrage rapide</span>
                    </div>
                    <ol className="space-y-2 text-sm">
                      {[
                        'Ouvrez les Réglages (icône ⚙️ en bas à gauche)',
                        'Entrez l\'URL de votre backend LiteLLM (ex: http://localhost:8000/v1)',
                        'Entrez votre Clé API — elle sera validée automatiquement',
                        'Choisissez le nom du modèle (ex: qwen-3.6, gpt-4o, claude-3-5-sonnet)',
                        'Cliquez "Enregistrer" et commencez à discuter !',
                      ].map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/70 mt-0.5">{i + 1}</span>
                          <span className="text-white/85 font-light text-xs">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Keyboard shortcuts */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Keyboard className="w-4 h-4 text-slate-500" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans">Raccourcis clavier</h4>
                    </div>
                    <div className="space-y-2">
                      {[
                        { key: 'Entrée', action: 'Envoyer le message' },
                        { key: 'Shift + Entrée', action: 'Retour à la ligne dans le message' },
                        { key: 'Clic sur ⬛', action: 'Interrompre la génération en cours' },
                      ].map(({ key, action }) => (
                        <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-xs text-slate-600 font-light">{action}</span>
                          <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">{key}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">Fonctionnalités clés</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: '⚡', title: 'Streaming temps réel', desc: 'Les réponses s\'affichent mot par mot via SSE' },
                        { icon: '💾', title: 'Persistance locale', desc: 'Historique sauvegardé dans le navigateur (localStorage)' },
                        { icon: '📋', title: 'Rendu Markdown', desc: 'Tableaux, listes, blocs de code avec coloration syntaxique' },
                        { icon: '🛑', title: 'Bouton Stop', desc: 'Interrompez n\'importe quelle génération en un clic' },
                        { icon: '💬', title: 'Multi-conversations', desc: 'Gérez plusieurs fils de discussion en parallèle' },
                        { icon: '🔑', title: 'Validation clé API', desc: 'Test automatique de la clé avant enregistrement' },
                      ].map(({ icon, title, desc }) => (
                        <div key={title} className="p-3 rounded-xl border border-slate-100 bg-white/60 hover:bg-white/90 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{icon}</span>
                            <span className="text-[11px] font-bold text-slate-800">{title}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-light leading-relaxed">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prompts exemples */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">Exemples de prompts efficaces</h4>
                    <div className="space-y-2">
                      {[
                        { cat: 'Comptabilité', prompt: 'Explique-moi les différences entre le PCG et les IFRS sur la comptabilisation des actifs incorporels.' },
                        { cat: 'Code / SQL', prompt: 'Écris une procédure stockée SQL Server qui calcule le ratio de liquidité générale à partir du bilan.' },
                        { cat: 'Rédaction', prompt: 'Rédige un rapport de gestion de 2 pages sur l\'exercice 2024, en soulignant les risques opérationnels.' },
                        { cat: 'Analyse', prompt: 'Analyse les 5 indicateurs financiers clés suivants et dis-moi si l\'entreprise est saine : [liste]' },
                      ].map(({ cat, prompt }) => (
                        <div key={cat} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Pill color="cyan">{cat}</Pill>
                          </div>
                          <p className="text-[11px] text-slate-700 font-light italic">"{prompt}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────── CONTINUE.DEV ─────────────────────── */}
              {activeSection === 'continue' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900 font-sans">Intégration Continue.dev</h3>
                      <Pill color="green">VS Code / JetBrains</Pill>
                    </div>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      <a href="https://continue.dev" target="_blank" rel="noopener noreferrer" className="text-slg-cyan underline font-medium">Continue.dev</a> est une extension d'IDE open-source qui permet d'utiliser votre LLM privé directement dans VS Code ou JetBrains. Votre backend LiteLLM étant compatible avec l'API OpenAI, la configuration est simple.
                    </p>
                  </div>

                  {/* Installation */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">1. Installation de l'extension</h4>
                    <div className="space-y-2 text-xs text-slate-600 font-sans">
                      <p className="font-light">Dans VS Code, ouvrez le panneau Extensions (<kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Ctrl+Shift+X</kbd>) et cherchez :</p>
                      <CopyBlock lang="bash" code="Continue — Code assistant powered by AI" />
                      <p className="font-light">Ou installez via le terminal :</p>
                      <CopyBlock lang="bash" code="code --install-extension Continue.continue" />
                    </div>
                  </div>

                  {/* Config */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-2">2. Configuration (~/.continue/config.json)</h4>
                    <p className="text-xs text-slate-500 font-light mb-2">
                      Ouvrez la palette de commandes (<kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Ctrl+Shift+P</kbd>), tapez <code className="font-mono text-slate-600">Continue: Open config.json</code> et collez la configuration suivante :
                    </p>
                    <CopyBlock lang="json" code={`{
  "models": [
    {
      "title": "SLG AI Hub — Qwen",
      "provider": "openai",
      "model": "qwen-3.6",
      "apiBase": "http://localhost:8000/v1",
      "apiKey": "VOTRE_CLE_API_ICI",
      "contextLength": 32768,
      "completionOptions": {
        "temperature": 0.3,
        "maxTokens": 4096
      }
    }
  ],
  "tabAutocompleteModel": {
    "title": "SLG Autocomplete",
    "provider": "openai",
    "model": "qwen-3.6",
    "apiBase": "http://localhost:8000/v1",
    "apiKey": "VOTRE_CLE_API_ICI"
  },
  "allowAnonymousTelemetry": false
}`} />
                  </div>

                  {/* Usage */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">3. Utilisation dans l'IDE</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'Ctrl + L', action: 'Ouvrir le chat Continue dans le panneau latéral' },
                        { key: 'Ctrl + Shift + L', action: 'Ajouter le code sélectionné au contexte du chat' },
                        { key: 'Ctrl + I', action: 'Édition en ligne du code (inline edit)' },
                        { key: 'Tab', action: 'Accepter l\'autocomplétion suggérée' },
                      ].map(({ key, action }) => (
                        <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-xs text-slate-600 font-light">{action}</span>
                          <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-700 shadow-sm">{key}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4">
                    <h4 className="text-[10px] font-bold text-cyan-700 uppercase tracking-widest font-sans mb-2">💡 Conseils</h4>
                    <ul className="space-y-1.5 text-xs text-cyan-800 font-light">
                      <li>• Ajoutez <code className="font-mono text-[10px] bg-cyan-100 px-1 rounded">"completionOptions": {"{"} "stream": true {"}"}</code> pour activer le streaming dans l'IDE</li>
                      <li>• Si votre backend utilise HTTPS, remplacez <code className="font-mono text-[10px] bg-cyan-100 px-1 rounded">http://</code> par <code className="font-mono text-[10px] bg-cyan-100 px-1 rounded">https://</code></li>
                      <li>• Vous pouvez définir plusieurs modèles et basculer entre eux depuis l'interface Continue</li>
                      <li>• Utilisez <code className="font-mono text-[10px] bg-cyan-100 px-1 rounded">@codebase</code> dans le chat pour inclure l'ensemble du projet dans le contexte</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ─────────────────────── AIDER ─────────────────────── */}
              {activeSection === 'aider' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900 font-sans">Intégration Aider</h3>
                      <Pill color="orange">CLI / Terminal</Pill>
                    </div>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      <a href="https://aider.chat" target="_blank" rel="noopener noreferrer" className="text-slg-cyan underline font-medium">Aider</a> est un assistant de programmation en ligne de commande qui permet de modifier votre code source directement depuis le terminal en langage naturel. Il supporte nativement les endpoints compatibles OpenAI.
                    </p>
                  </div>

                  {/* Installation */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">1. Installation</h4>
                    <p className="text-[10px] text-slate-500 font-sans mb-2">Prérequis : Python 3.10+ et pip</p>
                    <CopyBlock lang="bash" code="pip install aider-chat" />
                    <p className="text-[10px] text-slate-500 font-sans mt-2">Ou via pipx (recommandé) :</p>
                    <CopyBlock lang="bash" code="pipx install aider-chat" />
                  </div>

                  {/* Usage basique */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-2">2. Lancement avec votre backend LiteLLM</h4>
                    <p className="text-xs text-slate-500 font-light mb-2">
                      Aider utilise les variables d'environnement ou les arguments CLI pour se connecter à votre backend :
                    </p>
                    <CopyBlock lang="bash" code={`# Méthode 1 : Variables d'environnement
export OPENAI_API_KEY="VOTRE_CLE_API"
export OPENAI_API_BASE="http://localhost:8000/v1"
aider --model openai/qwen-3.6

# Méthode 2 : Arguments directs (plus simple)
aider \\
  --model openai/qwen-3.6 \\
  --openai-api-key VOTRE_CLE_API \\
  --openai-api-base http://localhost:8000/v1

# Méthode 3 : Avec fichiers spécifiques
aider src/App.tsx src/components/ChatInput.tsx \\
  --model openai/qwen-3.6 \\
  --openai-api-key VOTRE_CLE_API \\
  --openai-api-base http://localhost:8000/v1`} />
                  </div>

                  {/* Config fichier */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-2">3. Fichier de configuration (.aider.conf.yml)</h4>
                    <p className="text-xs text-slate-500 font-light mb-2">
                      Placez ce fichier à la racine de votre projet pour éviter de répéter les arguments :
                    </p>
                    <CopyBlock lang="yaml" code={`# .aider.conf.yml (à la racine du projet)
model: openai/qwen-3.6
openai-api-key: VOTRE_CLE_API
openai-api-base: http://localhost:8000/v1

# Options recommandées
auto-commits: true          # Commit automatique des modifications
dirty-commits: true         # Permet de committer même si le repo est modifié
stream: true                # Streaming des réponses
no-show-model-warnings: true`} />
                  </div>

                  {/* Commandes utiles */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">4. Commandes utiles dans Aider</h4>
                    <div className="space-y-2">
                      {[
                        { cmd: '/add src/components/ChatInput.tsx', desc: 'Ajouter un fichier au contexte de la session' },
                        { cmd: '/drop App.tsx', desc: 'Retirer un fichier du contexte' },
                        { cmd: '/diff', desc: 'Afficher les modifications apportées par Aider' },
                        { cmd: '/undo', desc: 'Annuler le dernier commit d\'Aider' },
                        { cmd: '/run npm test', desc: 'Exécuter une commande shell et partager la sortie' },
                        { cmd: '/ask Explique ce code', desc: 'Poser une question sans modifier le code' },
                      ].map(({ cmd, desc }) => (
                        <div key={cmd} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                          <code className="text-[11px] font-mono text-slate-800 font-bold">{cmd}</code>
                          <p className="text-[10px] text-slate-500 font-light mt-0.5">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <h4 className="text-[10px] font-bold text-orange-700 uppercase tracking-widest font-sans mb-2">💡 Conseils Aider</h4>
                    <ul className="space-y-1.5 text-xs text-orange-800 font-light">
                      <li>• Aider fonctionne mieux avec des modèles ayant une grande fenêtre de contexte (≥ 16k tokens)</li>
                      <li>• Utilisez le mode <code className="font-mono text-[10px] bg-orange-100 px-1 rounded">--architect</code> pour les tâches de refactorisation complexes</li>
                      <li>• Le flag <code className="font-mono text-[10px] bg-orange-100 px-1 rounded">--no-auto-commits</code> permet de réviser les changements avant de committer</li>
                      <li>• Aider génère automatiquement des messages de commit Git descriptifs</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ─────────────────────── ARCHITECTURE ─────────────────────── */}
              {activeSection === 'tech' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 font-sans">Architecture Technique</h3>
                    <p className="text-xs text-slate-500 font-light leading-relaxed">
                      SLG AI Hub est un frontend React pur, sans backend propriétaire. Il communique directement avec votre instance LiteLLM via l'API OpenAI standard.
                    </p>
                  </div>

                  {/* Stack */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { cat: 'Frontend', tech: 'React 19 + TypeScript', icon: '⚛️' },
                      { cat: 'Build Tool', tech: 'Vite 8 (ESM natif)', icon: '⚡' },
                      { cat: 'Styles', tech: 'Tailwind CSS v4 + Glassmorphism', icon: '🎨' },
                      { cat: 'État Global', tech: 'Zustand 5 + persist (localStorage)', icon: '🗄️' },
                      { cat: 'Animations', tech: 'Framer Motion 12', icon: '✨' },
                      { cat: 'Rendu 3D', tech: 'React Three Fiber (WebGL)', icon: '🌐' },
                      { cat: 'Markdown', tech: 'react-markdown + remark-gfm', icon: '📝' },
                      { cat: 'Code', tech: 'react-syntax-highlighter (Prism)', icon: '💻' },
                      { cat: 'API LLM', tech: 'LiteLLM Proxy (OpenAI compat.)', icon: '🤖' },
                      { cat: 'Streaming', tech: 'Server-Sent Events (SSE + fetch)', icon: '📡' },
                    ].map(({ cat, tech, icon }) => (
                      <div key={cat} className="p-3 rounded-xl border border-slate-100 bg-white/60">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm">{icon}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cat}</span>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-800">{tech}</span>
                      </div>
                    ))}
                  </div>

                  {/* Architecture diagram */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">Flux de données</h4>
                    <div className="bg-[#0f172a] rounded-2xl p-5 font-mono text-xs">
                      <pre className="text-slate-300 leading-relaxed">{`┌─────────────────────────────────────────┐
│           Navigateur (React)            │
│                                         │
│  ChatInput → useChat hook               │
│       │                                 │
│       ▼                                 │
│  fetch() POST /v1/chat/completions      │
│    ├─ stream: true                      │
│    ├─ Authorization: Bearer <key>       │
│    └─ AbortController.signal            │
│                                         │
│  ReadableStream (SSE chunks)            │
│    └─ updateLastMessageContent()        │
│         └─ Zustand store                │
│              └─ ChatMessage render      │
└─────────────────────────────────────────┘
                    │
                    │ HTTP/HTTPS
                    ▼
┌─────────────────────────────────────────┐
│         LiteLLM Proxy (local)           │
│    http://localhost:8000/v1             │
│                                         │
│  Compatible API OpenAI                  │
│  Supporte : OpenAI, Anthropic,          │
│  Ollama, Azure, Cohere, etc.            │
└─────────────────────────────────────────┘`}</pre>
                    </div>
                  </div>

                  {/* Sécurité */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-sans mb-3">Sécurité & Confidentialité</h4>
                    <ul className="space-y-2 text-xs text-slate-600 font-light">
                      {[
                        '🔒 La clé API est stockée uniquement dans le localStorage du navigateur local — jamais sur un serveur tiers',
                        '🚫 Aucune donnée de conversation n\'est transmise à des services externes',
                        '✅ Toutes les requêtes LLM transitent exclusivement par votre backend LiteLLM local',
                        '🛡️ L\'AbortController permet d\'interrompre proprement toute requête en cours',
                        '📭 Aucune télémétrie ni tracking — code open-source vérifiable',
                      ].map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="flex-shrink-0 mt-0.5">{point.slice(0, 2)}</span>
                          <span>{point.slice(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InfoPage;
