export type EventCallback = (...args: any[]) => void;

export class SimpleEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public on(event: string, fn: EventCallback): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
    return this;
  }

  public off(event: string, fn: EventCallback): this {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(fn);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return false;
    set.forEach((fn) => {
      try {
        fn(...args);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
    return true;
  }

  public removeAllListeners(event?: string): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }
}
