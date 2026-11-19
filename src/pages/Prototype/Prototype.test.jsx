// The /prototype page against a stubbed prototype API. No network. Every
// paper, model and answer below is made up.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import robots from '../../../public/robots.txt?raw';
import { PROTOTYPE_API_BASE } from '../../config/prototypeApi';
import Prototype from './Prototype';
import PrototypeLazy from './PrototypeLazy';
import { EXAMPLE_QUESTIONS } from './examples';

const BASE = PROTOTYPE_API_BASE;

const json = (status, body) => () =>
  Promise.resolve(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );

// A POST /api/chat answer: one SSE frame per [event, data].
const sse = (frames) => () =>
  Promise.resolve(
    new Response(frames.map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`).join(''), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    }),
  );

// Stub fetch with one handler per "METHOD URL"; returns the calls it saw. A
// route with no handler fails like a dropped connection.
function stubApi(routes) {
  const calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url, init = {}) => {
      const method = init.method || 'GET';
      calls.push({ method, url, body: init.body ? JSON.parse(init.body) : undefined });
      const handler = routes[`${method} ${url}`];
      return handler ? handler() : Promise.reject(new TypeError(`no stub for ${method} ${url}`));
    }),
  );
  return calls;
}

const PAPERS = Array.from({ length: 12 }, (_, i) => ({
  paper_id: `p${i}`,
  sha256: `sha${i}`,
  title: `Paper ${String(i + 1).padStart(2, '0')}`,
  authors: ['A. Author', 'B. Author'],
  year: String(2010 + i),
  venue: i === 0 ? 'Journal of Examples' : '',
  doi: i === 0 ? '10.1234/zero' : '',
  url: `https://example.org/paper/${i}`,
  link_type: i % 2 ? 'search' : 'publication',
  abstract: i === 0 ? 'What the first paper finds.' : '',
  category: i < 4 ? 'Protocol' : 'Markets and Asset Pricing',
  published: i !== 3,
  filename: `p${i}.pdf`,
}));

const STATS = {
  papers: 100,
  by_year: { 2014: 6, 2018: 11, 2023: 13 },
  by_class: [['Markets and Asset Pricing', 18], ['Protocol', 14]],
};

const BENCHMARK = {
  as_of: '2026-11-20',
  method: 'Graded against the answer key of each question.',
  models: [{ label: 'Example-LLM 27B', correct: 91, total: 100 }],
  baselines: [{ label: 'Frontier Model X', accuracy: 0.35 }],
};

const SOURCES = [
  { index: 1, title: 'Paper One', authors: 'A. Author', year: 2022, url: 'https://example.org/one', link_type: 'publication', snippet: 'Fees peak.', score: 0.9, pdf: null },
  { index: 2, title: 'Paper Two', authors: 'B. Author', year: 2019, url: 'https://example.org/two', link_type: 'search', snippet: 'Blocks.', score: 0.5, pdf: null },
];

const ANSWER = sse([
  ['status', { stage: 'search', message: 'Searching the papers…' }],
  ['sources', { sources: SOURCES }],
  ['delta', { text: 'Fee revenue peaks near 1 MB [Source 1].' }],
  ['delta', { text: ' Larger blocks lower fees [Source 1, Source 2].' }],
  ['followups', { questions: ['How does SegWit adoption change this?'] }],
  ['done', { turn_id: 't-42', mode: 'quick', n_searches: 1, citations_used: [1, 2], confidence: 'high', refused: false, warnings: [] }],
]);

const routes = (overrides = {}) => ({
  [`GET ${BASE}/api/health`]: json(200, { status: 'ok', model_label: 'Example-LLM 27B' }),
  [`GET ${BASE}/api/stats`]: json(200, STATS),
  [`GET ${BASE}/api/papers`]: json(200, { papers: PAPERS }),
  [`GET ${BASE}/api/benchmark`]: json(404, { detail: 'Not Found' }),
  [`POST ${BASE}/api/chat`]: ANSWER,
  [`POST ${BASE}/api/feedback`]: json(200, { ok: true }),
  ...overrides,
});

const paperTitles = () =>
  within(screen.getByRole('region', { name: 'The 100 papers' }))
    .queryAllByRole('listitem')
    .map((li) => li.querySelector('a, span')?.textContent?.replace(' ↗', ''))
    .filter((t) => t?.startsWith('Paper '));

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.requestAnimationFrame ??= (cb) => setTimeout(cb, 0);
});

