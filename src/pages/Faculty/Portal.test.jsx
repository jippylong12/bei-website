// The Portal against a stubbed API: signing in with the shared password, the
// two tabs (Course Materials and Speakers), browsing the folders, downloading,
// and what happens when the backend refuses or cannot be reached. No network.
// Every person, password and file below is made up.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Portal from './Portal';
import { TOKEN_KEY, click, pageTitles, reply, stubApi, type } from './testHelpers';
import styles from './Faculty.module.css';

const MB = 1_000_000;
const COURSE = 'Ada Lovelace_Notes on the Engine';
const OTHER = 'Mary Somerville_Mechanism of the Heavens';

// Shaped like the real library: a folder per person, named person_course, one
// person whose material is a single file, and a sub-folder.
const TREE = {
  file_count: 5,
  bytes: 104_142_000,
  folders: [
    {
      name: COURSE,
      path: COURSE,
      file_count: 3,
      bytes: 16_502_000,
      folders: [
        {
          name: 'Handouts',
          path: `${COURSE}/Handouts`,
          file_count: 1,
          bytes: 2_000,
          folders: [],
          files: [{ name: 'Glossary.pdf', path: `${COURSE}/Handouts/Glossary.pdf`, bytes: 2_000 }],
        },
      ],
      files: [
        { name: 'Lecture 1.pptx', path: `${COURSE}/Lecture 1.pptx`, bytes: 15 * MB },
        { name: 'Syllabus.pdf', path: `${COURSE}/Syllabus.pdf`, bytes: 1_500_000 },
      ],
    },
    {
      name: OTHER,
      path: OTHER,
      file_count: 1,
      bytes: 640_000,
      folders: [],
      files: [{ name: 'Chapter 1.pdf', path: `${OTHER}/Chapter 1.pdf`, bytes: 640_000 }],
    },
  ],
  files: [{ name: 'Grace Hopper_Compilers.zip', path: 'Grace Hopper_Compilers.zip', bytes: 87 * MB }],
};

// As the backend sends them: no pictures. The second has blanks, as some real
// rows do.
const SPEAKERS = [
  {
    first_name: 'Charles',
    last_name: 'Babbage',
    email: 'charles@example.org',
    title: 'Inventor',
    affiliation: 'Example Engines',
    location: 'London',
    area: 'Developer',
    class_speaker: 'Agreed',
  },
  {
    first_name: 'Emmy',
    last_name: 'Noether',
    email: '',
    title: '',
    affiliation: '',
    location: '',
    area: 'Finance',
    class_speaker: '',
  },
];

const materials = (tree = TREE) => reply(200, { ok: true, materials: tree });
const speakers = (people = SPEAKERS) => reply(200, { ok: true, speakers: people });
const signedOut = () => reply(401, { ok: false, code: 'signed_out', message: 'Please sign in.' });

// The page under its real route, so the tab links work.
const show = (address = '/faculty/portal') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/faculty/portal" element={<Portal />} />
      </Routes>
    </MemoryRouter>,
  );

// The page's message line.
const notice = () => screen.getAllByRole('status')[0].textContent;

// Where the button beside the page title goes: back to the public directory,
// signed in or not.
const backToFaculty = () => screen.getByRole('link', { name: 'Faculty Affiliates' }).getAttribute('href');

// The open folder's heading, and the first line of each row beneath it.
const folderTitle = () => screen.getByRole('heading', { level: 2 }).textContent;
const rowNames = () =>
  within(screen.getByRole('list'))
    .getAllByRole('listitem')
    .map((li) => li.querySelector('[class*="owner"], [class*="fileName"]').textContent);

// Open the page already signed in.
async function openMaterials({ tree, address, routes = {} } = {}) {
  localStorage.setItem(TOKEN_KEY, 'tok-saved');
  const calls = stubApi({
    'GET /api/faculty/materials': materials(tree),
    'GET /api/faculty/speakers': speakers(),
    'POST /api/faculty/sign-out': reply(200, { ok: true }),
    ...routes,
  });
  show(address);
  await screen.findByRole('navigation', { name: 'Portal' });
  return calls;
}

