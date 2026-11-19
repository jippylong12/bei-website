// What /prototype accepts from its API (prototypeData.js). Every paper and
// model below is made up.
import { describe, expect, it } from 'vitest';
import { authorLine, parseBenchmark, parseHealth, parsePapers, PROTOTYPE_STATS_FALLBACK } from './prototypeData';

describe('parseHealth', () => {
  it('reads the model label, and copes without one', () => {
    expect(parseHealth({ status: 'ok', model_label: '  Example 30B  ' })).toEqual({ modelLabel: 'Example 30B' });
    expect(parseHealth({ status: 'ok' })).toEqual({ modelLabel: null });
    expect(parseHealth(null)).toBeNull();
  });
});

describe('parsePapers', () => {
  const paper = {
    paper_id: 'abc',
    sha256: 'abcdef',
    title: 'A Study',
    authors: ['A. One', 'B. Two'],
    year: '2021',
    venue: 'Journal',
    doi: 'https://doi.org/10.1/x',
    url: 'https://doi.org/10.1/x',
    link_type: 'publication',
    abstract: 'Text.',
    category: 'Protocol',
    published: true,
    filename: 'a.pdf',
  };

  it('takes a list or {papers: [...]}', () => {
    expect(parsePapers([paper])).toHaveLength(1);
    expect(parsePapers({ papers: [paper] })).toHaveLength(1);
  });

  it('normalises a paper', () => {
    const [p] = parsePapers([paper]);
    expect(p).toMatchObject({
      id: 'abc',
      title: 'A Study',
      authors: ['A. One', 'B. Two'],
      year: '2021',
      doi: '10.1/x',
      linkType: 'publication',
      category: 'Protocol',
      published: true,
    });
  });

  it('copes with gaps and drops what it cannot show', () => {
    const papers = parsePapers([
      { filename: 'only_a_file.pdf', authors: 'X. Y; Z. W', year: 2019, url: 'javascript:alert(1)' },
      { title: '' },
      null,
    ]);
    expect(papers).toHaveLength(1);
    expect(papers[0]).toMatchObject({
      title: 'only_a_file.pdf',
      authors: ['X. Y', 'Z. W'],
      year: '2019',
      url: '',
      linkType: 'search',
      category: 'Uncategorized',
      published: false,
    });
  });

  it('rejects a payload with no papers', () => {
    expect(parsePapers({})).toBeNull();
    expect(parsePapers([])).toBeNull();
    expect(parsePapers('nope')).toBeNull();
  });
});

describe('authorLine', () => {
  it('names up to three authors, then et al.', () => {
    expect(authorLine([])).toBe('');
    expect(authorLine(['A'])).toBe('A');
    expect(authorLine(['A', 'B'])).toBe('A and B');
    expect(authorLine(['A', 'B', 'C'])).toBe('A, B and C');
    expect(authorLine(['A', 'B', 'C', 'D'])).toBe('A, B, C et al.');
  });
});

describe('parseBenchmark', () => {
  const report = {
    as_of: '2026-11-20',
    corpus: '100 papers',
    retrieval: 'hybrid search with reranking',
    method: 'Graded against the answer key.',
    models: [
      { label: 'Model B', accuracy: 0.81, correct: 81, total: 100 },
      { name: 'Model A', correct: 92, total: 100 },
      { model: 'Model C', accuracy: 75 },
      { label: 'No score' },
    ],
    baselines: [{ label: 'Frontier X', accuracy: 0.35 }],
  };

  it('reads models and baselines, best first, as fractions', () => {
    const b = parseBenchmark(report);
    expect(b.models.map((m) => [m.label, m.accuracy])).toEqual([
      ['Model A', 0.92],
      ['Model B', 0.81],
      ['Model C', 0.75],
    ]);
    expect(b.models[0]).toMatchObject({ correct: 92, total: 100 });
    expect(b.baselines).toEqual([{ label: 'Frontier X', accuracy: 0.35, correct: null, total: null, note: '' }]);
    expect(b).toMatchObject({ asOf: '2026-11-20', method: 'Graded against the answer key.' });
  });

  it('is invalid without a scored model', () => {
    expect(parseBenchmark({ models: [{ label: 'x' }], baselines: [{ label: 'y', accuracy: 0.3 }] })).toBeNull();
    expect(parseBenchmark({ detail: 'Not Found' })).toBeNull();
    expect(parseBenchmark([])).toBeNull();
    expect(parseBenchmark({ models: [{ label: 'x', accuracy: 140 }] })).toBeNull();
  });
});

describe('the stats fallback', () => {
  it('is the 100-paper corpus, and its charts sum to it', () => {
    const f = PROTOTYPE_STATS_FALLBACK;
    expect(f.papers).toBe('100');
    expect(f.byYear.reduce((s, [, n]) => s + n, 0) + f.preChart + f.undated).toBe(100);
    expect(f.byClass.reduce((s, [, n]) => s + n, 0)).toBe(f.classified);
    expect(JSON.stringify(f)).not.toMatch(/3,900|7,400|72,000/);
  });
});
