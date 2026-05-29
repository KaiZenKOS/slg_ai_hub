import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { ChatMessage } from './ChatMessage';
import { Sparkles } from 'lucide-react';

interface ChatAreaProps {
  onSendPrompt: (prompt: string) => void;
  isStreaming: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ onSendPrompt, isStreaming }) => {
  const { conversations, activeConversationId } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const messages = activeConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const examplePrompts = [
    {
      title: "Fiscalité & Sociétés",
      prompt: "Explique-moi les avantages du régime d'intégration fiscale pour un groupe de sociétés et les conditions d'éligibilité.",
    },
    {
      title: "Analyse SQL & Données",
      prompt: "Rédige une requête SQL optimisée pour calculer le chiffre d'affaires et la TVA collectée par mois à partir d'une table de factures.",
    },
    {
      title: "Modèle de Courrier",
      prompt: "Rédige une lettre d'accompagnement professionnelle pour transmettre la liasse fiscale et le rapport de gestion annuel à un client.",
    }
  ];

  // Identifier le dernier message AI (pour lui appliquer le curseur de streaming)
  const lastAiMessageIndex = messages.reduceRight((found, msg, idx) => {
    if (found !== -1) return found;
    return msg.role === 'assistant' ? idx : -1;
  }, -1);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 w-full flex flex-col justify-between items-center relative">
      <div className="w-full max-w-3xl flex-1 flex flex-col justify-start">
        {messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex-1 flex flex-col justify-center items-center py-8 md:py-16 text-center select-none animate-in fade-in duration-700">

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.16em] text-slate-900 uppercase leading-[1.25] mb-4 font-sans select-text">
              L'avenir de<br />l'expertise est ici
            </h1>

            <p className="text-slate-600 font-light text-xs md:text-sm tracking-wide max-w-lg mx-auto leading-relaxed mb-6 select-text">
              Découvrez l'expérience de gestion comptable et d'audit la plus avancée avec SLG AI Hub.
            </p>

            {/* Spacer for the 3D Sphere */}
            <div className="h-32 md:h-48 w-full pointer-events-none" />

            {/* Examples grid */}
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-2">
              {examplePrompts.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onSendPrompt(item.prompt)}
                  className="bg-white/20 hover:bg-white/40 border border-white/30 backdrop-blur-md text-left p-4 rounded-xl transition-all duration-200 cursor-pointer group shadow-sm"
                >
                  <span className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 group-hover:text-slate-700">
                    <Sparkles className="w-2.5 h-2.5 text-slg-cyan" />
                    {item.title}
                  </span>
                  <p className="text-[11px] text-slate-600 group-hover:text-slate-900 line-clamp-3 leading-relaxed font-sans font-light">
                    "{item.prompt}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="py-4">
            {messages.map((message, idx) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={isStreaming && idx === lastAiMessageIndex}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