// The tabs, with "*" on the one shown.
const tabs = () =>
  within(screen.getByRole('navigation', { name: 'Portal' }))
    .getAllByRole('link')
    .map((a) => `${a.textContent}${a.getAttribute('aria-current') === 'page' ? ' *' : ''}`);

const openTab = (name) => fireEvent.click(screen.getByRole('link', { name }));

async function signInWith(password) {
  type('Password', password);
  click('Sign In');
}

// Links the page "clicked" to start a download (jsdom cannot navigate).
let followed;

beforeEach(() => {
  localStorage.clear();
  followed = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function follow() {
    followed.push(this.getAttribute('href'));
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('signing in', () => {
  it('takes the shared password, then opens the course materials', async () => {
    const calls = stubApi({
      'POST /api/faculty/sign-in': reply(200, { ok: true, token: 'tok-1', expires_in: 2592000 }),
      'GET /api/faculty/materials': materials(),
      'GET /api/faculty/speakers': speakers(),
    });
    show();
    expect(pageTitles()).toEqual(['Portal']);
    expect(backToFaculty()).toBe('/faculty');
    expect(screen.getByRole('heading', { level: 2, name: 'Faculty Sign-In' })).toBeTruthy();
    const field = screen.getByLabelText('Password');
    expect([field.type, field.autocomplete]).toEqual(['password', 'current-password']);

    await signInWith('correct horse');

    await screen.findByRole('heading', { level: 2, name: 'All Materials' });
    expect(pageTitles()).toEqual(['Portal']);
    expect(backToFaculty()).toBe('/faculty');
    expect(screen.getByText(/Signed in\./)).toBeTruthy();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-1');
    expect(calls).toEqual([
      { route: 'POST /api/faculty/sign-in', authorization: undefined, body: { password: 'correct horse' } },
      { route: 'GET /api/faculty/materials', authorization: 'Bearer tok-1', body: undefined },
      // Fetched straight away, so the Speakers tab is ready when it is opened.
      { route: 'GET /api/faculty/speakers', authorization: 'Bearer tok-1', body: undefined },
    ]);
  });

  it('has no "confidential" notice over the materials', async () => {
    await openMaterials();

    expect(screen.queryByText(/confidential/i)).toBeNull();
    expect(screen.queryByText(/do not share/i)).toBeNull();
  });

  it('shows nothing of the Portal before sign-in', () => {
    const calls = stubApi({});
    show();

    expect(calls).toEqual([]); // nothing is even asked for without a session
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Portal' })).toBeNull();
    expect(screen.queryByText(/Signed in/)).toBeNull();
  });

  it('asks for the password on the Speakers address too', () => {
    stubApi({});
    show('/faculty/portal?tab=speakers');

    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('shows why a wrong password was refused, and keeps the form', async () => {
    stubApi({
      'POST /api/faculty/sign-in': reply(401, {
        ok: false,
        code: 'bad_password',
        message: 'That password is not right. Please check it and try again.',
      }),
    });
    show();

    await signInWith('wrong guess');

    await waitFor(() => expect(notice()).toBe('That password is not right. Please check it and try again.'));
    expect(screen.getByRole('heading', { name: 'Faculty Sign-In' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign In' }).disabled).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('shows the server message when sign-in is refused for too many tries', async () => {
    stubApi({
      'POST /api/faculty/sign-in': reply(429, {
        code: 'rate_limited',
        message: "You've hit the request limit — please try again later.",
      }),
    });
    show();

    await signInWith('correct horse');

    await waitFor(() => expect(notice()).toBe("You've hit the request limit — please try again later."));
  });

  it('reports a network failure instead of hanging', async () => {
    stubApi({});
    show();

    await signInWith('correct horse');

    await waitFor(() => expect(notice()).toMatch(/^Network error/));
    expect(screen.getByRole('button', { name: 'Sign In' }).disabled).toBe(false);
  });

  it('falls back to a plain message when an error has no readable body', async () => {
    stubApi({
      'POST /api/faculty/sign-in': () => Promise.resolve(new Response('<html>Bad Gateway</html>', { status: 502 })),
    });
    show();

    await signInWith('correct horse');

    await waitFor(() => expect(notice()).toBe('That did not work. Please try again.'));
  });
});

describe('a saved sign-in', () => {
  it('opens the materials straight away', async () => {
    const calls = await openMaterials();

    expect(calls[0].authorization).toBe('Bearer tok-saved');
    expect(screen.queryByLabelText('Password')).toBeNull();
  });

  it('is dropped when the server no longer accepts it', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok-saved');
    stubApi({ 'GET /api/faculty/materials': signedOut() });
    show();

    await screen.findByLabelText('Password');
    expect(notice()).toBe('Your sign-in has ended. Please sign in again.');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('is kept when the server cannot be reached, and can be retried', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok-saved');
    stubApi({});
    show();

    await screen.findByRole('button', { name: 'Try Again' });
    expect(notice()).toMatch(/^Network error/);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-saved');

    stubApi({ 'GET /api/faculty/materials': materials() });
    click('Try Again');

    await screen.findByRole('heading', { level: 2, name: 'All Materials' });
    expect(notice()).toBe('');
  });

  it('is forgotten on sign-out, and the server is told', async () => {
    const calls = await openMaterials();

    click('Sign out');

    await screen.findByLabelText('Password');
    expect(notice()).toBe('You are signed out.');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
    await waitFor(() =>
      expect(calls.at(-1)).toEqual({
        route: 'POST /api/faculty/sign-out',
        authorization: 'Bearer tok-saved',
        body: undefined,
      }),
    );
  });
});

describe('the tabs', () => {
  it('are Course Materials and Speakers, Course Materials first and shown', async () => {
    await openMaterials();

    expect(tabs()).toEqual(['Course Materials *', 'Speakers']);
    expect(screen.getByRole('link', { name: 'Course Materials' }).getAttribute('href')).toBe('/faculty/portal');
    expect(screen.getByRole('link', { name: 'Speakers' }).getAttribute('href')).toBe('/faculty/portal?tab=speakers');
  });

  it('Speakers lists the speakers as text: name, email and details, no pictures', async () => {
    const calls = await openMaterials();

    openTab('Speakers');

    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });
    expect(tabs()).toEqual(['Course Materials', 'Speakers *']);
    expect(calls.at(-1)).toEqual({
      route: 'GET /api/faculty/speakers',
      authorization: 'Bearer tok-saved',
      body: undefined,
    });
    expect(screen.getByText('2 people')).toBeTruthy();
    const charles = screen.getByRole('heading', { level: 2, name: 'Charles Babbage' }).closest('li');
    expect(within(charles).getByText('Example Engines')).toBeTruthy();
    expect(within(charles).getByText('Inventor')).toBeTruthy();
    expect(within(charles).getByText('London · Developer · Class speaker: Agreed')).toBeTruthy();
    const email = within(charles).getByRole('link', { name: 'charles@example.org' });
    expect(email.getAttribute('href')).toBe('mailto:charles@example.org');
    // No pictures, and no initials standing in for one.
    expect(charles.closest('ul').querySelectorAll('img')).toHaveLength(0);
    expect(screen.queryByText('CB')).toBeNull();
    // Emmy has only her name and area: no empty lines, no email link.
    const emmy = screen.getByRole('heading', { level: 2, name: 'Emmy Noether' }).closest('li');
    expect([...emmy.querySelectorAll('p')].map((p) => p.textContent)).toEqual(['Finance']);
    expect(within(emmy).queryByRole('link')).toBeNull();
  });

  it('Speakers can be searched and filtered by area', async () => {
    await openMaterials({ address: '/faculty/portal?tab=speakers' });
    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });

    type('Search the speakers', 'noether');
    expect(screen.getByText('1 of 2 people')).toBeTruthy();

    type('Search the speakers', '');
    click(/^Developer/);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Charles Babbage']);
  });

  it('opens on Speakers from its address', async () => {
    await openMaterials({ address: '/faculty/portal?tab=speakers' });

    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });
    expect(tabs()).toEqual(['Course Materials', 'Speakers *']);
  });

  it('change without signing in again or loading anything again', async () => {
    const calls = await openMaterials();

    openTab('Speakers');
    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });
    openTab('Course Materials');
    await screen.findByRole('heading', { level: 2, name: 'All Materials' });
    openTab('Speakers');

    // Shown at once: the list was already there.
    expect(screen.getByRole('heading', { level: 2, name: 'Charles Babbage' })).toBeTruthy();
    expect(calls.map((c) => c.route)).toEqual(['GET /api/faculty/materials', 'GET /api/faculty/speakers']);
    expect(screen.queryByText('Checking your sign-in…')).toBeNull();
  });

  it('keep the open folder out of the Speakers address', async () => {
    await openMaterials({ address: `/faculty/portal?folder=${encodeURIComponent(COURSE)}` });

    expect(screen.getByRole('link', { name: 'Speakers' }).getAttribute('href')).toBe('/faculty/portal?tab=speakers');
    openTab('Speakers');
    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });
    openTab('Course Materials');

    expect(folderTitle()).toBe('All Materials');
  });

  it('Speakers says why it could not load, and loads on Try Again', async () => {
    await openMaterials({
      address: '/faculty/portal?tab=speakers',
      routes: {
        'GET /api/faculty/speakers': reply(503, {
          code: 'unavailable',
          message: 'The faculty pages are briefly unavailable. Please try again in a few minutes.',
        }),
      },
    });

    const problem = await screen.findByRole('alert');
    expect(problem.textContent).toContain('The speakers could not be loaded.');
    expect(problem.textContent).toContain('briefly unavailable');

    stubApi({ 'GET /api/faculty/speakers': speakers() });
    click('Try Again');

    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('ask for a new sign-in when the speakers say the session ended', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok-saved');
    stubApi({ 'GET /api/faculty/materials': materials(), 'GET /api/faculty/speakers': signedOut() });
    show('/faculty/portal?tab=speakers');

    await screen.findByLabelText('Password');
    expect(notice()).toBe('Your sign-in has ended. Please sign in again.');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('drop a speakers answer that comes back after signing out', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok-saved');
    let answer;
    stubApi({
      'GET /api/faculty/materials': materials(),
      'POST /api/faculty/sign-out': reply(200, { ok: true }),
      'GET /api/faculty/speakers': () => new Promise((resolve) => (answer = resolve)),
    });
    show();
    await screen.findByRole('navigation', { name: 'Portal' });

    click('Sign out');
    await screen.findByLabelText('Password');
    await act(async () => {
      answer(new Response(JSON.stringify({ ok: false, code: 'signed_out', message: 'Please sign in.' }), { status: 401 }));
      await new Promise((settle) => setTimeout(settle, 20));
    });

    expect(notice()).toBe('You are signed out.');
  });
});

