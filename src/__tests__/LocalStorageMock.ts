export default class LocalStorageMock {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  readonly asRecord: Record<string, string> = this as any;

  clear(): void {
    for (const key in this) {
      if (key in ['getItem', 'setItem', 'removeItem']) {
        continue;
      }
      this.removeItem(key);
    }
  }

  getItem(key: string): string | null {
    return this.asRecord[key] ? String(this.asRecord[key]) : null;
  }

  setItem(key: string, value: string): void {
    this.asRecord[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.asRecord[key];
  }
}
