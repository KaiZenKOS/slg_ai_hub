import { useState, useRef, useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import type { Message } from '../stores/chatStore';

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // On garde uniquement les ACTIONS du store (stables, jamais stale)
  // Les VALEURS (apiUrl, apiKey, model, activeConversationId) sont lues
  // via getState() au moment de l'envoi pour éviter les closures périmées.
  const {
    createConversation,
    addMessage,
    updateLastMessageContent,
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

    // ✅ Lecture LIVE du store au moment de l'envoi (évite les stale closures)
    const { activeConversationId, apiUrl, apiKey, model } = useChatStore.getState();

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

      // Récupérer l'état le plus récent des conversations pour construire le contexte
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

      // Normaliser l'URL (éviter les double-slash)
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: model || 'qwen-3.6',
          messages: apiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `HTTP ${response.status} — ${errorText || response.statusText || 'Erreur inconnue'}`
        );
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error("Impossible d'initialiser le flux de lecture SSE.");
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

      // Parser le buffer restant
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
      if (err.name === 'AbortError') {
        // Arrêt volontaire par l'utilisateur
        console.info("Génération arrêtée par l'utilisateur.");
        if (!accumulatedContent) {
          updateLastMessageContent(convId, '*Génération interrompue par l\'utilisateur.*');
        }
      } else {
        // Erreur réseau ou API — on construit un message d'erreur précis
        console.error('Erreur lors du streaming :', err);

        const { apiUrl: currentUrl } = useChatStore.getState();
        const baseUrl = currentUrl.endsWith('/') ? currentUrl.slice(0, -1) : currentUrl;

        let userFacingError: string;

        if (err instanceof TypeError) {
          // TypeError = CORS, DNS, connexion refusée — le navigateur ne donne pas plus de détails
          const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
          if (isLocalhost) {
            userFacingError =
              `**Erreur réseau — URL pointe sur \`${baseUrl}\` (localhost)**\n\n` +
              `> Le backend n'est probablement pas sur ce PC. ` +
              `Allez dans **Réglages** et mettez l'adresse correcte : \`http://192.168.10.90/v1\``;
          } else {
            userFacingError =
              `**Erreur réseau vers \`${baseUrl}\`**\n\n` +
              `> Causes possibles :\n` +
              `> 1. **CORS non activé** sur LiteLLM — ajoutez \`allow_origins=["*"]\` dans la config du serveur\n` +
              `> 2. **Serveur éteint** — vérifiez que LiteLLM tourne bien\n` +
              `> 3. **URL incorrecte** — vérifiez dans les Réglages\n\n` +
              `*Appuyez sur **F12 → Console** pour voir l'erreur exacte du navigateur.*`;
          }
        } else {
          userFacingError =
            `**Erreur API**\n\n` +
            `> \`${err.message || 'Erreur inconnue'}\`\n\n` +
            `*URL utilisée : \`${baseUrl}\` — Vérifiez les Réglages si cette adresse est incorrecte.*`;
        }

        setError(err.message || 'Erreur réseau');
        updateLastMessageContent(convId, `❌ ${userFacingError}`);
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
