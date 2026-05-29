import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  sidebarOpen: boolean;
  apiKey: string;
  apiUrl: string;
  model: string;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setApiKey: (key: string) => void;
  setApiUrl: (url: string) => void;
  setModel: (model: string) => void;
  
  setActiveConversationId: (id: string | null) => void;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateLastMessageContent: (conversationId: string, content: string) => void;
  setConversationTitle: (id: string, title: string) => void;
  clearAllConversations: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      sidebarOpen: true,
      apiKey: '',
      // Endpoint LiteLLM du serveur SLG
      apiUrl: 'http://192.168.10.90/v1',
      model: 'qwen-3.6',

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setApiKey: (key) => set({ apiKey: key }),
      setApiUrl: (url) => set({ apiUrl: url }),
      setModel: (model) => set({ model }),

      setActiveConversationId: (id) => set({ activeConversationId: id }),

      createConversation: (title) => {
        const id = crypto.randomUUID();
        const newConversation: Conversation = {
          id,
          title: title || 'Nouveau Chat',
          createdAt: new Date().toISOString(),
          messages: [],
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const filteredConversations = state.conversations.filter((c) => c.id !== id);
          let nextActiveId = state.activeConversationId;
          
          if (state.activeConversationId === id) {
            nextActiveId = filteredConversations.length > 0 ? filteredConversations[0].id : null;
          }
          
          return {
            conversations: filteredConversations,
            activeConversationId: nextActiveId,
          };
        });
      },

      addMessage: (conversationId, message) => {
        set((state) => {
          const conversations = state.conversations.map((c) => {
            if (c.id === conversationId) {
              // Update title automatically if it's the first user message
              let title = c.title;
              if (c.messages.length === 0 && message.role === 'user') {
                title = message.content.length > 30 
                  ? message.content.substring(0, 30) + '...' 
                  : message.content;
              }
              return {
                ...c,
                title,
                messages: [...c.messages, message],
              };
            }
            return c;
          });
          return { conversations };
        });
      },

      updateLastMessageContent: (conversationId, content) => {
        set((state) => {
          const conversations = state.conversations.map((c) => {
            if (c.id === conversationId) {
              const messages = [...c.messages];
              if (messages.length > 0) {
                const lastIdx = messages.length - 1;
                messages[lastIdx] = {
                  ...messages[lastIdx],
                  content,
                };
              }
              return {
                ...c,
                messages,
              };
            }
            return c;
          });
          return { conversations };
        });
      },

      setConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) => 
            c.id === id ? { ...c, title } : c
          ),
        }));
      },

      clearAllConversations: () => {
        set({ conversations: [], activeConversationId: null });
      },
    }),
    {
      name: 'slg-ai-hub-chat-store',
    }
  )
);
