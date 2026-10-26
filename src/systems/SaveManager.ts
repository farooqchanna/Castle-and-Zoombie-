import { CitizenData } from './CitizenManager';

export interface SaveData {
  wave: number;
  coins: number;
  wallHp: number;
  wallMaxHp: number;
  arrowDamage: number;
  fireRateLevel: number;
  citizens: CitizenData[];
  maxCitizens: number;
  perks: string[];
  timestamp: number;
}

const STORAGE_KEY = 'zombie_castle_defense_3d_save';

export class SaveManager {
  private static instance: SaveManager;

  private constructor() {}

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public hasSave(): boolean {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) return false;
      const parsed = JSON.parse(item);
      return typeof parsed.wave === 'number' && parsed.wave >= 1;
    } catch {
      return false;
    }
  }

  public saveGame(data: Partial<SaveData>): void {
    try {
      const existing = this.loadGame() || this.getDefaultSave();
      const merged: SaveData = {
        ...existing,
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (err) {
      console.warn('Failed to save game to localStorage:', err);
    }
  }

  public loadGame(): SaveData | null {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (!item) return null;
      const parsed = JSON.parse(item) as SaveData;
      if (typeof parsed.wave !== 'number') return null;
      return parsed;
    } catch (err) {
      console.warn('Failed to parse save data; resetting.', err);
      this.clearSave();
      return null;
    }
  }

  public clearSave(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear save:', err);
    }
  }

  public getDefaultSave(): SaveData {
    return {
      wave: 1,
      coins: 50,
      wallHp: 250,
      wallMaxHp: 250,
      arrowDamage: 18,
      fireRateLevel: 1,
      citizens: [{ id: 'cit_1', name: 'Alden', role: 'soldier', rank: 'rookie' }],
      maxCitizens: 4,
      perks: [],
      timestamp: Date.now(),
    };
  }
}
