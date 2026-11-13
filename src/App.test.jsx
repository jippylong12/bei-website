// How the site moves from page to page (App.jsx): one mount and one fade per
// new page, nothing for a change of query. And the menu it shows. No network.
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';

// jsdom has no IntersectionObserver, which the footer's motion may use.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

let mounts;

function Page({ name, to }) {
  useEffect(() => {
    mounts.push(name);
  }, [name]);
  return (
    <>
      <h1>{name}</h1>
      <Link to={to}>next</Link>
    </>
  );
}

const show = () =>
  render(
    <MemoryRouter initialEntries={['/first']}>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="first" element={<Page name="First" to="/second" />} />
          <Route path="second" element={<Page name="Second" to="/second?tab=other" />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

const pageTitles = () => screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent);

beforeEach(() => {
  mounts = [];
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('moving between pages', () => {
  it('replaces the old page with the new one, mounted once', () => {
    show();

    fireEvent.click(screen.getByRole('link', { name: 'next' }));

    // The old page is gone at once (no exit fade that would show the new
    // page inside the old one), and the new one mounted a single time.
    expect(pageTitles()).toEqual(['Second']);
    expect(mounts).toEqual(['First', 'Second']);
  });

  it('starts a new page at the top', () => {
    show();
    window.scrollTo.mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'next' }));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('treats a change of query as the same page: no remount, no scroll', () => {
    show();
    fireEvent.click(screen.getByRole('link', { name: 'next' }));
    window.scrollTo.mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'next' })); // -> /second?tab=other

    expect(mounts).toEqual(['First', 'Second']);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

describe('the menu', () => {
  it('lists the site pages, without About (taken off on 2026-11-13)', () => {
    show();

    const menu = screen.getAllByRole('navigation')[0];
    expect(within(menu).getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Home',
      'What We Do',
      'Faculty',
      'Donate',
      'Contact',
      'Conference',
      'Map',
    ]);
  });
});
