import Phaser from 'phaser';

export type CitizenRole = 'soldier' | 'collector' | 'explorer';
export type SoldierRank = 'rookie' | 'captain' | 'major' | 'archer';

export interface CitizenData {
  id: string;
  name: string;
  role: CitizenRole;
  rank: SoldierRank;
}

export class CitizenManager extends Phaser.Events.EventEmitter {
  private static instance: CitizenManager;
  public citizens: CitizenData[] = [
    { id: 'cit_1', name: 'Alden', role: 'soldier', rank: 'rookie' },
  ];
  public maxCitizens: number = 3;

  private constructor() {
    super();
  }

  public static getInstance(): CitizenManager {
    if (!CitizenManager.instance) {
      CitizenManager.instance = new CitizenManager();
    }
    return CitizenManager.instance;
  }

  public getCitizens(): CitizenData[] {
    return this.citizens;
  }

  public hireCitizen(role: CitizenRole = 'soldier'): boolean {
    if (this.citizens.length >= this.maxCitizens) return false;

    const names = ['Berrick', 'Corin', 'Dallan', 'Elden', 'Fendrel', 'Garin', 'Halbert', 'Kael'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    const newCitizen: CitizenData = {
      id: `cit_${Date.now()}`,
      name: randomName,
      role,
      rank: 'rookie',
    };

    this.citizens.push(newCitizen);
    this.emit('roster-changed', this.citizens);
    return true;
  }

  public upgradeCitizen(id: string): boolean {
    const cit = this.citizens.find((c) => c.id === id);
    if (!cit) return false;

    if (cit.rank === 'rookie') cit.rank = 'captain';
    else if (cit.rank === 'captain') cit.rank = 'major';
    else if (cit.rank === 'major') cit.rank = 'archer';
    else return false;

    this.emit('roster-changed', this.citizens);
    return true;
  }

  public setRole(id: string, role: CitizenRole): void {
    const cit = this.citizens.find((c) => c.id === id);
    if (cit) {
      cit.role = role;
      this.emit('roster-changed', this.citizens);
    }
  }

  public upgradeMaxCapacity(amount: number = 2): void {
    this.maxCitizens += amount;
    this.emit('roster-changed', this.citizens);
  }
}