// As the backend sends them for the map: each with the lat and lon of its
// place. Two in Austin, one in Seattle, one in London (off the map of the
// United States) and one whose place is not known.
const AUSTIN = { location: 'Austin', lat: 30.2672, lon: -97.7431 };
const MAP_SPEAKERS = [
  {
    first_name: 'Ada',
    last_name: 'Lovelace',
    email: 'ada@example.org',
    title: 'Professor',
    affiliation: 'Example University',
    area: 'Developer',
    class_speaker: 'Agreed',
    ...AUSTIN,
  },
  {
    first_name: 'Grace',
    last_name: 'Hopper',
    email: '',
    title: 'Rear Admiral',
    affiliation: '',
    area: 'Mining',
    class_speaker: '',
    ...AUSTIN,
  },
  {
    first_name: 'Mary',
    last_name: 'Somerville',
    email: 'mary@example.org',
    title: 'Astronomer',
    affiliation: 'Example Observatory',
    area: 'Mining',
    class_speaker: '',
    location: 'Seattle',
    lat: 47.6062,
    lon: -122.3321,
  },
  { ...SPEAKERS[0], lat: 51.5074, lon: -0.1278 }, // Charles Babbage, London
  { ...SPEAKERS[1], lat: null, lon: null }, // Emmy Noether, no place
];

