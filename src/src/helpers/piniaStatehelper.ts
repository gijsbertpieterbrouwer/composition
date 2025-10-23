import type { StorageLike } from 'pinia-plugin-persistedstate';

export enum PiniaStorageType {
  Session = 'sessionStorage',
  Local = 'localStorage',
}

export interface TickStorageOptions {
  ignoreWorkspaceId?: boolean; // If true, do not include workspace ID in key
  getWorkspaceId: () => string | null; // Callback from safe context (e.g., composable)
  storageType: PiniaStorageType; // Fixed type for this storage instance
  prefix?: string; // e.g., 'Tick-V1-'
}

export class TickSessionStorage implements StorageLike {
  private memoryStorage = new Map<string, string>();
  private options: TickStorageOptions;
  private prefix: string;

  constructor(options: TickStorageOptions) {
    this.options = options;
    this.prefix = options.prefix || 'Tick-';
  }

  private getStorage(): Storage | Map<string, string> {
    if (typeof window !== 'undefined') {
      return window[this.options.storageType];
    }
    return this.memoryStorage; // Shared fallback for SSR
  }

  private getPrefixedKey(key: string): string {
    const wsId = this.options.ignoreWorkspaceId
      ? ""
      : `-${this.options.getWorkspaceId()}` || 'default';

    return `${this.prefix}${wsId}-${key}`;
  }

  getItem(key: string): string | null {
    const storage = this.getStorage();
    const prefixedKey = this.getPrefixedKey(key);
    if (storage instanceof Map) {
      return storage.get(prefixedKey) || null;
    }
    return storage.getItem(prefixedKey);
  }

  setItem(key: string, value: string): void {
    const storage = this.getStorage();
    const prefixedKey = this.getPrefixedKey(key);
    if (storage instanceof Map) {
      storage.set(prefixedKey, value);
    } else {
      storage.setItem(prefixedKey, value);
    }
  }

  removeItem(key: string): void {
    const storage = this.getStorage();
    const prefixedKey = this.getPrefixedKey(key);
    if (storage instanceof Map) {
      storage.delete(prefixedKey);
    } else {
      storage.removeItem(prefixedKey);
    }
  }
}