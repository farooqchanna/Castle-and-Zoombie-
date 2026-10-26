export interface Perk {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic';
}

export const PERK_POOL: Perk[] = [
  {
    id: 'bounce_arrows',
    name: 'Bouncing Arrows',
    description: 'Player arrows ricochet to strike 1 additional nearby zombie for 60% damage.',
    icon: '⚡',
    rarity: 'rare',
  },
  {
    id: 'explosive_blast',
    name: 'Explosive Headshots',
    description: 'Critical hits trigger a fiery area burst that damages clustered zombies.',
    icon: '💥',
    rarity: 'epic',
  },
  {
    id: 'last_stand',
    name: 'Last Stand Protocol',
    description: 'When castle gate drops below 35% HP, all archers fire 75% faster.',
    icon: '🛡️',
    rarity: 'rare',
  },
  {
    id: 'swift_collectors',
    name: 'Swift Harvesters',
    description: 'Collector citizens move 50% faster and have double retreat safety distance.',
    icon: '👟',
    rarity: 'common',
  },
  {
    id: 'greedy_scavenger',
    name: 'Greedy Scavengers',
    description: 'All collected coins yield +3 bonus gold.',
    icon: '💰',
    rarity: 'common',
  },
  {
    id: 'volley_shot',
    name: 'Triple Volley',
    description: 'Every shot has a 25% chance to loose a spread of 3 arrows simultaneously.',
    icon: '🏹',
    rarity: 'epic',
  },
];
