// What the /prototype page reads from its API, made safe to draw. Each parse*
// function returns null for a payload it cannot use, and the page then leaves
// that part out (or keeps its fallback) instead of drawing something wrong.

export const PAPER_COUNT = 100;

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// ---- GET /api/health -> {model_label} --------------------------------------

export function parseHealth(data) {
  if (!data || typeof data !== 'object') return null;
  const label = str(data.model_label).slice(0, 80);
  return { modelLabel: label || null };
}

// ---- GET /api/papers -> [paper] or {papers: [paper]} ------------------------
// A paper is an entry of the index's papers.json: {paper_id, sha256, title,
// authors: [str], year, venue, doi, url, link_type, abstract, category,
// published, filename}.

function normalizePaper(p, i) {
  if (!p || typeof p !== 'object') return null;
  const title = str(p.title) || str(p.filename);
  if (!title) return null;
  const authors = Array.isArray(p.authors)
    ? p.authors.map(str).filter(Boolean)
    : str(p.authors).split(/\s*;\s*/).filter(Boolean);
  const doi = str(p.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  const url = str(p.url);
  return {
    id: str(p.paper_id) || str(p.sha256) || `paper-${i}`,
    title,
    authors,
    year: p.year == null ? '' : String(p.year).trim(),
    venue: str(p.venue),
    doi,
    url: /^https?:\/\//i.test(url) ? url : '',
    linkType: p.link_type === 'publication' ? 'publication' : 'search',
    category: str(p.category) || 'Uncategorized',
    published: p.published === true || p.published === 'yes',
    abstract: str(p.abstract),
  };
}

export function parsePapers(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.papers) ? data.papers : null;
  if (!list) return null;
  const papers = list.map(normalizePaper).filter(Boolean);
  return papers.length ? papers : null;
}

// "A. Author", "A. Author and B. Author", "A. Author, B. Author and C. Author",
// then "A. Author, B. Author, C. Author et al." past three.
export function authorLine(authors) {
  if (authors.length <= 1) return authors[0] || '';
  if (authors.length <= 3) return `${authors.slice(0, -1).join(', ')} and ${authors[authors.length - 1]}`;
  return `${authors.slice(0, 3).join(', ')} et al.`;
}

// ---- GET /api/benchmark ----------------------------------------------------
// benchmark.json from the bake-off report: {as_of, corpus, retrieval, method,
// models: [...], baselines: [...]}. models are the open-weight models
// answering from the corpus; baselines are frontier models answering from
// memory, without it. An entry needs a name and a score:
//   {label|name|model, accuracy (0..1, or a percentage), correct, total, note}
// or just {label, correct, total}.

function parseEntry(e) {
  if (!e || typeof e !== 'object') return null;
  const label = str(e.label) || str(e.name) || str(e.model);
  if (!label) return null;
  const correct = num(e.correct);
  const total = num(e.total);
  let accuracy = num(e.accuracy);
  if (accuracy == null && correct != null && total) accuracy = correct / total;
  if (accuracy == null) return null;
  if (accuracy > 1 && accuracy <= 100) accuracy /= 100;
  if (accuracy < 0 || accuracy > 1) return null;
  return {
    label,
    accuracy,
    correct: correct != null && total ? correct : null,
    total: correct != null && total ? total : null,
    note: str(e.note),
  };
}

const parseGroup = (list) =>
  (Array.isArray(list) ? list : [])
    .map(parseEntry)
    .filter(Boolean)
    .sort((a, b) => b.accuracy - a.accuracy);

export function parseBenchmark(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const models = parseGroup(data.models);
  if (!models.length) return null;
  return {
    asOf: str(data.as_of),
    corpus: str(data.corpus),
    retrieval: str(data.retrieval),
    method: str(data.method),
    models,
    baselines: parseGroup(data.baselines),
  };
}

// ---- The stats shown before GET /api/stats answers --------------------------
// Counted from the prototype corpus manifest (100 papers, 2026-11-19): papers
// by year of publication and by primary subject. No production figure is ever
// shown here; tiles the API does not send (researchers, venues, citations)
// stay out until it does.
export const PROTOTYPE_STATS_FALLBACK = {
  live: false,
  papers: String(PAPER_COUNT),
  papersApprox: String(PAPER_COUNT),
  researchers: null,
  venues: null,
  citations: null,
  byYear: [
    [2011, 1], [2012, 1], [2013, 6], [2014, 4], [2015, 11], [2016, 8], [2017, 7], [2018, 12],
    [2019, 9], [2020, 5], [2021, 8], [2022, 14], [2023, 5], [2024, 5], [2025, 1], [2026, 3],
  ],
  preChart: 0,
  earliestYear: 2011,
  undated: 0,
  asOf: null,
  byClass: [
    ['Mining, fees and the security budget', 22],
    ['Protocol, network and scaling', 22],
    ['Markets: price formation, efficiency and volatility', 22],
    ['Privacy, forensics and illicit use', 18],
    ['Money, adoption and policy', 16],
  ],
  classified: 100,
};
