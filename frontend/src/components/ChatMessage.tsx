import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import type { Message } from '../stores/chatStore';

interface ChatMessageProps {
  message: Message;
}

// Sub-component for individual Code Blocks with a copy button
const CodeBlock: React.FC<{ language: string; value: string }> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-slate-200 shadow-md group">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0f172a] border-b border-white/5 text-[10px] text-slate-400 font-mono">
        <span className="font-bold tracking-wider">{language.toUpperCase()}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 py-1 px-1.5 rounded hover:bg-white/10 hover:text-white transition-colors duration-150 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copié !</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      <div className="text-xs font-mono overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            background: '#1e293b',
            padding: '0.875rem',
            fontSize: '0.8rem',
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full mb-6 gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI Icon (Left) */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-md border border-slate-200">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Message Content Container */}
      <div
        className={`max-w-[85%] md:max-w-[75%] ${
          isUser
            ? 'bg-slg-cyan text-white px-5 py-2.5 rounded-2xl rounded-tr-none shadow-md'
            : 'text-slate-800 flex-grow'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm font-sans font-medium">{message.content}</p>
        ) : (
          <div className="prose max-w-none text-sm leading-relaxed font-sans prose-pre:bg-transparent prose-pre:p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  const codeString = String(children).replace(/\n$/, '');

                  return !isInline ? (
                    <CodeBlock language={match ? match[1] : 'text'} value={codeString} />
                  ) : (
                    <code
                      className="bg-slate-200/60 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-300/40"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-800 font-light leading-relaxed">{children}</p>,
                h1: ({ children }) => <h1 className="text-lg md:text-xl font-bold text-slate-900 mt-4 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base md:text-lg font-bold text-slate-900 mt-3 mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm md:text-base font-bold text-slate-900 mt-2 mb-1">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 text-slate-800 space-y-1 font-light">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 text-slate-800 space-y-1 font-light">{children}</ol>,
                li: ({ children }) => <li className="text-xs md:text-sm">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-slate-400 pl-4 italic text-slate-500 my-2 font-light">
                    {children}
                  </blockquote>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slg-cyan hover:underline font-semibold"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-lg border border-slate-200 shadow-sm bg-white/35">
                    <table className="min-w-full divide-y divide-slate-200">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-xs text-slate-700 whitespace-nowrap">{children}</td>
                ),
              }}
            >
              {message.content || '...'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* User Icon (Right) */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 shadow-sm">
          <User className="w-4 h-4 text-slate-700" />
        </div>
      )}
    </motion.div>
  );
};
export default ChatMessage;
