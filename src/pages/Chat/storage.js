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

// Download the conversation as a Markdown file, including cited sources.
export function exportTranscript(messages) {
  const lines = ['# BEI Research Chat transcript', ''];
  for (const m of messages) {
    if (m.role === 'user') {
      lines.push(`## Q: ${m.content}`, '');
    } else if (m.content) {
      lines.push(m.content, '');
      if (m.sources?.length) {
        lines.push('**Sources:**');
        for (const s of m.sources) {
          const bits = [s.title || s.filename, s.authors, s.year].filter(Boolean).join(', ');
          lines.push(`- [${s.index}] ${bits}${s.url ? ` — ${s.url}` : ''}`);
        }
        lines.push('');
      }
    }
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bei-research-chat.md';
  a.click();
  URL.revokeObjectURL(url);
}
