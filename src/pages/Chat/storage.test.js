// Conversation stores and the Markdown transcript (storage.js).
import { describe, expect, it } from 'vitest';
import { createMemoryStore, defaultStore, loadMessages, saveMessages, clearMessages, transcriptMarkdown } from './storage';

const MESSAGES = [
  { id: 'u', role: 'user', content: 'What drives fees?', status: 'done' },
  {
    id: 'a',
    role: 'assistant',
    content: 'Demand for block space [Source 1].',
    status: 'done',
    sources: [{ index: 1, title: 'Paper One', authors: 'A. Author', year: 2022, url: 'https://doi.org/10.1/x' }],
  },
];

describe('memory stores', () => {
  it('keeps each page\'s conversation apart', () => {
    const prototype = createMemoryStore();
    prototype.save(MESSAGES);
    expect(prototype.load()).toHaveLength(2);
    expect(defaultStore.load()).toEqual([]);

    saveMessages([MESSAGES[0]]);
    expect(loadMessages()).toHaveLength(1);
    expect(prototype.load()).toHaveLength(2);
    clearMessages();
    expect(loadMessages()).toEqual([]);
  });

  it('brings a message saved mid-stream back as stopped', () => {
    const store = createMemoryStore();
    store.save([{ id: 'a', role: 'assistant', content: 'Part', status: 'streaming' }]);
    expect(store.load()[0].status).toBe('stopped');
  });
});

describe('transcriptMarkdown', () => {
  it('is unchanged for /BitResearch', () => {
    expect(transcriptMarkdown(MESSAGES)).toBe(
      [
        '# BitResearch transcript',
        '',
        '## Q: What drives fees?',
        '',
        'Demand for block space [Source 1].',
        '',
        '**Sources:**',
        '- [1] Paper One, A. Author, 2022 — https://doi.org/10.1/x',
        '',
      ].join('\n'),
    );
  });

  it('takes a title and a preamble', () => {
    const md = transcriptMarkdown(MESSAGES, {
      title: 'BitResearch prototype transcript',
      preamble: ['2026-11-19 · Corpus: 100 papers'],
    });
    expect(md.startsWith('# BitResearch prototype transcript\n\n2026-11-19 · Corpus: 100 papers\n\n## Q:')).toBe(true);
  });
});
