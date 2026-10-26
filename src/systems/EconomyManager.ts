import { SimpleEventEmitter } from '../utils/EventEmitter';

export class EconomyManager extends SimpleEventEmitter {
  private static instance: EconomyManager;
  private coins: number = 50;

  private constructor() {
    super();
  }

  public static getInstance(): EconomyManager {
    if (!EconomyManager.instance) {
      EconomyManager.instance = new EconomyManager();
    }
    return EconomyManager.instance;
  }

  public getCoins(): number {
    return this.coins;
  }

  public setCoins(amount: number): void {
    this.coins = Math.max(0, amount);
    this.emit('coins-changed', this.coins);
  }

  public addCoins(amount: number): void {
    if (amount <= 0) return;
    this.coins += amount;
    this.emit('coins-changed', this.coins);
  }

  public spendCoins(amount: number): boolean {
    if (amount <= 0) return true;
    if (this.coins >= amount) {
      this.coins -= amount;
      this.emit('coins-changed', this.coins);
      return true;
    }
    return false;
  }

  public reset(): void {
    this.coins = 50;
    this.emit('coins-changed', this.coins);
  }
}