describe('the speakers map', () => {
  // Open the Speakers tab in the given view with MAP_SPEAKERS; for the map,
  // wait until it is drawn, state outlines and all.
  async function openSpeakers(view = 'map') {
    const calls = await openMaterials({
      address: `/faculty/portal?tab=speakers${view === 'map' ? '&view=map' : ''}`,
      routes: { 'GET /api/faculty/speakers': speakers(MAP_SPEAKERS) },
    });
    if (view === 'map') {
      await screen.findByRole('img', { name: /^Map of the United States/ }, { timeout: 5000 });
      await waitFor(() => expect(document.querySelector(`.${styles.nation}`)).toBeTruthy());
    } else {
      await screen.findByRole('heading', { level: 2, name: 'Ada Lovelace' });
    }
    return calls;
  }

  const views = () =>
    within(screen.getByRole('navigation', { name: 'Show the speakers' }))
      .getAllByRole('link')
      .map((a) => `${a.textContent}${a.getAttribute('aria-current') === 'page' ? ' *' : ''}`);
  const panelHeading = () => screen.getByRole('heading', { level: 2 }).textContent;
  // The panel's places, by what each button says ("Austin 2") and what it is
  // called for a screen reader ("Austin: 2 speakers").
  const placeButtons = () =>
    within(screen.getAllByRole('list').at(-1))
      .getAllByRole('button')
      .map((b) => `${b.textContent} | ${b.getAttribute('aria-label')}`);
  const pins = () => [...document.querySelectorAll('[data-places]')];
  const pinNames = () => pins().map((pin) => `${pin.dataset.places} ${pin.querySelector('text').textContent}`);
  const names = (level = 3) => screen.getAllByRole('heading', { level }).map((h) => h.textContent);

  it('is the second view of the speakers, beside the list', async () => {
    await openSpeakers('list');

    expect(views()).toEqual(['List *', 'Map']);
    expect(screen.getByRole('link', { name: 'Map' }).getAttribute('href')).toBe('/faculty/portal?tab=speakers&view=map');
    openTab('Map');

    await screen.findByRole('img', { name: /^Map of the United States/ }, { timeout: 5000 });
    expect(views()).toEqual(['List', 'Map *']);
    expect(tabs()).toEqual(['Course Materials', 'Speakers *']);
    await waitFor(() => expect(document.querySelector(`.${styles.nation}`)).toBeTruthy());
  });

  it('has a pin for each place in the United States and lists every place beside it', async () => {
    await openSpeakers();

    expect(pinNames()).toEqual(['Austin 2', 'Seattle 1']);
    expect(panelHeading()).toBe('3 places');
    // Most speakers first, the speakers with no known place last.
    expect(placeButtons()).toEqual([
      'Austin 2 | Austin: 2 speakers',
      'London 1 | London: 1 speaker',
      'Seattle 1 | Seattle: 1 speaker',
      'Place not known 1 | Place not known: 1 speaker',
    ]);
    // London and the unknown place are not on the map; the note says so.
    const note = document.querySelector('figcaption');
    expect(note.textContent).toBe('Not on the map: London (1) · Place not known (1)');
  });

  it('lists the speakers of a place chosen in the panel, and goes back to every place', async () => {
    await openSpeakers();

    click('Austin: 2 speakers');

    expect(panelHeading()).toBe('Austin');
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2 }));
    expect(screen.getByText('2 speakers')).toBeTruthy();
    expect(names()).toEqual(['Ada Lovelace', 'Grace Hopper']);
    const ada = screen.getByRole('heading', { level: 3, name: 'Ada Lovelace' }).closest('li');
    expect([...ada.querySelectorAll('p')].map((p) => p.textContent)).toEqual([
      'Professor, Example University',
      'Developer · Class speaker: Agreed',
    ]);
    expect(within(ada).getByRole('link', { name: 'ada@example.org' }).getAttribute('href')).toBe('mailto:ada@example.org');
    // Grace has no email and no organisation: no link, no stray comma.
    const grace = screen.getByRole('heading', { level: 3, name: 'Grace Hopper' }).closest('li');
    expect(within(grace).queryByRole('link')).toBeNull();
    expect(within(grace).getByText('Rear Admiral')).toBeTruthy();
    // Its pin is marked, with its name beside it.
    const austin = pins().find((pin) => pin.dataset.places === 'Austin');
    expect(austin.getAttribute('class')).toContain(styles.pinOpen);
    expect(document.querySelector(`.${styles.pinLabel}`).textContent).toBe('Austin');

    click('All places');

    expect(panelHeading()).toBe('3 places');
    expect(austin.getAttribute('class')).not.toContain(styles.pinOpen);
    expect(document.querySelector(`.${styles.pinLabel}`)).toBeNull();
  });

  it('opens a place from its pin, and a place off the map from the note', async () => {
    await openSpeakers();

    fireEvent.click(pins().find((pin) => pin.dataset.places === 'Seattle'));
    expect(panelHeading()).toBe('Seattle');
    expect(names()).toEqual(['Mary Somerville']);

    click('All places');
    click('London');
    expect(panelHeading()).toBe('London');
    expect(names()).toEqual(['Charles Babbage']);

    click('All places');
    click('Place not known');
    expect(panelHeading()).toBe('Place not known');
    expect(names()).toEqual(['Emmy Noether']);
  });

  it('shows only what the search and area filter leave, and keeps them when the view changes', async () => {
    await openSpeakers();

    type('Search the speakers', 'hopper');
    expect(pinNames()).toEqual(['Austin 1']);
    expect(placeButtons()).toEqual(['Austin 1 | Austin: 1 speaker']);
    expect(panelHeading()).toBe('1 place');

    type('Search the speakers', '');
    click(/^Mining/);
    expect(placeButtons()).toEqual(['Austin 1 | Austin: 1 speaker', 'Seattle 1 | Seattle: 1 speaker']);
    click(/^All/);

    type('Search the speakers', 'lovelace');
    openTab('List');
    expect(screen.getByRole('searchbox', { name: 'Search the speakers' }).value).toBe('lovelace');
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Ada Lovelace']);
  });

  it('goes back to every place when the search leaves out the place that was open', async () => {
    await openSpeakers();
    click('London: 1 speaker');
    expect(panelHeading()).toBe('London');

    type('Search the speakers', 'lovelace');

    expect(panelHeading()).toBe('1 place');
    expect(placeButtons()).toEqual(['Austin 1 | Austin: 1 speaker']);
  });

  it('says so when nobody matches, as the list does', async () => {
    await openSpeakers();

    type('Search the speakers', 'nobody-by-this-name');

    expect(screen.getByText(/Nobody matches that/)).toBeTruthy();
    expect(screen.queryByRole('img', { name: /^Map of the United States/ })).toBeNull();
  });

  it('keeps the search in place and rises only the map in, never one part inside another', async () => {
    await openSpeakers('list');
    const search = screen.getByRole('searchbox', { name: 'Search the speakers' });

    openTab('Map');
    await screen.findByRole('img', { name: /^Map of the United States/ }, { timeout: 5000 });
    await waitFor(() => expect(document.querySelector(`.${styles.nation}`)).toBeTruthy());

    expect(screen.getByRole('searchbox', { name: 'Search the speakers' })).toBe(search);
    expect(document.querySelectorAll(`.${styles.enter} .${styles.enter}`)).toHaveLength(0);
    expect(document.querySelector(`.${styles.mapView}`).closest(`.${styles.enter}`)).toBeTruthy();
  });

  it('leaves the map when the Speakers tab is chosen again', async () => {
    await openSpeakers();

    openTab('Speakers');

    expect(views()).toEqual(['List *', 'Map']);
    await screen.findByRole('heading', { level: 2, name: 'Ada Lovelace' });
  });
});

