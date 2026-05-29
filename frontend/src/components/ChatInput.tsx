import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  disabled: boolean;
  isStreaming: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, disabled, isStreaming }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, [text]);

  // Focus la textarea quand le streaming se termine
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled || isStreaming) return;
    onSend(text);
    setText('');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isTextEmpty = !text.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="relative max-w-3xl w-full mx-auto"
    >
      <div className="relative flex items-end w-full rounded-2xl glass-input pr-12 pl-4 py-3 shadow-xl transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Génération en cours...' : 'Posez votre question à SLG AI...'}
          rows={1}
          disabled={disabled || isStreaming}
          className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-slate-900 placeholder-slate-400 text-sm md:text-base font-sans resize-none py-1 max-h-[200px] overflow-y-auto leading-relaxed font-light disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
          style={{ minHeight: '24px' }}
        />

        {/* Bouton Stop (carré rouge) pendant la génération */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            title="Arrêter la génération"
            className="absolute right-3 bottom-2.5 w-9 h-9 rounded-xl flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer animate-pulse-subtle"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        ) : (
          /* Bouton Envoyer normal */
          <button
            type="submit"
            disabled={isTextEmpty || disabled}
            className={`absolute right-3 bottom-2.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ease-out cursor-pointer ${
              isTextEmpty || disabled
                ? 'bg-slate-200 text-slate-400 opacity-60 pointer-events-none'
                : 'bg-slate-900 text-white hover:scale-105 active:scale-95 shadow-md hover:bg-slate-800'
            }`}
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      <div className="text-center mt-2 text-[10px] text-slate-500 font-sans font-light">
        {isStreaming ? (
          <span className="text-slate-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1.5 mb-0.5" />
            Génération en cours — Cliquez sur ⬛ pour interrompre
          </span>
        ) : (
          'SLG AI Hub peut commettre des erreurs. Pensez à vérifier les informations importantes.'
        )}
      </div>
    </form>
  );
};

export default ChatInput;
