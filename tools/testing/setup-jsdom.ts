import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

const noop = () => undefined;

type MatchMediaResult = {
  matches: boolean;
  media: string;
  onchange: ((event: unknown) => void) | null;
  addListener: (listener: (event: unknown) => void) => void;
  removeListener: (listener: (event: unknown) => void) => void;
  addEventListener: (type: string, listener: unknown) => void;
  removeEventListener: (type: string, listener: unknown) => void;
  dispatchEvent: (event: unknown) => boolean;
};

type MutableGlobal = typeof globalThis & {
  [key: string]: unknown;
  matchMedia?: (query: string) => MatchMediaResult;
  ResizeObserver?: new (callback: ResizeObserverCallback) => ResizeObserver;
  scrollTo?: (...args: unknown[]) => void;
};

type ResizeObserverCallback = (entries: unknown[], observer: { disconnect(): void }) => void;

class ResizeObserver {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  disconnect(): void {
    noop();
  }

  observe(): void {
    noop();
  }

  unobserve(): void {
    noop();
  }
}

const globalRef = globalThis as MutableGlobal;

if (!globalRef.TextEncoder) {
  globalRef.TextEncoder = TextEncoder as unknown as typeof globalRef.TextEncoder;
}

if (!globalRef.TextDecoder) {
  globalRef.TextDecoder = TextDecoder as unknown as typeof globalRef.TextDecoder;
}

if (!globalRef.matchMedia) {
  globalRef.matchMedia = (query: string): MatchMediaResult => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false
  });
}

if (!globalRef.ResizeObserver) {
  globalRef.ResizeObserver = ResizeObserver as unknown as typeof globalRef.ResizeObserver;
}

if (!globalRef.scrollTo) {
  globalRef.scrollTo = noop;
}

if (!globalRef.crypto || typeof globalRef.crypto !== 'object') {
  const { webcrypto } = require('crypto') as { webcrypto: Crypto };
  globalRef.crypto = webcrypto;
} else if (typeof globalRef.crypto.randomUUID !== 'function') {
  const { randomUUID } = require('crypto') as { randomUUID: () => string };
  globalRef.crypto.randomUUID = randomUUID as unknown as typeof globalRef.crypto.randomUUID;
}
