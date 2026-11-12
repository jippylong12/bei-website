// Shared by the faculty page tests: a stubbed API (no network) and the
// handful of things both test files do to the screen.
import { vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

export const TOKEN_KEY = 'bei.faculty.session.v1';

// jsdom has no IntersectionObserver, which the cards use (through motion) to
// rise in when scrolled to. This one never reports anything, so the cards are
// simply in the page, which is all the tests look at.
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// An API answer: reply(200, {...}) is a handler for stubApi.
export const reply = (status, body) => () =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

// Stub fetch with one handler per "METHOD /path"; returns the calls it saw.
// A route with no handler fails like a dropped connection.
export function stubApi(routes) {
  const calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((url, init = {}) => {
      const method = init.method || 'GET';
      calls.push({
        route: `${method} ${url}`,
        authorization: init.headers?.Authorization,
        body: init.body ? JSON.parse(init.body) : undefined,
      });
      const handler = routes[`${method} ${url}`];
      return handler ? handler() : Promise.reject(new TypeError(`no stub for ${method} ${url}`));
    }),
  );
  return calls;
}

export function type(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

export const click = (name) => fireEvent.click(screen.getByRole('button', { name }));

// The page's one top-level heading.
export const pageTitles = () =>
  screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent);