describe('browsing', () => {
  it('shows a card per contributor at the top level, folders and single files together', async () => {
    await openMaterials();

    expect(folderTitle()).toBe('All Materials');
    expect(screen.getByText('5 files from 3 contributors · 104 MB')).toBeTruthy();
    expect(rowNames()).toEqual(['Ada Lovelace', 'Grace Hopper', 'Mary Somerville']);

    // A folder's whole card is one button; its name says what is inside.
    expect(screen.getByRole('button', { name: 'Ada Lovelace Notes on the Engine 3 files · 17 MB' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^Mary Somerville .* 1 file · 640 KB/ })).toBeTruthy();
    // A single file can be downloaded right there.
    const zip = screen.getByRole('button', { name: 'Download Grace Hopper_Compilers.zip' }).closest('li');
    expect(zip.textContent).toContain('ZIP');
    expect(zip.textContent).toContain('Compilers');
    expect(zip.textContent).toContain('87 MB');
  });

  it('opens a folder: sub-folders first, then files, with sizes', async () => {
    await openMaterials();

    click(/^Ada Lovelace/);

    expect(folderTitle()).toBe('Ada Lovelace');
    expect(screen.getByText('Notes on the Engine')).toBeTruthy();
    expect(screen.getByText('3 files · 17 MB')).toBeTruthy();
    expect(rowNames()).toEqual(['Handouts', 'Lecture 1.pptx', 'Syllabus.pdf']);
    expect(screen.getByRole('button', { name: 'Download Syllabus.pdf' }).closest('li').textContent).toContain('1.5 MB');
    // Keyboard focus follows into the folder that was opened.
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2 }));
  });

  it('steps back out through the folder trail', async () => {
    await openMaterials();
    click(/^Ada Lovelace/);
    click(/^Handouts/);

    expect(folderTitle()).toBe('Handouts');
    expect(rowNames()).toEqual(['Glossary.pdf']);
    expect(screen.getByText('1 file · 2 KB')).toBeTruthy();
    const trail = within(screen.getByRole('navigation', { name: 'Folder' }));
    expect(trail.getAllByRole('button').map((b) => b.textContent)).toEqual(['All materials', 'Ada Lovelace']);

    click('Ada Lovelace');
    expect(folderTitle()).toBe('Ada Lovelace');

    click('All materials');
    expect(folderTitle()).toBe('All Materials');
    expect(screen.queryByRole('navigation', { name: 'Folder' })).toBeNull();
  });

  it('opens the folder named in the address', async () => {
    await openMaterials({ address: `/faculty/portal?folder=${encodeURIComponent(`${COURSE}/Handouts`)}` });

    expect(folderTitle()).toBe('Handouts');
  });

  it('opens the top level when the address names a folder that is gone', async () => {
    await openMaterials({ address: '/faculty/portal?folder=Nobody_Nothing' });

    expect(folderTitle()).toBe('All Materials');
    expect(rowNames()).toHaveLength(3);
  });

  it('says so when there are no materials yet', async () => {
    await openMaterials({ tree: { file_count: 0, bytes: 0, folders: [], files: [] } });

    expect(screen.getByText('No course materials yet.')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });
});

