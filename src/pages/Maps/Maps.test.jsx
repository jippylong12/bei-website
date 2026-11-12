// The Map page's frame (Maps.jsx): it keeps its starting height until the map page inside
// says it is ready, then fits that page and follows it. No network: jsdom does not load the
// frame's page, so each test plays the map page's part on the frame's empty document.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import Maps from './Maps';

let observers;

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// The map page's body, as tall as `height`. (jsdom's empty frame document has no body yet.)
function mapPage(frame, height) {
  const doc = frame.contentDocument;
  if (!doc.body) {
    const html = doc.documentElement ?? doc.appendChild(doc.createElement('html'));
    html.appendChild(doc.createElement('body'));
  }
  const body = doc.body;
  body.style.margin = '0';
  Object.defineProperty(body, 'scrollHeight', { value: height, configurable: true });
  return body;
}

const show = () => render(<Maps />).container.querySelector('iframe');

describe('the map frame', () => {
  it('keeps its height while the map page waits for its data, then fits it once', () => {
    const frame = show();
    mapPage(frame, 930); // the page is still short: its data has not arrived
    fireEvent.load(frame);

    expect(frame.style.height).toBe('1600px');

    mapPage(frame, 1444);
    act(() => frame.contentWindow.dispatchEvent(new Event('mapready')));

    expect(frame.style.height).toBe('1444px');
  });

  it('fits at once when the map page was ready before the frame finished loading', () => {
    const frame = show();
    mapPage(frame, 1444).classList.add('ready');
    fireEvent.load(frame);

    expect(frame.style.height).toBe('1444px');
  });

  it('follows the map page as it grows and shrinks afterwards', () => {
    const frame = show();
    mapPage(frame, 1444).classList.add('ready');
    fireEvent.load(frame);

    mapPage(frame, 1700); // someone opened a long list
    act(() => observers.at(-1).callback());

    expect(frame.style.height).toBe('1700px');
  });
});
