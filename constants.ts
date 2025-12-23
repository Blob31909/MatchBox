
import { MatchboxTier, Upgrade, ShopItem } from './types';

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'strike_speed',
    name: 'Better Friction',
    description: 'Reduces cooldown between strikes.',
    baseCost: 15,
    multiplier: 1.4,
    level: 0,
    type: 'COOLDOWN'
  },
  {
    id: 'match_quality',
    name: 'Premium Phosphorus',
    description: 'Increases money earned per burn.',
    baseCost: 25,
    multiplier: 1.6,
    level: 0,
    type: 'VALUE'
  },
  {
    id: 'blue_flame',
    name: 'Superheated Strike',
    description: 'Turns the flame blue for extreme value. (Max 5)',
    baseCost: 1000,
    multiplier: 3,
    level: 0,
    type: 'VALUE'
  },
  {
    id: 'multi_burn',
    name: 'Bundle Striker',
    description: 'Strike more matches at once (Max 5).',
    baseCost: 200,
    multiplier: 4.5,
    level: 0,
    type: 'VALUE'
  },
  {
    id: 'box_burst',
    name: 'Box Infernal Skill',
    description: 'Unlocks a skill to ignite the entire box for huge rewards.',
    baseCost: 5000,
    multiplier: 5,
    level: 0,
    type: 'VALUE'
  },
  {
    id: 'auto_striker',
    name: 'Auto-Igniter',
    description: 'Automatically strikes matches.',
    baseCost: 100,
    multiplier: 2.1,
    level: 0,
    type: 'AUTO'
  },
  {
    id: 'box_upgrade',
    name: 'Upgrade Matchbox',
    description: 'Unlock a new box tier with massive bonuses.',
    baseCost: 500,
    multiplier: 10,
    level: 0,
    type: 'TIER'
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'newspaper',
    name: 'Old Newspaper',
    description: 'Burns quickly. 2x money for the next strike.',
    cost: 50,
    rewardMultiplier: 2,
    burnDuration: 1000,
    icon: '🗞️',
    type: 'CONSUMABLE'
  },
  {
    id: 'candle',
    name: 'Paraffin Candle',
    description: 'Burns for a while. 3x money during burn.',
    cost: 250,
    rewardMultiplier: 3,
    burnDuration: 5000,
    icon: '🕯️',
    type: 'CONSUMABLE'
  },
  {
    id: 'firework',
    name: 'Red Firecracker',
    description: 'Massive explosion! 15x instant reward.',
    cost: 1500,
    rewardMultiplier: 15,
    burnDuration: 500,
    icon: '🧨',
    type: 'CONSUMABLE'
  },
  {
    id: 'gas_can',
    name: 'Lighter Fluid',
    description: 'Soak the box. 5x money for 10 seconds.',
    cost: 5000,
    rewardMultiplier: 5,
    burnDuration: 10000,
    icon: '⛽',
    type: 'BUFF'
  }
];

export const TIER_CONFIGS = {
  [MatchboxTier.WOODEN]: {
    name: 'Classic T-Matches',
    color: 'bg-[#cc1a21]',
    borderColor: 'border-[#8b0000]',
    bonusValue: 1,
    bonusSpeed: 1
  },
  [MatchboxTier.PLASTIC]: {
    name: 'Safety Matches Box',
    color: 'bg-gradient-to-br from-blue-700 to-blue-900',
    borderColor: 'border-blue-950',
    bonusValue: 5,
    bonusSpeed: 1.3
  },
  [MatchboxTier.METAL]: {
    name: 'Industrial Tin',
    color: 'bg-gradient-to-br from-zinc-600 to-zinc-800',
    borderColor: 'border-zinc-900',
    bonusValue: 25,
    bonusSpeed: 1.7
  },
  [MatchboxTier.GOLDEN]: {
    name: 'Royal Seal Box',
    color: 'bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-800',
    borderColor: 'border-yellow-900',
    bonusValue: 150,
    bonusSpeed: 2.5
  }
};
