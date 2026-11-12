// The public faculty directory against a stubbed API. No network. Every
// person below is made up.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Faculty from './Faculty';
import { TOKEN_KEY, click, pageTitles, reply, stubApi, type } from './testHelpers';

// The second person has blanks and no pictures, as some real rows do.
const PEOPLE = [
  {
    first_name: 'Ada',
    last_name: 'Lovelace',
    title: 'Professor of Mathematics',
    affiliation: 'Example University',
    area: 'Developer',
    headshot: 'ada-lovelace.webp',
    logo: 'example-university.png',
  },
  { first_name: 'Grace', last_name: 'Hopper', title: '', affiliation: '', area: '', headshot: '', logo: '' },
  {
    first_name: 'Alan',
    last_name: 'Turing',
    title: 'Fellow',
    affiliation: 'Example College',
    area: 'Developer',
    headshot: 'alan-turing.webp',
    logo: '',
  },
  {
    first_name: 'Mary',
    last_name: 'Somerville',
    title: 'Author',
    affiliation: 'Example Press',
    area: 'Policy',
    headshot: 'mary-somerville.webp',
    logo: '',
  },
];

const directory = (people = PEOPLE) => reply(200, { ok: true, faculty: people });

const show = () =>
  render(
    <MemoryRouter initialEntries={['/faculty']}>
      <Faculty />
    </MemoryRouter>,
  );

async function openDirectory(people) {
  const calls = stubApi({ 'GET /api/faculty/directory': directory(people) });
  show();
  await screen.findByRole('list');
  return calls;
}

