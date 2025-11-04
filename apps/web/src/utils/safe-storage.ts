const isBrowser = typeof window !== 'undefined';

const readStorage = () => {
  if (!isBrowser) {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('localStorage is not available:', error);
    return null;
  }
};

export const safeStorage = {
  get(key: string): string | null {
    const storage = readStorage();
    if (!storage) {
      return null;
    }
    try {
      return storage.getItem(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to read "${key}" from localStorage:`, error);
      return null;
    }
  },
  set(key: string, value: string) {
    const storage = readStorage();
    if (!storage) {
      return;
    }
    try {
      storage.setItem(key, value);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to write "${key}" to localStorage:`, error);
    }
  },
  remove(key: string) {
    const storage = readStorage();
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(key);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to remove "${key}" from localStorage:`, error);
    }
  }
};

