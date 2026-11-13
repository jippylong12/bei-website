import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  downloadFile,
  fetchMaterials,
  fetchSpeakers,
  loadToken,
  saveToken,
  signIn,
  signOut,
} from './facultyApi';
import People from './People';
import styles from './Faculty.module.css';

// The faculty Portal, for faculty only. Faculty sign in with one password
// that BEI shares with all of them, and then have two tabs:
//
//   Course Materials  /faculty/portal               browse the folders, download files
//   Speakers          /faculty/portal?tab=speakers  the conference speakers: names,
//                                                  emails and details, no pictures
//
// Nothing confidential is in this site's code. The folder listing, every file
// and the speaker list come from the backend, and only for a signed-in visitor.
//
// Like the Faculty Affiliates page, it is built from the site's own parts: a
// one-line title row (not the tall Hero band), the gold button, and the
// bordered panel of rows the 2026 conference agenda uses (one row per entry).
//
// Steps: 'loading' (checking a saved sign-in) -> 'password' -> 'browse'.
// 'retry' is a saved sign-in that could not be checked because the backend
// was unreachable; it is kept so the visitor need not sign in again.
//
// Moving around should feel like one page, not a reload:
// - The tab is in the query, not the path, so changing tab is not a new page
//   to the site (App.jsx): no re-check of the sign-in, no page fade.
// - The speakers are fetched as soon as the Portal opens, so their tab shows
//   at once.
// - The page arrives as the site's other pages do: the title rises in, then
//   the button beside it, then the content. Content that changes (the other
//   tab, another folder) rises in the same way (.enter). Each part that
//   appears rises on its own, never inside another rising part, since the
//   two rises would add up (Faculty.module.css, "Moving between views").
// - "Loading…" lines appear only when a wait is long enough to notice
//   (.waiting).

const TABS = [
  { view: 'materials', to: '/faculty/portal', label: 'Course Materials' },
  { view: 'speakers', to: '/faculty/portal?tab=speakers', label: 'Speakers' },
];

const SIGNED_OUT = 'Your sign-in has ended. Please sign in again.';

// What to show for an answer from the speakers endpoint.
const toSpeakers = (res) =>
  res.ok ? { status: 'ready', people: res.speakers } : { status: 'error', message: res.message };