// The names on the rows, in order.
const shownNames = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
const card = (name) => screen.getByRole('heading', { level: 2, name }).closest('li');

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('the directory', () => {
  it('is public: it loads without a sign-in and shows a card per person', async () => {
    const calls = await openDirectory();

    expect(calls).toEqual([{ route: 'GET /api/faculty/directory', authorization: undefined, body: undefined }]);
    expect(pageTitles()).toEqual(['Faculty Affiliates']);
    expect(shownNames()).toEqual(['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Mary Somerville']);
    expect(screen.getByText('4 people')).toBeTruthy();

    const ada = within(card('Ada Lovelace'));
    expect(ada.getByText('Professor of Mathematics')).toBeTruthy();
    expect(ada.getByText('Example University')).toBeTruthy();
  });

  it('shows each headshot with the organisation logo set into it', async () => {
    await openDirectory();

    const [headshot, logo] = card('Ada Lovelace').querySelectorAll('img');
    expect(headshot.getAttribute('src')).toBe('/api/faculty/images/headshots/ada-lovelace.webp');
    expect(logo.getAttribute('src')).toBe('/api/faculty/images/logos/example-university.png');
    // Decorative: the name and organisation are in text beside them.
    expect([headshot.alt, logo.alt]).toEqual(['', '']);

    expect(card('Alan Turing').querySelectorAll('img')).toHaveLength(1); // no logo on file
  });

  it('fades each picture in once it has loaded', async () => {
    await openDirectory();
    const [headshot, logo] = card('Ada Lovelace').querySelectorAll('img');
    expect(headshot.className).not.toMatch(/pictureShown/);

    fireEvent.load(headshot);

    expect(headshot.className).toMatch(/pictureShown/);
    expect(logo.className).not.toMatch(/pictureShown/);
  });

  it('shows initials for a person with no headshot, and no empty lines', async () => {
    await openDirectory();

    const grace = card('Grace Hopper');
    expect(grace.querySelector('img')).toBeNull();
    expect(within(grace).getByText('GH').getAttribute('aria-hidden')).toBe('true');
    expect(grace.querySelectorAll('p')).toHaveLength(0); // no title or organisation on file
  });

  it('falls back to initials when a headshot fails to load, and drops a logo that fails', async () => {
    await openDirectory();
    const [headshot, logo] = card('Ada Lovelace').querySelectorAll('img');

    fireEvent.error(headshot);
    fireEvent.error(logo);

    expect(card('Ada Lovelace').querySelector('img')).toBeNull();
    expect(within(card('Ada Lovelace')).getByText('AL')).toBeTruthy();
  });

  it('searches names, titles and organisations, every word', async () => {
    await openDirectory();
    const search = (words) => type('Search the faculty', words);

    search('hopper');
    expect(shownNames()).toEqual(['Grace Hopper']);
    expect(screen.getByText('1 of 4 people')).toBeTruthy();

    search('EXAMPLE');
    expect(shownNames()).toEqual(['Ada Lovelace', 'Alan Turing', 'Mary Somerville']);

    search('example fellow');
    expect(shownNames()).toEqual(['Alan Turing']);

    search('');
    expect(screen.getByText('4 people')).toBeTruthy();
  });

  it('shows one area at a time, with a head count on each button', async () => {
    await openDirectory();
    const pressed = () =>
      within(screen.getByRole('group', { name: 'Show one area' }))
        .getAllByRole('button')
        .map((b) => `${b.textContent}${b.getAttribute('aria-pressed') === 'true' ? ' *' : ''}`);
    expect(pressed()).toEqual(['All 4 *', 'Developer 2', 'Policy 1']);

    click(/^Developer/);
    expect(shownNames()).toEqual(['Ada Lovelace', 'Alan Turing']);
    expect(pressed()).toEqual(['All 4', 'Developer 2 *', 'Policy 1']);

    type('Search the faculty', 'college');
    expect(shownNames()).toEqual(['Alan Turing']);

    click(/^All/);
    expect(shownNames()).toEqual(['Alan Turing']);
  });

  it('has no area buttons when nobody on the list has an area', async () => {
    await openDirectory(PEOPLE.map((person) => ({ ...person, area: '' })));

    expect(screen.queryByRole('group', { name: 'Show one area' })).toBeNull();
    expect(shownNames()).toHaveLength(4);
    expect(screen.getByLabelText('Search the faculty')).toBeTruthy();
  });

  it('says so when nobody matches, and offers everyone back', async () => {
    await openDirectory();

    click(/^Policy/);
    type('Search the faculty', 'college');

    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByText(/Nobody matches that/)).toBeTruthy();
    expect(screen.getByText('0 of 4 people')).toBeTruthy();

    click('Show everyone');

    expect(shownNames()).toHaveLength(4);
    expect(screen.getByLabelText('Search the faculty').value).toBe('');
  });

  it('says "1 person" for a directory of one', async () => {
    await openDirectory(PEOPLE.slice(0, 1));

    expect(screen.getByText('1 person')).toBeTruthy();
  });
});

describe('when the directory cannot be loaded', () => {
  it('says why and loads on Try again', async () => {
    stubApi({
      'GET /api/faculty/directory': reply(503, {
        code: 'unavailable',
        message: 'The faculty pages are briefly unavailable. Please try again in a few minutes.',
      }),
    });
    show();

    const problem = await screen.findByRole('alert');
    expect(problem.textContent).toContain('The faculty pages are briefly unavailable.');
    expect(screen.queryByRole('list')).toBeNull();

    stubApi({ 'GET /api/faculty/directory': directory() });
    click('Try Again');

    await screen.findByRole('list');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('reports a network failure instead of hanging', async () => {
    stubApi({});
    show();

    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Network error/));
  });
});

describe('the way to the Portal', () => {
  it('is a button beside the page title, marked as needing a sign-in', async () => {
    await openDirectory();

    const link = screen.getByRole('link', { name: 'Portal (sign-in needed)' });
    expect(link.getAttribute('href')).toBe('/faculty/portal');
  });

  it('loses the padlock for someone already signed in', async () => {
    localStorage.setItem(TOKEN_KEY, 'tok-saved');
    await openDirectory();

    expect(screen.getByRole('link', { name: 'Portal' }).getAttribute('href')).toBe('/faculty/portal');
  });
});

describe('search engines', () => {
  it('may index the directory: it is a public page', async () => {
    await openDirectory();

    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });
});
