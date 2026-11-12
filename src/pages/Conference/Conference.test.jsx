// The one Conference page: 2027 by default, 2026 on request, and the year
// switch between them. No network.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Conference from './Conference';

// jsdom has no IntersectionObserver, which the sections use (through motion)
// to rise in when scrolled to. This one never reports anything.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const show = (address = '/conference') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/conference" element={<Conference />} />
      </Routes>
    </MemoryRouter>,
  );

const title = () => screen.getByRole('heading', { level: 1 }).textContent;

// The year switch, with "*" on the year shown.
const years = () =>
  within(screen.getByRole('navigation', { name: 'Conference year' }))
    .getAllByRole('link')
    .map((a) => `${a.textContent}${a.getAttribute('aria-current') === 'page' ? ' *' : ''}`);

afterEach(cleanup);

describe('the Conference page', () => {
  it('shows 2027 by default, with its Register button', () => {
    show();

    expect(title()).toBe('Annual Bitcoin Education Institute Conference 2027');
    expect(years()).toEqual(['2027Nashville *', '2026Washington, DC']);
    expect(screen.getByRole('link', { name: 'Register' })).toBeTruthy();
    expect(screen.queryByText('2026 Program Agenda')).toBeNull();
  });

  it('shows 2026, with its agenda, when the address asks for it', () => {
    show('/conference?year=2026');

    expect(title()).toBe('Annual Bitcoin Education Institute Conference 2026');
    expect(years()).toEqual(['2027Nashville', '2026Washington, DC *']);
    expect(screen.getByRole('heading', { name: '2026 Program Agenda' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Register' })).toBeNull();
  });

  it('switches between the years', () => {
    show();

    fireEvent.click(screen.getByRole('link', { name: /2026/ }));
    expect(title()).toMatch(/2026$/);

    fireEvent.click(screen.getByRole('link', { name: /^2027/ }));
    expect(title()).toMatch(/2027$/);
  });

  it('links each year to its own address, 2027 to the plain one', () => {
    show();

    const nav = within(screen.getByRole('navigation', { name: 'Conference year' }));
    expect(nav.getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/conference',
      '/conference?year=2026',
    ]);
  });

  it('falls back to 2027 for a year it does not have', () => {
    show('/conference?year=1999');

    expect(title()).toMatch(/2027$/);
  });
});