export default function Portal() {
  const [params] = useSearchParams();
  const tab = params.get('tab') === 'speakers' ? 'speakers' : 'materials';
  const [step, setStep] = useState(() => (loadToken() ? 'loading' : 'password'));
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { ok: boolean, text: string }
  const [tree, setTree] = useState(null);
  const [speakers, setSpeakers] = useState({ status: 'loading' }); // + people | message

  // For faculty only: keep it out of search results.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const endSession = useCallback((text) => {
    saveToken('');
    setTree(null);
    setSpeakers({ status: 'loading' });
    setNotice({ ok: false, text });
    setStep('password');
  }, []);

  // Fetch the speakers for the session `token`. An answer that arrives after
  // that session is over (signed out meanwhile) is dropped.
  const loadSpeakers = useCallback(
    async (token) => {
      setSpeakers({ status: 'loading' });
      const res = await fetchSpeakers(token);
      if (loadToken() !== token) return;
      if (res.status === 401) endSession(SIGNED_OUT);
      else setSpeakers(toSpeakers(res));
    },
    [endSession],
  );

  // What to show for an answer from the materials endpoint. Once the session
  // is good, the speakers are fetched too, ready for their tab.
  const applyMaterials = useCallback(
    (res) => {
      if (res.ok) {
        setTree(res.materials);
        setNotice(null);
        setStep('browse');
        loadSpeakers(loadToken());
      } else if (res.status === 401) {
        endSession(SIGNED_OUT);
      } else {
        setNotice({ ok: false, text: res.message });
        setStep('retry');
      }
    },
    [endSession, loadSpeakers],
  );

  // A saved sign-in from an earlier visit: check it and open the portal.
  useEffect(() => {
    const token = loadToken();
    if (token) fetchMaterials(token).then(applyMaterials);
  }, [applyMaterials]);

  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    setNotice(null);
    const res = await signIn(password);
    if (res.ok) {
      saveToken(res.token);
      setPassword('');
      applyMaterials(await fetchMaterials(res.token));
    } else {
      setNotice({ ok: false, text: res.message });
    }
    setBusy(false);
  };

  const retry = async () => {
    setBusy(true);
    applyMaterials(await fetchMaterials(loadToken()));
    setBusy(false);
  };

  const leave = async () => {
    const token = loadToken();
    saveToken('');
    setTree(null);
    setSpeakers({ status: 'loading' });
    setNotice({ ok: true, text: 'You are signed out.' });
    setStep('password');
    await signOut(token); // best effort: this browser has already forgotten the token
  };

  const download = async (path) => {
    const res = await downloadFile(loadToken(), path);
    if (res.status === 401) endSession(SIGNED_OUT);
    else setNotice(res.ok ? null : { ok: false, text: res.message });
  };

  const browsing = step === 'browse' && tree;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.pageHead}>
          <h1 className={`${styles.pageTitle} ${styles.rise}`}>Portal</h1>
          <Link to="/faculty" className={`${styles.outline} ${styles.riseNext}`}>
            Faculty Affiliates
          </Link>
        </div>

        {/* Always mounted: a live region that appears already filled is often
            not read out by screen readers. */}
        <p
          className={`${styles.notice} ${browsing ? styles.noticeWide : ''} ${
            notice ? (notice.ok ? styles.ok : styles.err) : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {notice?.text}
        </p>

        {step === 'loading' && (
          <div className={`${styles.panel} ${styles.waiting}`}>
            <p className={styles.text}>Checking your sign-in…</p>
          </div>
        )}

        {step === 'retry' && (
          <div className={`${styles.panel} ${styles.enter}`}>
            <button className={styles.cta} type="button" onClick={retry} disabled={busy}>
              {busy ? 'Trying…' : 'Try Again'}
            </button>
          </div>
        )}

        {step === 'password' && (
          <form className={`${styles.panel} ${styles.enter}`} onSubmit={submit}>
            <h2 className={styles.heading}>Faculty Sign-In</h2>
            <p className={styles.text}>
              Enter the faculty password that the Bitcoin Education Institute shared with you.
            </p>
            <label className={styles.label} htmlFor="faculty-password">
              Password
            </label>
            <input
              id="faculty-password"
              className={styles.input}
              type="password"
              required
              maxLength={256}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className={styles.cta} type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
            <p className={styles.note}>
              No password? Write to <a href="mailto:info@btcedu.org">info@btcedu.org</a>.
            </p>
          </form>
        )}

        {browsing && (
          <>
            {/* Rises in once, on sign-in; it stays put while the tabs change. */}
            <div className={`${styles.tabBar} ${styles.enter}`}>
              <nav className={styles.tabs} aria-label="Portal">
                {TABS.map(({ view, to, label }) => (
                  <Link
                    key={view}
                    to={to}
                    className={styles.tab}
                    aria-current={view === tab ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <p className={styles.signedIn}>
                Signed in.{' '}
                <button className={styles.linkButton} type="button" onClick={leave}>
                  Sign out
                </button>
              </p>
            </div>

            {/* Each tab's content rises in by itself as it opens. */}
            {tab === 'speakers' ? (
              <Speakers state={speakers} onRetry={() => loadSpeakers(loadToken())} />
            ) : (
              <Browser tree={tree} onDownload={download} />
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ---- The speakers ------------------------------------------------------------

function Speakers({ state, onRetry }) {
  if (state.status === 'error') {
    return (
      <div className={`${styles.problem} ${styles.enter}`} role="alert">
        <p>The speakers could not be loaded. {state.message}</p>
        <button className={styles.cta} type="button" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }
  if (state.status !== 'ready') {
    return (
      <p className={`${styles.text} ${styles.waiting}`} role="status">
        Loading the speakers…
      </p>
    );
  }
  return (
    <div className={styles.enter}>
      <People people={state.people} searchLabel="Search the speakers" />
    </div>
  );
}

// ---- The folder browser ----------------------------------------------------

// At the top level every entry is named "<person>_<course or topic>".
function splitOwner(name) {
  const cut = name.indexOf('_');
  return cut > 0 ? { owner: name.slice(0, cut), title: name.slice(cut + 1) } : { owner: name, title: '' };
}

const EXTENSION = /\.([A-Za-z0-9]{1,5})$/;
const fileType = (name) => (EXTENSION.exec(name)?.[1] || 'file').toUpperCase();
const withoutExtension = (name) => name.replace(EXTENSION, '');

// Decimal units (1 MB = 1,000,000 bytes), which is what "MB" means and what
// most file managers show.
function formatBytes(bytes) {
  const mb = bytes / 1e6;
  if (mb >= 10) return `${Math.round(mb)} MB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

const countFiles = (n) => `${n} ${n === 1 ? 'file' : 'files'}`;

// The folders from the top down to the one `path` names. A path that matches
// nothing (a stale link, or files that have moved) gives [], the top level.
function findTrail(tree, path) {
  const trail = [];
  let node = tree;
  while (path) {
    const next = node.folders.find((f) => path === f.path || path.startsWith(`${f.path}/`));
    if (!next) return [];
    trail.push(next);
    if (next.path === path) break;
    node = next;
  }
  return trail;
}

// Every file in the tree, each with the folder it is in (for search results).
function allFiles(node, folderName = '') {
  return [
    ...node.files.map((file) => ({ ...file, folderName })),
    ...node.folders.flatMap((folder) =>
      allFiles(folder, folderName ? `${folderName} / ${folder.name}` : folder.name.replace('_', ': ')),
    ),
  ];
}

function Browser({ tree, onDownload }) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(''); // the file whose download is being prepared
  const heading = useRef(null);
  const top = useRef(null); // the search box, the first thing in the tab
  const moved = useRef(false);

  // The open folder is in the address (?folder=...), so the browser's Back
  // button steps back out of a folder instead of leaving the page.
  const folderPath = params.get('folder') || '';
  const trail = useMemo(() => findTrail(tree, folderPath), [tree, folderPath]);
  const folder = trail.length ? trail[trail.length - 1] : tree;
  const atTop = trail.length === 0;

  const open = (path) => {
    moved.current = true;
    setQuery('');
    setParams(path ? { folder: path } : {});
  };

  // After opening a folder the button that was pressed is gone; put keyboard
  // focus on the new folder's heading so reading continues from there. A
  // folder opened from far down a long list leaves the page scrolled past
  // the new, shorter content: glide back to the top so the folder trail and
  // title are in view, rather than jumping.
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus({ preventScroll: true });
    const menuBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
    if (top.current && top.current.getBoundingClientRect().top < menuBottom) {
      const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
    }
  }, [folderPath]);

  const start = async (path) => {
    setPending(path);
    await onDownload(path);
    setPending('');
  };

  // null = not searching; otherwise the files whose path has every word typed.
  const found = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return null;
    return allFiles(tree).filter((file) => words.every((word) => file.path.toLowerCase().includes(word)));
  }, [tree, query]);

  // At the top level a person's folder and a person's single file sit in one
  // alphabetical list; inside a folder it is sub-folders, then files.
  const entries = atTop
    ? [...tree.folders.map((f) => ({ ...f, isFolder: true })), ...tree.files].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
      )
    : [...folder.folders.map((f) => ({ ...f, isFolder: true })), ...folder.files];

  const title = atTop ? 'All Materials' : trail.length === 1 ? splitOwner(folder.name).owner : folder.name;
  const subtitle = trail.length === 1 ? splitOwner(folder.name).title : '';

  return (
    <>
      {/* The search box rises in with the tab; only the folder below it
          rises in again when another folder opens. */}
      <div className={`${styles.toolbar} ${styles.enter}`} ref={top}>
        <input
          className={`${styles.input} ${styles.search}`}
          type="search"
          aria-label="Search the course materials"
          placeholder="Search all files"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div key={found ? 'search' : `folder:${folder.path || ''}`} className={styles.enter}>
        {found ? (
          <>
            <h2 className={styles.folderTitle}>Search Results</h2>
            <p className={styles.count} role="status">
              {countFiles(found.length)} found
            </p>
            {found.length === 0 ? (
              <p className={styles.empty}>
                No file name matches that.{' '}
                <button className={styles.linkButton} type="button" onClick={() => setQuery('')}>
                  Clear the search
                </button>
              </p>
            ) : (
              <ul className={styles.rows}>
                {found.map((file) => (
                  <FileRow
                    key={file.path}
                    file={file}
                    name={file.name}
                    detail={file.folderName}
                    pending={pending === file.path}
                    onDownload={start}
                  />
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            {!atTop && (
              <nav className={styles.crumbs} aria-label="Folder">
                <button className={styles.linkButton} type="button" onClick={() => open('')}>
                  All materials
                </button>
                {trail.slice(0, -1).map((crumb, depth) => (
                  <span key={crumb.path}>
                    <span aria-hidden="true"> / </span>
                    <button className={styles.linkButton} type="button" onClick={() => open(crumb.path)}>
                      {depth === 0 ? splitOwner(crumb.name).owner : crumb.name}
                    </button>
                  </span>
                ))}
              </nav>
            )}

            <h2 className={styles.folderTitle} ref={heading} tabIndex={-1}>
              {title}
            </h2>
            {subtitle && <p className={styles.folderSubtitle}>{subtitle}</p>}
            <p className={styles.count}>
              {atTop
                ? `${countFiles(tree.file_count)} from ${entries.length} contributors · ${formatBytes(tree.bytes)}`
                : `${countFiles(folder.file_count)} · ${formatBytes(folder.bytes)}`}
            </p>

            {entries.length === 0 && (
              <p className={styles.empty}>{atTop ? 'No course materials yet.' : 'This folder is empty.'}</p>
            )}

            {entries.length > 0 && (
              <ul className={styles.rows}>
                {entries.map((entry) => {
                  // At the top level each entry is "<person>_<course>": the
                  // person is the row's name and the course its second line.
                  const { owner, title } = atTop
                    ? splitOwner(entry.isFolder ? entry.name : withoutExtension(entry.name))
                    : { owner: entry.name, title: '' };
                  return entry.isFolder ? (
                    <li key={entry.path}>
                      <button className={`${styles.row} ${styles.rowButton}`} type="button" onClick={() => open(entry.path)}>
                        <FolderIcon />
                        <span className={styles.rowMain}>
                          <span className={styles.fileName}>{owner}</span>{' '}
                          {title && <span className={styles.rowDetail}>{title}</span>}
                        </span>{' '}
                        <span className={styles.rowMeta}>
                          {countFiles(entry.file_count)} · {formatBytes(entry.bytes)}
                        </span>
                        <span className={styles.chevron} aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </li>
                  ) : (
                    <FileRow
                      key={entry.path}
                      file={entry}
                      name={owner}
                      detail={title}
                      pending={pending === entry.path}
                      onDownload={start}
                    />
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}

function FileRow({ file, name, detail, pending, onDownload }) {
  return (
    <li className={styles.row}>
      <span className={styles.fileType} aria-hidden="true">
        {fileType(file.name)}
      </span>
      <span className={styles.rowMain}>
        <span className={styles.fileName}>{name}</span>{' '}
        {detail && <span className={styles.rowDetail}>{detail}</span>}
      </span>{' '}
      <span className={styles.rowMeta}>{formatBytes(file.bytes)}</span>
      <DownloadButton file={file} pending={pending} onDownload={onDownload} />
    </li>
  );
}

function DownloadButton({ file, pending, onDownload }) {
  return (
    <button
      className={`${styles.outline} ${styles.download}`}
      type="button"
      aria-label={`Download ${file.name}`}
      disabled={pending}
      onClick={() => onDownload(file.path)}
    >
      {pending ? 'Preparing…' : 'Download'}
    </button>
  );
}

function FolderIcon() {
  return (
    <svg className={styles.folderIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l2 2.5h8.4A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
    </svg>
  );
}