describe('searching', () => {
  it('finds files in every folder and says where each one is', async () => {
    await openMaterials();

    type('Search the course materials', 'PDF');

    expect(folderTitle()).toBe('Search Results');
    expect(screen.getByText('3 files found')).toBeTruthy();
    expect(rowNames()).toEqual(['Syllabus.pdf', 'Glossary.pdf', 'Chapter 1.pdf']);
    const glossary = screen.getByRole('button', { name: 'Download Glossary.pdf' }).closest('li');
    expect(glossary.textContent).toContain('Ada Lovelace: Notes on the Engine / Handouts');
  });

  it('matches a person as well as a file name, every word', async () => {
    await openMaterials();

    type('Search the course materials', 'lovelace lecture');

    expect(rowNames()).toEqual(['Lecture 1.pptx']);
    expect(screen.getByText('1 file found')).toBeTruthy();
  });

  it('says so when nothing matches, and clears', async () => {
    await openMaterials();

    type('Search the course materials', 'zzzz');
    expect(screen.getByText(/No file name matches that/)).toBeTruthy();

    click('Clear the search');

    expect(folderTitle()).toBe('All Materials');
  });
});

describe('downloading', () => {
  it('asks for a download link for that file and follows it', async () => {
    const calls = await openMaterials({
      routes: {
        'POST /api/faculty/materials/link': reply(200, {
          ok: true,
          url: '/api/faculty/materials/download?ticket=t-1',
        }),
      },
    });
    click(/^Ada Lovelace/);

    click('Download Syllabus.pdf');

    await waitFor(() => expect(followed).toEqual(['/api/faculty/materials/download?ticket=t-1']));
    expect(calls.at(-1)).toEqual({
      route: 'POST /api/faculty/materials/link',
      authorization: 'Bearer tok-saved',
      body: { path: `${COURSE}/Syllabus.pdf` },
    });
    expect(notice()).toBe('');
    expect(folderTitle()).toBe('Ada Lovelace'); // still where they were
  });

  it('downloads a single file straight from the top level', async () => {
    const calls = await openMaterials({
      routes: {
        'POST /api/faculty/materials/link': reply(200, { ok: true, url: '/api/faculty/materials/download?ticket=t-2' }),
      },
    });

    click('Download Grace Hopper_Compilers.zip');

    await waitFor(() => expect(followed).toHaveLength(1));
    expect(calls.at(-1).body).toEqual({ path: 'Grace Hopper_Compilers.zip' });
  });

  it('shows why a download was refused and follows no link', async () => {
    await openMaterials({
      routes: {
        'POST /api/faculty/materials/link': reply(429, {
          code: 'download_limit',
          message: "You have reached today's download limit. Please try again tomorrow.",
        }),
      },
    });

    click('Download Grace Hopper_Compilers.zip');

    await waitFor(() => expect(notice()).toBe("You have reached today's download limit. Please try again tomorrow."));
    expect(followed).toEqual([]);
    expect(folderTitle()).toBe('All Materials');
  });

  it('asks for a new sign-in when the session ended meanwhile', async () => {
    await openMaterials({
      routes: {
        'POST /api/faculty/materials/link': signedOut(),
      },
    });

    click('Download Grace Hopper_Compilers.zip');

    await screen.findByLabelText('Password');
    expect(notice()).toBe('Your sign-in has ended. Please sign in again.');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(followed).toEqual([]);
  });
});

