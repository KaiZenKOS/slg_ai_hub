import { useState, useRef, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import type { Message } from '../stores/chatStore';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    activeConversationId,
    createConversation,
    addMessage,
    updateLastMessageContent,
    apiUrl,
    apiKey,
    model,
  } = useChatStore();

  /**
   * Annule le flux de génération en cours via AbortController.
   */
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    let convId = activeConversationId;

    // 1. Créer une nouvelle conversation si aucune n'est active
    if (!convId) {
      convId = createConversation();
    }

    // 2. Ajouter le message utilisateur immédiatement (Optimistic UI)
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    addMessage(convId, userMessage);

    // 3. Ajouter un message AI vide qui sera rempli au fur et à mesure
    const aiMessageId = crypto.randomUUID();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    addMessage(convId, aiMessage);

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    // 4. Créer un nouvel AbortController pour cette requête
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedContent = '';

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Récupérer l'état le plus récent des conversations (including the user message)
      const latestConversations = useChatStore.getState().conversations;
      const currentConversation = latestConversations.find((c) => c.id === convId);

      const apiMessages = currentConversation
        ? currentConversation.messages
            .filter((m) => m.id !== aiMessageId)
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
        : [{ role: 'user', content }];

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers,
        signal: controller.signal, // ← AbortController signal
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
        throw new Error("Impossible d'initialiser le flux de lecture.");
      }

      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          buffer += decoder.decode(value, { stream: !done });

          const lines = buffer.split('\n');
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
                console.warn('Erreur parsing chunk SSE:', err, dataStr);
              }
            }
          }
        }
      }

      // Parser le buffer restant si besoin
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
          } catch (e) { /* ignore */ }
        }
      }

    } catch (err: any) {
      // Ne pas afficher d'erreur si c'est un abort volontaire de l'utilisateur
      if (err.name === 'AbortError') {
        console.info('Génération arrêtée par l\'utilisateur.');
        // Si le contenu est vide, mettre un placeholder
        if (!accumulatedContent) {
          updateLastMessageContent(convId, '*Génération interrompue par l\'utilisateur.*');
        }
      } else {
        console.error('Erreur lors du streaming :', err);
        const errMsg = err.message || 'Une erreur réseau est survenue.';
        setError(errMsg);
        updateLastMessageContent(
          convId,
          `❌ **Erreur de connexion avec l'API**\n\n> **Détails :** ${errMsg}\n\n*Veuillez vérifier l'adresse de votre API locale (${apiUrl}) ou votre clé API dans les réglages.*`
        );
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  return {
    sendMessage,
    stopGeneration,
    isLoading,
    isStreaming,
    error,
  };
};
