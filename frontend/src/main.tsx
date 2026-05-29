import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Migration automatique : si l'URL stockée pointe encore sur localhost,
// on la corrige vers le bon serveur pour éviter que les anciens utilisateurs
// soient bloqués sans comprendre pourquoi.
const STORAGE_KEY = 'slg-ai-hub-chat-store';
const CORRECT_API_URL = 'http://192.168.10.90/v1';

try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    const storedUrl: string = parsed?.state?.apiUrl ?? '';
    if (storedUrl.includes('localhost') || storedUrl.includes('127.0.0.1')) {
      parsed.state.apiUrl = CORRECT_API_URL;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      console.info(`[SLG AI Hub] URL migrée automatiquement : "${storedUrl}" → "${CORRECT_API_URL}"`);
    }
  }
} catch (e) {
  // Si le localStorage est corrompu ou illisible, on ignore silencieusement
  console.warn('[SLG AI Hub] Impossible de lire/migrer le localStorage :', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
