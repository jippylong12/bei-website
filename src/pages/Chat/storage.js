// In-memory persistence for the research chat. The conversation lives only in
// this module, so it survives navigating to another page and back (the Chat
// component unmounts, this module does not) but is gone after a page refresh —
// a reload deliberately starts a new conversation. The API is stateless and
// receives the history with every turn.
let memory = [];

// Earlier builds persisted the conversation under this localStorage key. Clear
// it once on load so nothing from before this change lingers in the browser.
try {
  localStorage.removeItem('bei.research-chat.v1');
} catch {
  // storage blocked — nothing to clean up
}

export function loadMessages() {
  // a message stored mid-stream (navigated away) comes back as stopped
  return memory.map((m) => (m.status === 'streaming' ? { ...m, status: 'stopped' } : m));
}

export function saveMessages(messages) {
  memory = messages;
}

export function clearMessages() {
  memory = [];
}

// Download the conversation as a Markdown file, including cited sources.
export function exportTranscript(messages) {
  const lines = ['# BitResearch transcript', ''];
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