afterEach(async () => {
  // The conversation outlives the page on purpose (until a reload); start
  // each test with none.
  const reset = screen.queryByRole('button', { name: 'New conversation' });
  if (reset) {
    await waitFor(() => expect(reset.disabled).toBe(false));
    fireEvent.click(reset);
  }
  cleanup();
  vi.unstubAllGlobals();
  delete window.matchMedia;
});

describe('the opening', () => {
  it('names the prototype, its corpus and the model from /api/health', async () => {
    const calls = stubApi(routes());
    render(<Prototype />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('BitResearch prototype');
    expect(
      screen.getByText('Ask questions about 100 Bitcoin research papers. Every answer cites the papers it comes from.'),
    ).toBeTruthy();

    const badges = within(screen.getByRole('list', { name: 'About this prototype' }));
    await badges.findByText('Example-LLM 27B');
    expect(badges.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      '100 papers',
      'Example-LLM 27B · open weights, our own GPU',
      'No sign-up',
    ]);

    // Every call goes to the prototype API, none to production.
    await waitFor(() => expect(calls.length).toBeGreaterThanOrEqual(3));
    for (const c of calls) {
      expect(c.url.startsWith(`${BASE}/api/`)).toBe(true);
      expect(c.url).not.toMatch(/bei-api|api\.btcedu\.org/);
    }
  });

  it('still opens when the API is down, with no model name', async () => {
    stubApi({});
    render(<Prototype />);
    expect(screen.getByText('Open-weight model · our own GPU')).toBeTruthy();
    expect(await screen.findByText(/The list of papers is not available right now/)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Benchmark' })).toBeNull();
  });
});

describe('the example questions', () => {
  it('include the fees question and a few more', () => {
    expect(EXAMPLE_QUESTIONS).toContain(
      "In 'What drives Bitcoin fees?', what block size would maximize Bitcoin's fee revenue?",
    );
    expect(EXAMPLE_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    expect(EXAMPLE_QUESTIONS.length).toBeLessThanOrEqual(6);
  });

  it('are on the page, and one click asks', async () => {
    const calls = stubApi(routes());
    render(<Prototype />);
    const list = within(screen.getByRole('list', { name: 'Try a question' }));
    expect(list.getAllByRole('button').map((b) => b.textContent)).toEqual(EXAMPLE_QUESTIONS);

    fireEvent.click(list.getByRole('button', { name: EXAMPLE_QUESTIONS[0] }));

    await screen.findByText(/Fee revenue peaks near 1 MB/);
    expect(calls.find((c) => c.method === 'POST')).toEqual({
      method: 'POST',
      url: `${BASE}/api/chat`,
      body: { message: EXAMPLE_QUESTIONS[0], history: [], mode: 'quick' },
    });
  });
});

describe('the chat', () => {
  it('shows the cited answer, opens a source from its chip, offers follow-ups and sends feedback', async () => {
    const calls = stubApi(routes());
    render(<Prototype />);
    fireEvent.click(screen.getByRole('button', { name: EXAMPLE_QUESTIONS[0] }));

    await screen.findByText('How does SegWit adoption change this?');
    expect(screen.getByRole('button', { name: 'New conversation' })).toBeTruthy();
    // "[Source N]" and grouped citations are chips that open the panel.
    const chips = screen.getAllByRole('button', { name: /^Show source \d$/ }).map((b) => b.textContent);
    expect(chips).toEqual(['1', '1', '2']);
    expect(document.body.textContent).not.toContain('[Source');
    expect(document.getElementById('source-2')).toBeNull();

    fireEvent.click(screen.getAllByRole('button', { name: 'Show source 2' })[0]);
    const source = document.getElementById('source-2');
    expect(source.textContent).toContain('Paper Two');
    expect(within(source).queryByRole('link', { name: 'PDF' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Helpful answer' }));
    expect(screen.getByText('Thanks for the feedback.')).toBeTruthy();
    await waitFor(() =>
      expect(calls.filter((c) => c.method === 'POST').at(-1)).toEqual({
        method: 'POST',
        url: `${BASE}/api/feedback`,
        body: { turn_id: 't-42', rating: 'up' },
      }),
    );

    // The card scrolled into view once, when the conversation began.
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }));
  });

  it('asks a follow-up with the conversation so far', async () => {
    const calls = stubApi(routes());
    render(<Prototype />);
    fireEvent.click(screen.getByRole('button', { name: EXAMPLE_QUESTIONS[1] }));
    const followup = await screen.findByRole('button', { name: 'How does SegWit adoption change this?' });
    await screen.findByRole('button', { name: 'Send question' }); // the first answer has finished
    fireEvent.click(followup);

    await waitFor(() => expect(calls.filter((c) => c.url.endsWith('/api/chat'))).toHaveLength(2));
    const second = calls.filter((c) => c.url.endsWith('/api/chat'))[1].body;
    expect(second.message).toBe('How does SegWit adoption change this?');
    expect(second.history.map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('switches between Quick and Deep, and sends the mode', async () => {
    const calls = stubApi(routes());
    render(<Prototype />);
    const quick = screen.getByRole('button', { name: 'Quick' });
    const deep = screen.getByRole('button', { name: 'Deep' });
    expect([quick.getAttribute('aria-pressed'), deep.getAttribute('aria-pressed')]).toEqual(['true', 'false']);

    fireEvent.click(deep);
    expect([quick.getAttribute('aria-pressed'), deep.getAttribute('aria-pressed')]).toEqual(['false', 'true']);
    fireEvent.click(deep); // pressing the pressed one changes nothing
    expect(deep.getAttribute('aria-pressed')).toBe('true');

    fireEvent.change(screen.getByLabelText('Your question'), { target: { value: 'What is selfish mining?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send question' }));

    await screen.findByText(/Fee revenue peaks/);
    expect(calls.find((c) => c.method === 'POST').body).toMatchObject({ message: 'What is selfish mining?', mode: 'deep' });
  });

  it("says so in the prototype's words when the API cannot be reached", async () => {
    stubApi(routes({ [`POST ${BASE}/api/chat`]: () => Promise.reject(new TypeError('offline')) }));
    render(<Prototype />);
    fireEvent.click(screen.getByRole('button', { name: EXAMPLE_QUESTIONS[2] }));
    expect(
      await screen.findByText('The BitResearch prototype could not be reached. Please try again in a moment.'),
    ).toBeTruthy();
  });

  it("shows the API's own message for a refused request (rate limit)", async () => {
    stubApi(routes({ [`POST ${BASE}/api/chat`]: json(429, { code: 'rate_limited', message: 'Please wait a minute.' }) }));
    render(<Prototype />);
    fireEvent.click(screen.getByRole('button', { name: EXAMPLE_QUESTIONS[3] }));
    expect(await screen.findByText('Please wait a minute.')).toBeTruthy();
  });

  it('marks a refusal with the prototype note', async () => {
    stubApi(
      routes({
        [`POST ${BASE}/api/chat`]: sse([
          ['sources', { sources: [] }],
          ['delta', { text: 'The papers in this corpus do not answer this question.' }],
          ['done', { turn_id: 't-7', citations_used: [], refused: true }],
        ]),
      }),
    );
    render(<Prototype />);
    fireEvent.click(screen.getByRole('button', { name: EXAMPLE_QUESTIONS[4] }));
    expect(
      await screen.findByText(
        'The 100 papers in this prototype do not contain enough evidence to answer this, so BitResearch does not attempt an answer.',
      ),
    ).toBeTruthy();
  });

  it('reads an answer streamed with CRLF line ends', async () => {
    stubApi(
      routes({
        [`POST ${BASE}/api/chat`]: () =>
          Promise.resolve(
            new Response(
              'event: delta\r\ndata: {"text": "Line ends do not matter."}\r\n\r\nevent: done\r\ndata: {"turn_id": "t-9"}\r\n\r\n',
              { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
            ),
          ),
      }),
    );
    render(<Prototype />);
    fireEvent.click(screen.getByRole('button', { name: EXAMPLE_QUESTIONS[0] }));
    expect(await screen.findByText('Line ends do not matter.')).toBeTruthy();
    expect(screen.queryByText('Response stopped.')).toBeNull();
  });
});

describe('the benchmark', () => {
  it('is left out when the API has none (404)', async () => {
    const calls = stubApi(routes());
    render(<Prototype />);
    await waitFor(() => expect(calls.some((c) => c.url.endsWith('/api/benchmark'))).toBe(true));
    await screen.findByText('Paper 12');
    expect(screen.queryByRole('heading', { name: 'Benchmark' })).toBeNull();
  });

  it('shows the open-weight models beside the frontier baselines, and the method', async () => {
    stubApi(routes({ [`GET ${BASE}/api/benchmark`]: json(200, BENCHMARK) }));
    render(<Prototype />);
    const panel = within(await screen.findByRole('region', { name: 'Benchmark' }));
    expect(panel.getByText('Open-weight models, answering from the 100 papers')).toBeTruthy();
    expect(panel.getByText('Frontier models answering from memory, without the corpus')).toBeTruthy();
    expect(panel.getByText('Example-LLM 27B')).toBeTruthy();
    expect(panel.getByText('91%')).toBeTruthy();
    expect(panel.getByText('Frontier Model X')).toBeTruthy();
    expect(panel.getByText('35%')).toBeTruthy();
    expect(panel.getByText('Graded against the answer key of each question.')).toBeTruthy();
    expect(panel.getByText(/Measured November 20, 2026/)).toBeTruthy();
  });

  it('is left out when the payload is not a benchmark', async () => {
    stubApi(routes({ [`GET ${BASE}/api/benchmark`]: json(200, { models: [] }) }));
    render(<Prototype />);
    await screen.findByText('Paper 12');
    expect(screen.queryByRole('region', { name: 'Benchmark' })).toBeNull();
  });
});

describe('the papers', () => {
  it('lists them newest first, ten at a time, with their links and no PDF', async () => {
    stubApi(routes());
    render(<Prototype />);
    await screen.findByText('Paper 12');
    expect(screen.getByText('12 papers, newest first')).toBeTruthy();
    expect(paperTitles()).toEqual(['Paper 12', 'Paper 11', 'Paper 10', 'Paper 09', 'Paper 08', 'Paper 07', 'Paper 06', 'Paper 05', 'Paper 04', 'Paper 03']);

    fireEvent.click(screen.getByRole('button', { name: 'Show all 12 papers' }));
    expect(paperTitles()).toHaveLength(12);

    const first = screen.getByRole('link', { name: /^Paper 01/ });
    expect(first.getAttribute('href')).toBe('https://example.org/paper/0');
    expect(first.getAttribute('title')).toBe('Open the publication');
    expect(screen.getByRole('link', { name: /^Paper 02/ }).getAttribute('title')).toBe('Find this paper');
    expect(screen.getByRole('link', { name: 'DOI 10.1234/zero' }).getAttribute('href')).toBe('https://doi.org/10.1234/zero');
    expect(screen.getByText('A. Author and B. Author · 2010 · Journal of Examples')).toBeTruthy();
    expect(screen.getAllByText('Unpublished')).toHaveLength(1);
    const region = screen.getByRole('region', { name: 'The 100 papers' });
    expect([...region.querySelectorAll('a')].some((a) => /pdf/i.test(a.getAttribute('href')))).toBe(false);
  });

  it('filters by subject and searches', async () => {
    stubApi(routes());
    render(<Prototype />);
    await screen.findByText('Paper 12');

    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Protocol' } });
    expect(screen.getByText('4 of 12 papers match')).toBeTruthy();
    expect(paperTitles()).toEqual(['Paper 04', 'Paper 03', 'Paper 02', 'Paper 01']);

    fireEvent.change(screen.getByLabelText('Search the papers'), { target: { value: 'paper 02' } });
    expect(paperTitles()).toEqual(['Paper 02']);

    fireEvent.change(screen.getByLabelText('Search the papers'), { target: { value: 'nothing like this' } });
    expect(screen.getByText(/No paper matches/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear the search' }));
    expect(screen.getByText('12 papers, newest first')).toBeTruthy();
  });

  it('starts a question from the subject chart', async () => {
    window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    stubApi(routes());
    render(<Prototype />);
    fireEvent.click(await screen.findByRole('button', { name: /^Ask about Protocol/ }));
    expect(screen.getByLabelText('Your question').value).toBe('What does the research say about Protocol?');
  });
});

describe('the route', () => {
  it('is noindex and titled while open, and tidies up after', () => {
    stubApi({});
    const before = document.title;
    const { unmount } = render(<PrototypeLazy />);
    expect(document.head.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex, nofollow');
    expect(document.title).toBe('BitResearch prototype · Bitcoin Education Institute');
    unmount();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.title).toBe(before);
  });

  it('is disallowed in robots.txt', () => {
    expect(robots).toMatch(/^Disallow: \/prototype$/m);
    expect(robots).toMatch(/^Disallow: \/BitResearch$/m);
  });
});
