// The prototype page's API base (prototypeApi.js): whatever it is given, it
// never resolves to the production BitResearch API or to this site's own /api.
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROTOTYPE_API_URL,
  PROTOTYPE_API_BASE,
  resolvePrototypeApiBase,
} from './prototypeApi';

const DEFAULT = DEFAULT_PROTOTYPE_API_URL;

describe('resolvePrototypeApiBase', () => {
  it('defaults to the prototype API', () => {
    expect(DEFAULT).toBe('https://prototype-api.batchllm-workspace.info');
    expect(resolvePrototypeApiBase(undefined)).toBe(DEFAULT);
    expect(resolvePrototypeApiBase(null)).toBe(DEFAULT);
    expect(resolvePrototypeApiBase('')).toBe(DEFAULT);
    expect(resolvePrototypeApiBase('   ')).toBe(DEFAULT);
  });

  it('never falls back to the same origin: "/" alone is not a base', () => {
    expect(resolvePrototypeApiBase('/')).toBe(DEFAULT);
    expect(resolvePrototypeApiBase('///')).toBe(DEFAULT);
  });

  it('uses a given https or http host, without a trailing slash', () => {
    expect(resolvePrototypeApiBase('https://api.example.org/')).toBe('https://api.example.org');
    expect(resolvePrototypeApiBase(' http://localhost:8620 ')).toBe('http://localhost:8620');
    expect(resolvePrototypeApiBase('https://example.org/prefix//')).toBe('https://example.org/prefix');
  });

  it('uses a path on this origin, for the dev and preview proxy', () => {
    expect(resolvePrototypeApiBase('/prototype-api')).toBe('/prototype-api');
    expect(resolvePrototypeApiBase('/prototype-api/')).toBe('/prototype-api');
  });

  it('refuses the production BitResearch API, by name or as the site API base', () => {
    for (const value of [
      'https://bei-api.batchllm-workspace.info',
      'https://BEI-API.batchllm-workspace.info/',
      'http://bei-api.batchllm-workspace.info:443/api',
      'https://api.btcedu.org',
      'https://edge.api.btcedu.org',
    ]) {
      expect(resolvePrototypeApiBase(value)).toBe(DEFAULT);
    }
    expect(
      resolvePrototypeApiBase('https://chat.example.net/', { productionBase: 'https://chat.example.net' }),
    ).toBe(DEFAULT);
    // A different origin from the production one is fine.
    expect(
      resolvePrototypeApiBase('https://proto.example.net', { productionBase: 'https://chat.example.net' }),
    ).toBe('https://proto.example.net');
  });

  it('refuses what is not an http(s) URL', () => {
    for (const value of ['prototype-api.example.org', '//evil.example', 'ftp://x.example', 'javascript:alert(1)']) {
      expect(resolvePrototypeApiBase(value)).toBe(DEFAULT);
    }
  });

  it('gives the page a base that is never production and never empty', () => {
    expect(PROTOTYPE_API_BASE).not.toBe('');
    expect(PROTOTYPE_API_BASE).not.toMatch(/bei-api\.batchllm-workspace\.info|api\.btcedu\.org/i);
  });
});
