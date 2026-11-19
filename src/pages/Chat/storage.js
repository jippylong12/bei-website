// In-memory persistence for the research chat. The conversation lives only in
// a module-level store, so it survives navigating to another page and back (the
// Chat component unmounts, this module does not) but is gone after a page
// refresh — a reload deliberately starts a new conversation. The API is
// stateless and receives the history with every turn.
//
// Each chat page has its own store (createMemoryStore), so /BitResearch and
// /prototype never show each other's conversation. /BitResearch uses
// defaultStore, which the three functions below also read and write.
export function createMemoryStore() {
  let memory = [];
  return {
    // a message stored mid-stream (navigated away) comes back as stopped
    load: () => memory.map((m) => (m.status === 'streaming' ? { ...m, status: 'stopped' } : m)),
    save: (messages) => {
      memory = messages;
    },
    clear: () => {
      memory = [];
    },
  };
}

export const defaultStore = createMemoryStore();

// Earlier builds persisted the conversation under this localStorage key. Clear
// it once on load so nothing from before this change lingers in the browser.
try {
  localStorage.removeItem('bei.research-chat.v1');
} catch {
  // storage blocked — nothing to clean up
}

export function loadMessages() {
  return defaultStore.load();
}

export function saveMessages(messages) {
  defaultStore.save(messages);
}

export function clearMessages() {
  defaultStore.clear();
}

// The conversation as Markdown, including cited sources. `title` is the first
// heading and `preamble` any lines under it; the defaults are /BitResearch's.
export function transcriptMarkdown(messages, { title = 'BitResearch transcript', preamble = [] } = {}) {
  const lines = [`# ${title}`, ''];
  if (preamble.length) lines.push(...preamble, '');
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
  return lines.join('\n');
}

// Download the conversation as a Markdown file. Options: those of
// transcriptMarkdown, and `filename`.
export function exportTranscript(messages, { filename = 'bei-research-chat.md', ...options } = {}) {
  const blob = new Blob([transcriptMarkdown(messages, options)], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
