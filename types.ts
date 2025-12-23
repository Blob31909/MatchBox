
export enum MatchboxTier {
  WOODEN = 'WOODEN',
  PLASTIC = 'PLASTIC',
  METAL = 'METAL',
  GOLDEN = 'GOLDEN'
}

export type ItemType = 'CONSUMABLE' | 'BUFF';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  rewardMultiplier: number;
  burnDuration: number; // in ms
  icon: string;
  type: ItemType;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  multiplier: number;
  level: number;
  type: 'COOLDOWN' | 'VALUE' | 'AUTO' | 'TIER';
}

export interface InventoryItem extends ShopItem {
  count: number;
}

export interface GameState {
  money: number;
  totalBurned: number;
  currentTier: MatchboxTier;
  upgrades: Record<string, number>;
  inventory: Record<string, number>; // id -> count
}