describe('moving around', () => {
  // Each part that appears rises in by itself (Faculty.module.css, "Moving
  // between views"); one inside another would rise twice as far.
  const rising = () => document.querySelectorAll(`.${styles.enter}`).length;
  const stacked = () => document.querySelectorAll(`.${styles.enter} .${styles.enter}`).length;

  it('rises each part in by itself, never one inside another', async () => {
    await openMaterials();
    expect(rising()).toBeGreaterThan(0);
    expect(stacked()).toBe(0);

    click(/^Ada Lovelace/);
    expect(stacked()).toBe(0);

    openTab('Speakers');
    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });
    expect(stacked()).toBe(0);

    click('Sign out');
    await screen.findByLabelText('Password');
    expect(rising()).toBeGreaterThan(0);
    expect(stacked()).toBe(0);
  });

  it('leaves the tab bar and the search box in place; only what changed rises in again', async () => {
    await openMaterials();
    const tabBar = screen.getByRole('navigation', { name: 'Portal' }).parentElement;
    const search = screen.getByRole('searchbox', { name: 'Search the course materials' });

    click(/^Ada Lovelace/);
    // The same elements, not new ones: they do not rise in a second time.
    expect(screen.getByRole('searchbox', { name: 'Search the course materials' })).toBe(search);

    openTab('Speakers');
    await screen.findByRole('heading', { level: 2, name: 'Charles Babbage' });
    expect(screen.getByRole('navigation', { name: 'Portal' }).parentElement).toBe(tabBar);
  });
});

describe('search engines', () => {
  it('are told not to index the page while it is open', () => {
    stubApi({});
    const { unmount } = show();
    expect(document.head.querySelector('meta[name="robots"]')?.content).toBe('noindex, nofollow');

    unmount();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });
});
