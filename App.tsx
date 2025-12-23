
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Matchbox } from './components/Matchbox';
import { UpgradeShop } from './components/UpgradeShop';
import { INITIAL_UPGRADES, TIER_CONFIGS, SHOP_ITEMS } from './constants';
import { MatchboxTier, Upgrade, ShopItem } from './types';

const SAVE_KEY = 'match_clicker_save_v3';

const App: React.FC = () => {
  const [money, setMoney] = useState(0);
  const [totalBurned, setTotalBurned] = useState(0);
  const [currentTier, setCurrentTier] = useState<MatchboxTier>(MatchboxTier.WOODEN);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [preferBlueFlame, setPreferBlueFlame] = useState(false);
  
  const [isIgniting, setIsIgniting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [cooldown, setCooldown] = useState(100);

  // Skill & Item states
  const [isBoxBurning, setIsBoxBurning] = useState(false);
  const [isBoxDiscarding, setIsBoxDiscarding] = useState(false);
  const [isPlacingOnBox, setIsPlacingOnBox] = useState(false);
  const [boxBurstCooldown, setBoxBurstCooldown] = useState(100);
  const [activeItem, setActiveItem] = useState<ShopItem | null>(null);
  const [isItemBurning, setIsItemBurning] = useState(false);

  // UI States
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'UPGRADES' | 'SHOP' | 'INVENTORY'>('UPGRADES');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [frictionVolume, setFrictionVolume] = useState(0.05);

  const audioContext = useRef<AudioContext | null>(null);

  // Load Game Data
  useEffect(() => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setMoney(parsed.money || 0);
        setTotalBurned(parsed.totalBurned || 0);
        setCurrentTier(parsed.currentTier || MatchboxTier.WOODEN);
        if (parsed.upgradeLevels) {
          setUpgrades(prev => prev.map(u => ({ ...u, level: parsed.upgradeLevels[u.id] || 0 })));
        }
        setInventory(parsed.inventory || {});
        setFrictionVolume(parsed.frictionVolume ?? 0.05);
        setPreferBlueFlame(parsed.preferBlueFlame ?? false);
      } catch (e) { console.error("Failed to load save:", e); }
    }
  }, []);

  // Save Game Data
  useEffect(() => {
    const upgradeLevels: Record<string, number> = {};
    upgrades.forEach(u => upgradeLevels[u.id] = u.level);
    const saveData = { 
      money, 
      totalBurned, 
      currentTier, 
      upgradeLevels, 
      inventory, 
      frictionVolume,
      preferBlueFlame 
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }, [money, totalBurned, currentTier, upgrades, inventory, frictionVolume, preferBlueFlame]);

  const playSound = (freq: number, type: OscillatorType, duration: number, volume = 0.1) => {
    try {
      if (!audioContext.current) audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.current.state === 'suspended') audioContext.current.resume();
      const osc = audioContext.current.createOscillator();
      const gain = audioContext.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.current.currentTime);
      gain.gain.setValueAtTime(volume, audioContext.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);
      osc.connect(gain); gain.connect(audioContext.current.destination);
      osc.start(); osc.stop(audioContext.current.currentTime + duration);
    } catch (e) {}
  };

  const resetGame = () => {
    if (confirm("Reset everything?")) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  };

  const getUpgradeLevel = (id: string) => upgrades.find(u => u.id === id)?.level || 0;
  const cooldownReduc = getUpgradeLevel('strike_speed');
  const valueBonus = getUpgradeLevel('match_quality');
  const autoBurnLevel = getUpgradeLevel('auto_striker');
  const multiBurnLevel = getUpgradeLevel('multi_burn');
  const blueFlameLevel = getUpgradeLevel('blue_flame');
  const boxBurstLevel = getUpgradeLevel('box_burst');

  const tierInfo = TIER_CONFIGS[currentTier];
  const strikeCooldownTime = Math.max(100, 1000 / (1 + cooldownReduc * 0.4) / tierInfo.bonusSpeed);
  
  // Logic for applying blue flame bonus only if selected
  const activeBlueFlameBonus = (preferBlueFlame && blueFlameLevel > 0) ? (blueFlameLevel * 25) : 0;
  let earningsPerMatch = (1 + valueBonus * 5 + activeBlueFlameBonus) * tierInfo.bonusValue;
  if (isItemBurning && activeItem) earningsPerMatch *= activeItem.rewardMultiplier;

  const matchCount = Math.min(5, 1 + multiBurnLevel);
  const isFlameActuallyBlue = preferBlueFlame && blueFlameLevel > 0;

  const handleStrike = useCallback(() => {
    if (cooldown < 100 || isIgniting || isBurning || isDiscarding || isBoxOpen || isBoxBurning || isPlacingOnBox || isBoxDiscarding) return;

    setIsIgniting(true);
    setCooldown(0);
    playSound(400, 'sawtooth', 0.15, frictionVolume);

    setTimeout(() => {
      setIsIgniting(false);
      setIsBurning(true);
      playSound(120, 'sine', 1.8, 0.02);

      if (activeItem && !isItemBurning) {
        setIsItemBurning(true);
        playSound(80, 'sawtooth', activeItem.burnDuration / 1000, 0.1);
        setTimeout(() => {
          setIsItemBurning(false);
          setActiveItem(null);
        }, activeItem.burnDuration);
      }
      
      setTimeout(() => {
        setIsBurning(false);
        if (!isItemBurning) {
          setIsDiscarding(true);
          setMoney(prev => prev + (earningsPerMatch * matchCount));
          setTotalBurned(prev => prev + matchCount);
          playSound(900, 'sine', 0.1, 0.03);

          setTimeout(() => {
            setIsDiscarding(false); 
            setTimeout(() => {
              setIsBoxOpen(true);
              playSound(250, 'square', 0.1, 0.01);
              setTimeout(() => setIsBoxOpen(false), 600);
            }, 50);
          }, 700);
        }
      }, 2000);
    }, 250);
  }, [cooldown, isIgniting, isBurning, isDiscarding, isBoxOpen, isBoxBurning, isPlacingOnBox, isBoxDiscarding, earningsPerMatch, frictionVolume, matchCount, activeItem, isItemBurning]);

  const handleBoxBurst = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!boxBurstLevel || isBoxBurning || boxBurstCooldown < 100 || isBurning || isIgniting || isPlacingOnBox || isBoxDiscarding) return;
    
    setIsIgniting(true);
    setBoxBurstCooldown(0);
    playSound(400, 'sawtooth', 0.2, frictionVolume * 2);

    setTimeout(() => {
      setIsIgniting(false);
      setIsBurning(true);
      
      setTimeout(() => {
        setIsPlacingOnBox(true);
        setTimeout(() => {
          setIsBoxBurning(true);
          playSound(60, 'sawtooth', 4, 0.15);
          
          setTimeout(() => {
            setMoney(prev => prev + (earningsPerMatch * 100));
            setTotalBurned(prev => prev + 50);
            setIsBoxDiscarding(true);
            setIsDiscarding(true);
            setIsPlacingOnBox(false);
            
            setTimeout(() => {
              setIsBoxBurning(false);
              setIsBoxDiscarding(false);
              setIsDiscarding(false);
              setIsBurning(false);
              playSound(300, 'sine', 0.4, 0.05);
            }, 800);
          }, 3500);
        }, 1000);
      }, 800);
    }, 300);
  }, [boxBurstLevel, isBoxBurning, boxBurstCooldown, isBurning, isIgniting, isPlacingOnBox, isBoxDiscarding, earningsPerMatch, frictionVolume]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev >= 100 || isIgniting || isBurning || isDiscarding || isBoxOpen || isBoxBurning || isPlacingOnBox || isBoxDiscarding) return prev;
        return Math.min(100, prev + (100 / (strikeCooldownTime / 16)));
      });
      setBoxBurstCooldown(prev => {
        if (prev >= 100 || !boxBurstLevel || isBoxBurning || isPlacingOnBox || isBoxDiscarding) return prev;
        return Math.min(100, prev + 0.08);
      });
    }, 16);
    return () => clearInterval(interval);
  }, [strikeCooldownTime, isIgniting, isBurning, isDiscarding, isBoxOpen, isBoxBurning, isPlacingOnBox, isBoxDiscarding, boxBurstLevel]);

  const buyItem = (item: ShopItem) => {
    if (money < item.cost) return;
    setMoney(m => m - item.cost);
    setInventory(inv => ({ ...inv, [item.id]: (inv[item.id] || 0) + 1 }));
    playSound(700, 'sine', 0.1, 0.05);
  };

  const useItem = (item: ShopItem) => {
    if (activeItem || (inventory[item.id] || 0) <= 0) return;
    setInventory(inv => ({ ...inv, [item.id]: inv[item.id] - 1 }));
    setActiveItem(item);
    setIsShopOpen(false);
    playSound(300, 'square', 0.2, 0.02);
  };

  const handleUpgrade = (id: string) => {
    const upgrade = upgrades.find(u => u.id === id);
    if (!upgrade) return;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.level));
    if (money < cost) return;
    setMoney(prev => prev - cost);
    setUpgrades(prev => prev.map(u => u.id === id ? { ...u, level: u.level + 1 } : u));
    if (upgrade.type === 'TIER') {
      const tiers = Object.values(MatchboxTier);
      const currentIndex = tiers.indexOf(currentTier);
      if (currentIndex < tiers.length - 1) setCurrentTier(tiers[currentIndex + 1]);
    }
    playSound(600, 'sine', 0.1, 0.05);
  };

  return (
    <div className="flex h-screen w-screen bg-[#020202] text-zinc-100 font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-2xl font-black italic text-orange-500 mb-6 uppercase tracking-wider">Settings</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center"><label className="text-sm font-bold uppercase tracking-widest text-zinc-400">Volume</label></div>
                <input type="range" min="0" max="0.2" step="0.01" value={frictionVolume} onChange={(e) => setFrictionVolume(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
              </div>
              <button onClick={resetGame} className="w-full py-3 bg-red-950/20 hover:bg-red-500 hover:text-white border border-red-900/40 text-red-500 font-bold rounded-xl transition-all uppercase tracking-widest text-xs">Reset Progress</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div onClick={handleStrike} className={`flex-1 flex flex-col relative overflow-hidden cursor-pointer transition-colors duration-1000 ${isBurning || isBoxBurning || isItemBurning ? 'bg-orange-950/15' : 'bg-transparent'}`}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full blur-[300px] transition-all duration-1000
            ${isBurning || isBoxBurning || isItemBurning ? (isFlameActuallyBlue ? 'bg-blue-900/10 scale-150' : 'bg-orange-900/10 scale-125') : 'bg-zinc-900/5 scale-100'}`}></div>
        </div>

        <header className="p-10 flex justify-between items-start z-10 pointer-events-none">
          <div className="space-y-1">
            {/* Title Removed as requested */}
          </div>
          <div className="flex flex-col items-end">
            <div className="text-7xl font-black font-mono text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">${Math.floor(money).toLocaleString()}</div>
            <div className="mt-4 px-4 py-1.5 bg-zinc-900/80 border border-white/5 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-400">Burned: <span className="text-zinc-100">{totalBurned}</span></div>
          </div>
        </header>

        <div className="fixed bottom-10 right-10 flex gap-4 z-[90]">
           {/* Flame Color Toggle Button */}
           {blueFlameLevel > 0 && (
             <button 
               onClick={(e) => { e.stopPropagation(); setPreferBlueFlame(!preferBlueFlame); playSound(preferBlueFlame ? 400 : 800, 'sine', 0.1, 0.02); }}
               className={`w-14 h-14 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center transition-all shadow-xl group overflow-hidden
                 ${preferBlueFlame ? 'bg-blue-600 shadow-[0_0_15px_#3b82f6]' : 'bg-zinc-800 hover:bg-zinc-700'}`}
             >
               <span className="text-xl z-10">{preferBlueFlame ? '🔵' : '🔴'}</span>
             </button>
           )}

           {boxBurstLevel > 0 && (
             <button onClick={handleBoxBurst} disabled={boxBurstCooldown < 100 || isBoxBurning || isBurning || isPlacingOnBox || isBoxDiscarding} className={`w-14 h-14 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center transition-all shadow-xl group relative overflow-hidden ${boxBurstCooldown < 100 || isBoxBurning || isBurning || isPlacingOnBox || isBoxDiscarding ? 'bg-zinc-900/50 opacity-50 grayscale' : 'bg-red-600 hover:scale-110'}`}><div className="absolute bottom-0 left-0 w-full bg-black/40 transition-all duration-100" style={{ height: `${100 - boxBurstCooldown}%` }}></div><span className="text-xl z-10">🔥</span></button>
           )}
           <button onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }} className="w-14 h-14 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center hover:bg-zinc-800 transition-all shadow-xl group"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
           <button onClick={(e) => { e.stopPropagation(); setIsShopOpen(!isShopOpen); }} className={`w-14 h-14 ${isShopOpen ? 'bg-orange-500' : 'bg-zinc-900/80'} backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-xl group`}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg></button>
        </div>

        <main className="flex-1 flex flex-col items-center justify-center relative z-10 pointer-events-none">
          <Matchbox 
            isIgniting={isIgniting} isBurning={isBurning} isDiscarding={isDiscarding} isBoxOpen={isBoxOpen}
            tier={currentTier} cooldownProgress={cooldown} matchCount={matchCount} isBlueFlame={isFlameActuallyBlue}
            isBoxBurning={isBoxBurning} isBoxDiscarding={isBoxDiscarding} isPlacingOnBox={isPlacingOnBox} activeItem={activeItem} isItemBurning={isItemBurning}
          />

          <div className="mt-40 flex flex-col items-center gap-6">
            <div className={`px-12 py-5 rounded-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-2xl transition-all duration-700 shadow-3xl
                ${cooldown >= 100 && !isIgniting && !isBurning && !isDiscarding && !isBoxOpen && !isBoxBurning && !isPlacingOnBox && !isBoxDiscarding ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-90'}`}>
              <span className={`text-sm font-black uppercase tracking-[0.6em] animate-pulse ${isFlameActuallyBlue ? 'text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-orange-400'}`}>
                {activeItem ? `Ignite ${activeItem.name}` : `Strike ${matchCount > 1 ? `(${matchCount}x)` : ''}`}
              </span>
            </div>
            
            <div className="flex gap-12 items-center opacity-30 mt-4 font-mono">
                <div className="text-center"><div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Base Value</div><div className={`text-xl font-bold ${isFlameActuallyBlue ? 'text-blue-500' : 'text-green-500'}`}>${Math.floor(earningsPerMatch).toLocaleString()}</div></div>
                <div className="w-[1px] h-10 bg-zinc-800"></div>
                <div className="text-center"><div className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Bundle</div><div className="text-xl font-bold text-orange-400">{matchCount}x</div></div>
            </div>
          </div>
        </main>
      </div>

      <div className={`fixed top-0 right-0 h-full z-80 transition-transform duration-500 ease-out bg-zinc-950/90 backdrop-blur-xl border-l border-zinc-800 w-[400px] flex flex-col shadow-2xl ${isShopOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex gap-4">
            {(['UPGRADES', 'SHOP', 'INVENTORY'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-md transition-all ${activeTab === tab ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => setIsShopOpen(false)} className="p-2 text-zinc-500 hover:text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'UPGRADES' && (
            <UpgradeShop money={money} upgrades={upgrades} onUpgrade={handleUpgrade} currentTier={currentTier} onClose={() => {}} />
          )}

          {activeTab === 'SHOP' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Black Market Items</h3>
              {SHOP_ITEMS.map(item => (
                <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-zinc-100">{item.name}</div>
                      <div className="text-[10px] text-zinc-500">{item.description}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => buyItem(item)}
                    disabled={money < item.cost}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${money >= item.cost ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-zinc-800 text-zinc-500 grayscale'}`}
                  >
                    ${item.cost}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'INVENTORY' && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">My Stock</h3>
              {SHOP_ITEMS.filter(item => inventory[item.id] > 0).length === 0 && <div className="text-center text-zinc-600 text-sm py-10 italic">Empty Inventory</div>}
              {SHOP_ITEMS.filter(item => inventory[item.id] > 0).map(item => (
                <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-zinc-100">{item.name} (x{inventory[item.id]})</div>
                      <div className="text-[10px] text-zinc-400">Equip to baseplate for {item.rewardMultiplier}x bonus</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => useItem(item)}
                    disabled={activeItem !== null}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeItem === null ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                  >
                    {activeItem?.id === item.id ? 'EQUIPPED' : 'EQUIP'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
