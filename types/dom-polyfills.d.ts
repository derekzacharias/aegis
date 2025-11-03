export {};

declare global {
  type ResizeObserverCallback = (entries: readonly unknown[], observer: ResizeObserver) => void;

  interface ResizeObserver {
    disconnect(): void;
    observe(target: unknown, options?: unknown): void;
    unobserve(target: unknown): void;
  }

  var ResizeObserver: {
    prototype: ResizeObserver;
    new (callback: ResizeObserverCallback): ResizeObserver;
  };

  interface Window {
    matchMedia(query: string): {
      matches: boolean;
      media: string;
      onchange: ((event: unknown) => void) | null;
      addListener(listener: (event: unknown) => void): void;
      removeListener(listener: (event: unknown) => void): void;
      addEventListener(type: string, listener: unknown): void;
      removeEventListener(type: string, listener: unknown): void;
      dispatchEvent(event: unknown): boolean;
    };
    scrollTo?: (...args: unknown[]) => void;
  }
}
