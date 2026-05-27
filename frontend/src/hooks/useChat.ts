import { useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import type { Message } from '../stores/chatStore';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    activeConversationId,
    createConversation,
    addMessage,
    updateLastMessageContent,
    apiUrl,
    apiKey,
    model,
  } = useChatStore();

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    let convId = activeConversationId;
    
    // 1. Create a new conversation if none is active
    if (!convId) {
      convId = createConversation();
    }

    // 2. Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(convId, userMessage);

    // 3. Add an empty AI message to be populated by streaming
    const aiMessageId = crypto.randomUUID();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    addMessage(convId, aiMessage);

    setIsLoading(true);
    setError(null);

    let accumulatedContent = '';

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Fetch the latest state of conversations to get the absolute up-to-date message list (including the user message we just added)
      const latestConversations = useChatStore.getState().conversations;
      const currentConversation = latestConversations.find((c) => c.id === convId);
      
      const apiMessages = currentConversation
        ? currentConversation.messages
            // Exclude the last empty AI message we just created
            .filter((m) => m.id !== aiMessageId)
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
        : [{ role: 'user', content }];

      // Make the fetch request for streaming
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'qwen-3.6',
          messages: apiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `Erreur API (${response.status}): ${errorText || response.statusText || 'Erreur inconnue'}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error("Impossible d'initialiser le flux de lecture (response body reader).");
      }

      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          
          // Split buffer by lines
          const lines = buffer.split('\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.slice(6).trim();

              if (dataStr === '[DONE]') {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(dataStr);
                const chunk = parsed.choices?.[0]?.delta?.content || '';
                if (chunk) {
                  accumulatedContent += chunk;
                  updateLastMessageContent(convId, accumulatedContent);
                }
              } catch (err) {
                // Chunk might be incomplete or malformed JSON, ignore or log
                console.warn('Erreur parsing chunk SSE:', err, dataStr);
              }
            }
          }
        }
      }

      // Parse the remaining buffer if any
      if (buffer.trim().startsWith('data: ')) {
        const dataStr = buffer.trim().slice(6).trim();
        if (dataStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataStr);
            const chunk = parsed.choices?.[0]?.delta?.content || '';
            if (chunk) {
              accumulatedContent += chunk;
              updateLastMessageContent(convId, accumulatedContent);
            }
          } catch (e) {}
        }
      }

    } catch (err: any) {
      console.error('Erreur lors du streaming :', err);
      const errMsg = err.message || 'Une erreur réseau est survenue.';
      setError(errMsg);
      
      // Update the empty assistant message with the error details
      updateLastMessageContent(
        convId,
        `❌ **Erreur de connexion avec l'API**\n\n> **Détails :** ${errMsg}\n\n*Veuillez vérifier l'adresse de votre API locale (${apiUrl}) ou votre clé API dans les réglages en bas à gauche.*`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
  };
};
