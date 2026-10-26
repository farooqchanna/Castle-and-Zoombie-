import { SimpleEventEmitter } from '../utils/EventEmitter';
import { PERK_POOL, Perk } from '../data/perks';

export class PerkManager extends SimpleEventEmitter {
  private static instance: PerkManager;
  private activePerkIds: Set<string> = new Set();

  private constructor() {
    super();
  }

  public static getInstance(): PerkManager {
    if (!PerkManager.instance) {
      PerkManager.instance = new PerkManager();
    }
    return PerkManager.instance;
  }

  public hasPerk(id: string): boolean {
    return this.activePerkIds.has(id);
  }

  public addPerk(id: string): void {
    this.activePerkIds.add(id);
    this.emit('perk-added', id);
  }

  public getActivePerkIds(): string[] {
    return Array.from(this.activePerkIds);
  }

  public setPerks(perks: string[]): void {
    this.activePerkIds = new Set(perks);
    this.emit('perks-updated', this.getActivePerkIds());
  }

  public reset(): void {
    this.activePerkIds.clear();
  }

  public getRandomSelection(count: number = 3): Perk[] {
    const available = PERK_POOL.filter((p) => !this.activePerkIds.has(p.id));
    const pool = available.length >= count ? available : PERK_POOL;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}
