// The corpus figures and charts (useCorpusStats.fromApi, CorpusStats,
// ClassChart) at both scales: /BitResearch's thousands of papers, unchanged,
// and a corpus of a hundred. No network.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import CorpusStats from './CorpusStats';
import { FALLBACK, fromApi } from './useCorpusStats';
import { PROTOTYPE_STATS_FALLBACK } from '../Prototype/prototypeData';

afterEach(cleanup);

const SMALL = {
  papers: 100,
  researchers: 268,
  by_year: { 2001: 1, 2009: 2, 2011: 1, 2013: 2, 2014: 3, 2023: 14, 2026: 3 },
  by_class: [['Protocol', 14], ['Markets and Asset Pricing', 18], ['Mining and Energy', 6]],
};

const tickLabels = () =>
  [...document.querySelectorAll('svg text')].map((t) => t.textContent).filter((t) => /^\d{1,3}$/.test(t));

describe('fromApi', () => {
  it('charts every year from the first to the last, with zeros in the gaps', () => {
    const stats = fromApi(SMALL, PROTOTYPE_STATS_FALLBACK);
    const years = stats.byYear.map(([y]) => y);
    expect(years[0]).toBe(2009);
    expect(years.at(-1)).toBe(2026);
    expect(years).toHaveLength(2026 - 2009 + 1);
    expect(stats.byYear.find(([y]) => y === 2010)).toEqual([2010, 0]);
    expect(stats.byYear.find(([y]) => y === 2023)).toEqual([2023, 14]);
    expect(stats.preChart).toBe(1);
    expect(stats.earliestYear).toBe(2001);
    expect(stats.undated).toBe(100 - 26);
  });

  it('fills a figure the API lacks from the given fallback, never from production', () => {
    const stats = fromApi(SMALL, PROTOTYPE_STATS_FALLBACK);
    expect(stats.researchers).toBe('268');
    expect(stats.venues).toBeNull();
    expect(stats.citations).toBeNull();
    const noClasses = fromApi({ papers: 100, by_year: { 2020: 100 } }, PROTOTYPE_STATS_FALLBACK);
    expect(noClasses.byClass).toBe(PROTOTYPE_STATS_FALLBACK.byClass);
  });

  it('keeps /BitResearch\'s fallback when called as before', () => {
    const stats = fromApi({ papers: 4000, by_year: { 2020: 300 } });
    expect(stats.venues).toBe(FALLBACK.venues);
    expect(stats.byClass).toBe(FALLBACK.byClass);
  });
});

describe('CorpusStats at the scale of a hundred papers', () => {
  it('shows no production figure in the prototype fallback', () => {
    const { container } = render(<CorpusStats stats={PROTOTYPE_STATS_FALLBACK} noteUndated />);
    expect(container.textContent).not.toMatch(/3,900|7,400|72,000|~1,000/);
    expect(screen.getByText('100')).toBeTruthy();
    // Tiles with no value are left out, not drawn empty.
    expect(screen.getAllByText(/academic papers|researchers|journals|citations to/).map((e) => e.textContent)).toEqual([
      'academic papers',
    ]);
  });

  it('draws gridlines that suit a peak of 14 papers a year', () => {
    render(<CorpusStats stats={fromApi(SMALL, PROTOTYPE_STATS_FALLBACK)} />);
    expect(tickLabels().slice(0, 4)).toEqual(['0', '5', '10', '15']);
  });

  it('words the footnote for one earlier paper and for undated papers', () => {
    render(<CorpusStats stats={fromApi(SMALL, PROTOTYPE_STATS_FALLBACK)} noteUndated />);
    const note = document.body.textContent;
    expect(note).toContain('Plus 1 earlier work from 2001.');
    expect(note).toContain('74 papers have no recorded year and are not charted.');
  });

  it('titles a chart of every subject plainly', () => {
    render(<CorpusStats stats={fromApi(SMALL, PROTOTYPE_STATS_FALLBACK)} />);
    expect(screen.getByText('Papers by primary subject')).toBeTruthy();
    expect(screen.queryByText('The ten largest subject classes')).toBeNull();
  });
});

describe('CorpusStats for /BitResearch (unchanged)', () => {
  it('keeps its four tiles, its 250-paper gridlines, its footnote and its chart title', () => {
    render(<CorpusStats stats={FALLBACK} />);
    expect(screen.getByText('3,900+')).toBeTruthy();
    expect(screen.getByText('citations to these papers')).toBeTruthy();
    expect(tickLabels().slice(0, 3)).toEqual(['0', '250', '500']);
    expect(document.body.textContent).toContain('Plus 215 earlier foundational works dating back to 1938.');
    expect(screen.getByText('The ten largest subject classes')).toBeTruthy();
  });
});
