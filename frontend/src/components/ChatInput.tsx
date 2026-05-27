import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height
    textarea.style.height = 'auto';
    // Set to scrollHeight
    const newHeight = Math.min(textarea.scrollHeight, 200); // Max height 200px
    textarea.style.height = `${newHeight}px`;
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    
    // Reset focus and height
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
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
          placeholder="Posez votre question à SLG AI..."
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-slate-900 placeholder-slate-400 text-sm md:text-base font-sans resize-none py-1 max-h-[200px] overflow-y-auto leading-relaxed font-light"
          style={{ minHeight: '24px' }}
        />
        
        {/* Sleek Autono-style black/slate sending button */}
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
      </div>
      <div className="text-center mt-2 text-[10px] text-slate-500 font-sans font-light">
        SLG AI Hub peut commettre des erreurs. Pensez à vérifier les informations importantes.
      </div>
    </form>
  );
};

export default ChatInput;
