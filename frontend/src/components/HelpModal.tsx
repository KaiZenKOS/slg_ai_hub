import React, { useState } from 'react';
import { X, MessageSquare, Code2, Terminal, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TabType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const CopyableCodeBlock: React.FC<{ code: string; language: string }> = ({
  code,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  return (
    <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700 group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-200"
        title={copied ? 'Copié!' : 'Copier le code'}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      <SyntaxHighlighter
        language={language}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: '16px',
          fontSize: '13px',
          lineHeight: '1.5',
          borderRadius: '8px',
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('usage');

  const tabs: TabType[] = [
    {
      id: 'usage',
      label: 'Guide Utilisateur',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'continue',
      label: 'Continue.dev',
      icon: <Code2 className="w-5 h-5" />,
    },
    {
      id: 'aider',
      label: 'Aider CLI',
      icon: <Terminal className="w-5 h-5" />,
    },
  ];

  const continueConfig = JSON.stringify(
    {
      models: [
        {
          title: 'SLG Local Qwen',
          provider: 'openai',
          model: 'qwen-local',
          apiKey: 'VOTRE_CLE_API',
          apiBase: 'http://192.168.10.92/v1',
        },
      ],
    },
    null,
    2
  );

  const aiderCommand = `aider --model openai/qwen-local --openai-api-base http://192.168.10.92/v1 --openai-api-key VOTRE_CLE_API`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest flex items-center gap-3">
              Aide & Intégration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Guide complet d'utilisation et d'intégration
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-800 flex-shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-slate-100 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tab: Guide Utilisateur */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-500" />
                  Utiliser le Chatbot
                </h3>

                <div className="space-y-4 text-slate-300 text-sm">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-slate-100">Raccourcis Clavier</h4>
                    <ul className="space-y-2">
                      <li className="flex gap-2">
                        <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono text-slate-300 border border-slate-600">
                          Entrée
                        </kbd>
                        <span>Envoie votre message à l'IA</span>
                      </li>
                      <li className="flex gap-2">
                        <kbd className="px-2 py-1 bg-slate-700 rounded text-xs font-mono text-slate-300 border border-slate-600">
                          Shift + Entrée
                        </kbd>
                        <span>Ajoute un saut de ligne dans le message</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-slate-100">Code Généré</h4>
                    <p>
                      Quand l'IA génère du code, vous verrez un bouton{' '}
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-xs">
                        <Copy className="w-3 h-3" /> Copier
                      </span>{' '}
                      en haut à droite du bloc. Cliquez dessus pour copier le code dans votre
                      presse-papiers.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-slate-100">Arrêter la Génération</h4>
                    <p>
                      Pendant que l'IA génère sa réponse, le bouton devient{' '}
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">
                        Stop
                      </span>
                      . Cliquez-le pour arrêter instantanément la génération.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-slate-100">Historique Local</h4>
                    <p>
                      Toutes vos conversations sont sauvegardées automatiquement sur votre appareil
                      (LocalStorage). Vous pouvez créer plusieurs conversations indépendantes à
                      partir du bouton "Nouveau Chat".
                    </p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-emerald-400">Conseils Pratiques</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>Posez des questions claires et précises pour de meilleurs résultats</li>
                      <li>Vous pouvez rédiger ou modifier vos messages avant d'envoyer</li>
                      <li>Utilisez le contexte des messages précédents pour des questions plus complexes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Continue.dev */}
          {activeTab === 'continue' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-500" />
                  Intégration Continue.dev
                </h3>

                <div className="space-y-4 text-slate-300 text-sm">
                  <p>
                    <strong>Continue.dev</strong> est une extension IA puissante pour{' '}
                    <strong>VS Code</strong> et <strong>JetBrains</strong>. Elle vous permet de
                    coder avec l'aide de l'IA directement dans votre éditeur préféré.
                  </p>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-blue-400">Configuration</h4>
                    <p className="text-xs">
                      Localisez le fichier <code className="bg-slate-800 px-1 rounded">~/.continue/config.json</code> et
                      remplacez ou ajoutez la section <code className="bg-slate-800 px-1 rounded">models</code> avec ceci:
                    </p>
                  </div>

                  <CopyableCodeBlock code={continueConfig} language="json" />

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-amber-400">Important</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>Remplacez VOTRE_CLE_API par votre vraie clé API</li>
                      <li>Remplacez http://192.168.10.92/v1 par l'adresse réelle de votre serveur LiteLLM</li>
                      <li>Le fichier config.json est spécifique à votre machine (ne le committez pas)</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-slate-100">Après Configuration</h4>
                    <ol className="space-y-2 list-decimal list-inside">
                      <li>Redémarrez VS Code / JetBrains</li>
                      <li>Ouvrez Continue (Ctrl+L ou via sidebar)</li>
                      <li>Sélectionnez "SLG Local Qwen" dans la dropdown des modèles</li>
                      <li>Commencez à coder avec l'IA</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Aider */}
          {activeTab === 'aider' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-500" />
                  Intégration Aider CLI
                </h3>

                <div className="space-y-4 text-slate-300 text-sm">
                  <p>
                    <strong>Aider</strong> est un assistant IA en ligne de commande qui vous permet
                    de coder directement dans le terminal. Idéal pour le pair programming et
                    l'automatisation!
                  </p>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-slate-100">Installation</h4>
                    <p className="text-xs mb-2">Installez Aider avec pip:</p>
                    <CopyableCodeBlock
                      code="pip install aider-chat"
                      language="bash"
                    />
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-blue-400">Configuration</h4>
                    <p className="text-xs mb-3">
                      Utilisez cette commande pour lancer Aider avec SLG Local Qwen:
                    </p>
                    <CopyableCodeBlock code={aiderCommand} language="bash" />
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-amber-400">Important</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>Remplacez VOTRE_CLE_API par votre vraie clé API</li>
                      <li>Remplacez http://192.168.10.92/v1 par l'adresse réelle de votre serveur LiteLLM</li>
                      <li>Assurez-vous que le serveur LiteLLM est accessible depuis votre terminal</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-slate-100">Exemples d'Utilisation</h4>
                    <p className="text-xs mb-2">Une fois lancé, vous pouvez faire:</p>
                    <CopyableCodeBlock
                      code={`/add main.py utils.py          # Ajouter des fichiers
/ask Write unit tests         # Demander du code
/code                         # Montrer le dernier code généré
/help                         # Afficher l'aide
/quit                         # Quitter Aider`}
                      language="bash"
                    />
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-emerald-400">Cas d'Usage</h4>
                    <ul className="space-y-1 text-slate-300">
                      <li>Générer des tests unitaires automatiquement</li>
                      <li>Rédiger de la documentation rapidement</li>
                      <li>Refactoriser du code legacy</li>
                      <li>Déboguer et corriger des erreurs</li>
                      <li>Accélérer le développement du prototype</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
