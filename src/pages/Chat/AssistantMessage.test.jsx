// Citation chips in an answer (AssistantMessage + citations.js), and the
// sources panel's options. No network.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import AssistantMessage from './AssistantMessage';
import { toCitationLinks } from './citations';

const SOURCES = [
  { index: 1, title: 'Paper One', authors: 'A. Author', year: 2021, url: 'https://doi.org/10.1/one', link_type: 'publication' },
  { index: 2, title: 'Paper Two', authors: 'B. Author', year: 2019, url: null },
  { index: 3, title: 'Paper Three', authors: 'C. Author', year: 2017, url: null, pdf: '/api/papers/abc/pdf' },
];

function renderAnswer(content, props = {}, message = {}) {
  return render(
    <AssistantMessage
      message={{
        id: 'a1',
        role: 'assistant',
        content,
        status: 'done',
        sources: SOURCES,
        citationsUsed: [1, 2],
        refused: false,
        mode: 'quick',
        ...message,
      }}
      {...props}
    />,
  );
}

const chipButtons = () =>
  screen.queryAllByRole('button', { name: /^Show source \d+$/ }).map((b) => b.textContent);
const chipLinks = () =>
  screen.queryAllByRole('link', { name: /^Open source \d+/ }).map((a) => a.textContent);

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.requestAnimationFrame ??= (cb) => setTimeout(cb, 0);
});

afterEach(() => {
  cleanup();
});

describe('toCitationLinks', () => {
  it.each([
    ['Fees rise [1].', 'Fees rise [1](#src-1).'],
    ['Fees rise [Source 1].', 'Fees rise [1](#src-1).'],
    ['Fees rise [source 1].', 'Fees rise [1](#src-1).'],
    ['Both [Source 1, Source 2].', 'Both [1](#src-1)[2](#src-2).'],
    ['Both [Source 1, 3].', 'Both [1](#src-1)[3](#src-3).'],
    ['Both [Sources 2, 3].', 'Both [2](#src-2)[3](#src-3).'],
    ['Both [1, 2].', 'Both [1](#src-1)[2](#src-2).'],
    ['Both [Source 1; Source 2].', 'Both [1](#src-1)[2](#src-2).'],
    ['Adjacent [Source 1][Source 2].', 'Adjacent [1](#src-1)[2](#src-2).'],
    ['A link [1](https://x.org) stays.', 'A link [1](https://x.org) stays.'],
    ['Plain [note] stays.', 'Plain [note] stays.'],
    ['Not a citation: [Source] or [Source A].', 'Not a citation: [Source] or [Source A].'],
  ])('%s', (input, expected) => {
    expect(toCitationLinks(input)).toBe(expected);
  });
});

describe('citation chips', () => {
  it('draws the API format "[Source N]" and grouped citations as chips', () => {
    renderAnswer('Fees rise [Source 2] and fall [Source 2, Source 3].');
    expect(chipButtons()).toEqual(['2', '2', '3']);
    expect(document.body.textContent).not.toContain('[Source');
  });

  it('keeps a bracketed number with no source behind it as text', () => {
    renderAnswer('As of [2021], see [Source 9] and [Source 2].');
    expect(chipButtons()).toEqual(['2']);
    expect(document.body.textContent).toContain('[2021]');
    expect(document.body.textContent).toContain('[9]');
  });

  it('by default links a chip whose source has a URL to the paper (as /BitResearch does)', () => {
    renderAnswer('Fees rise [1] and fall [2].');
    expect(chipLinks()).toEqual(['1']);
    expect(screen.getByRole('link', { name: /^Open source 1/ }).getAttribute('href')).toBe('https://doi.org/10.1/one');
    expect(chipButtons()).toEqual(['2']);
  });

  it('with chipsOpenPanel, every chip opens the sources panel at its source', () => {
    renderAnswer('Fees rise [Source 1] and fall [Source 2].', { chipsOpenPanel: true });
    expect(chipLinks()).toEqual([]);
    expect(chipButtons()).toEqual(['1', '2']);
    expect(screen.queryByRole('list')).toBeNull(); // panel closed

    fireEvent.click(screen.getAllByRole('button', { name: 'Show source 1' })[0]);

    const item = document.getElementById('source-1');
    expect(item).toBeTruthy();
    expect(item.textContent).toContain('Paper One');
    expect(screen.getByRole('button', { name: /Sources \(3, 2 cited\)/ }).getAttribute('aria-expanded')).toBe('true');
  });

  it('shows a custom refusal note', () => {
    renderAnswer('No.', { refusalNote: 'Not in these papers.' }, { refused: true });
    expect(screen.getByText('Not in these papers.')).toBeTruthy();
  });
});

describe('sources panel options', () => {
  const openPanel = () => fireEvent.click(screen.getByRole('button', { name: /Sources \(/ }));

  it('shows the PDF chip from the API base by default', () => {
    renderAnswer('See [3].');
    openPanel();
    expect(screen.getByRole('link', { name: 'PDF' }).getAttribute('href')).toMatch(/\/api\/papers\/abc\/pdf$/);
  });

  it('hides the PDF chip and e-mails, and tidies metadata, when asked', () => {
    const messy = [
      { index: 1, title: 'What_drives_Bitcoin_fees', authors: 'x'.repeat(200), year: 2022, url: null, pdf: '/p.pdf', emails: ['a@example.org'] },
    ];
    renderAnswer('See [1].', { sourcesPanelProps: { showPdf: false, showEmails: false, tidyMetadata: true } }, { sources: messy });
    openPanel();
    expect(screen.queryByRole('link', { name: 'PDF' })).toBeNull();
    expect(document.body.textContent).not.toContain('a@example.org');
    expect(screen.getByText('What drives Bitcoin fees')).toBeTruthy();
    expect(document.body.textContent).not.toContain('xxxxxxxxxx');
  });

  it('adds an ellipsis only to a snippet the API cut at its cap', () => {
    const sources = [
      { index: 1, title: 'Short', snippet: 'A whole sentence.', url: null },
      { index: 2, title: 'Long', snippet: 'y'.repeat(300), url: null },
    ];
    renderAnswer('See [1] and [2].', {}, { sources });
    openPanel();
    expect(screen.getByText('A whole sentence.')).toBeTruthy();
    expect(screen.getByText(`${'y'.repeat(300)}…`)).toBeTruthy();
  });
});
