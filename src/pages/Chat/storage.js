// localStorage persistence for the research chat. The browser is the only
// place the conversation lives — the API is stateless and receives the
// history with every turn.
const KEY = 'bei.research-chat.v1';
const MAX_MESSAGES = 40;

export function loadMessages() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (data?.v !== 1 || !Array.isArray(data.messages)) return [];
    // a message persisted mid-stream (tab closed) is shown as stopped
    return data.messages.map((m) =>
      m.status === 'streaming' ? { ...m, status: 'stopped' } : m
    );
  } catch {
    return [];
  }
}

export function saveMessages(messages) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ v: 1, updatedAt: Date.now(), messages: messages.slice(-MAX_MESSAGES) })
    );
  } catch {
    // storage full/blocked — the chat still works, it just won't persist
  }
}

export function clearMessages() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
