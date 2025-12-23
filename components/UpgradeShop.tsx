
import React from 'react';
import { Upgrade, MatchboxTier } from '../types';
import { TIER_CONFIGS } from '../constants';

interface UpgradeShopProps {
  money: number;
  upgrades: Upgrade[];
  onUpgrade: (id: string) => void;
  currentTier: MatchboxTier;
  onClose: () => void;
}

export const UpgradeShop: React.FC<UpgradeShopProps> = ({ money, upgrades, onUpgrade, currentTier }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Box & Match Enhancements</h3>
      {upgrades.map((upgrade) => {
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.level));
        const canAfford = money >= cost;
        const isMaxBox = upgrade.type === 'TIER' && currentTier === MatchboxTier.GOLDEN;
        const isMaxMulti = upgrade.id === 'multi_burn' && upgrade.level >= 4;
        const isMaxBlue = upgrade.id === 'blue_flame' && upgrade.level >= 4;
        const isSkillUnlocked = upgrade.id === 'box_burst' && upgrade.level >= 1;
        const isMaxed = isMaxBox || isMaxMulti || isMaxBlue || isSkillUnlocked;

        return (
          <button
            key={upgrade.id}
            disabled={!canAfford || isMaxed}
            onClick={(e) => { e.stopPropagation(); onUpgrade(upgrade.id); }}
            className={`w-full p-4 rounded-xl border transition-all text-left flex flex-col gap-1 group relative overflow-hidden
              ${canAfford && !isMaxed 
                ? 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800/80 shadow-lg' 
                : 'bg-black/20 border-zinc-900 opacity-50 cursor-not-allowed'}`}
          >
            <div className="flex justify-between items-start z-10">
              <span className="font-bold text-zinc-100 text-xs">{upgrade.name}</span>
              <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">Lv.{upgrade.level}</span>
            </div>
            <p className="text-[10px] text-zinc-500 z-10 leading-relaxed">{upgrade.description}</p>
            <div className="flex justify-between items-center mt-2 z-10">
              <span className={`font-mono text-sm font-bold ${canAfford ? 'text-green-500' : 'text-zinc-600'}`}>
                {isMaxed ? 'MAXED' : `$${cost.toLocaleString()}`}
              </span>
              {canAfford && !isMaxed && (
                <span className="text-[9px] font-black bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  UPGRADE
                </span>
              )}
            </div>
            {canAfford && !isMaxed && (
              <div className="absolute inset-y-0 left-0 w-1 bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};
