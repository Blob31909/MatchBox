
import React from 'react';
import { FireParticles, SmokeParticles, SparkParticles } from './ParticleEffect';
import { TIER_CONFIGS } from '../constants';
import { MatchboxTier, ShopItem } from '../types';

interface MatchboxProps {
  isIgniting: boolean;
  isBurning: boolean;
  isDiscarding: boolean;
  isBoxOpen: boolean;
  tier: MatchboxTier;
  cooldownProgress: number;
  matchCount: number;
  isBlueFlame: boolean;
  isBoxBurning: boolean;
  isBoxDiscarding: boolean;
  isPlacingOnBox: boolean;
  activeItem: ShopItem | null;
  isItemBurning: boolean;
}

const VintageBanner = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10 30C10 30 40 10 100 10C160 10 190 30 190 30C190 30 160 50 100 50C40 50 10 30 10 30Z" fill="black" fillOpacity="0.2" />
    <path d="M5 25C5 25 40 5 100 5C160 5 195 25 195 25L190 35C190 35 155 15 100 15C45 15 10 35 10 35L5 25Z" fill="white" />
    <path d="M5 25C5 25 40 5 100 5C160 5 195 25 195 25" stroke="black" strokeWidth="1" />
    <path d="M30 40C30 40 60 55 100 55C140 55 170 40 170 40L165 45C165 45 135 60 100 60C65 60 35 45 35 45L30 40Z" fill="white" />
    <path d="M30 40C30 40 60 55 100 55C140 55 170 40 170 40" stroke="black" strokeWidth="1" />
  </svg>
);

export const Matchbox: React.FC<MatchboxProps> = ({ 
  isIgniting, 
  isBurning, 
  isDiscarding, 
  isBoxOpen,
  tier, 
  cooldownProgress,
  matchCount,
  isBlueFlame,
  isBoxBurning,
  isBoxDiscarding,
  isPlacingOnBox,
  activeItem,
  isItemBurning
}) => {
  const isCurrentlyCharred = isBurning || isDiscarding || isBoxBurning || isItemBurning;

  return (
    <div className={`relative flex flex-col items-center justify-center h-96 w-full max-sm:scale-75 max-w-sm mx-auto transition-all duration-[800ms]`}>
      {/* Floor Shadow */}
      <div className={`absolute bottom-20 w-56 h-12 bg-black/60 blur-3xl rounded-[100%] transition-all duration-500 
        ${isBoxDiscarding ? 'opacity-0 scale-0' : 'opacity-100'}
        `} style={{ transform: isBoxOpen || isBoxBurning ? 'scale(1.5) translateY(25px)' : 'scale(1)' }}></div>

      {/* Global Flame Glow */}
      <div className={`absolute w-[600px] h-[600px] rounded-full blur-[220px] transition-opacity duration-700 
        ${isBurning || isBoxBurning || isItemBurning ? 'opacity-100' : 'opacity-0'}
        ${isBlueFlame ? 'bg-blue-900/15' : 'bg-orange-700/15'}`}></div>

      {/* Item on Baseplate */}
      {activeItem && !isBoxDiscarding && (
        <div 
          className={`absolute z-[45] transition-all duration-500 flex flex-col items-center
            ${isItemBurning ? 'scale-150 blur-[1px]' : 'scale-100'}
            ${isPlacingOnBox ? 'top-[40%]' : 'top-[10%]'}
            ${isDiscarding ? 'match-discard' : ''}
          `}
          style={{ transform: `translateY(-60px) rotate(${isItemBurning ? (Math.random() * 10 - 5) : 0}deg)` }}
        >
          <div className="text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{activeItem.icon}</div>
          {isItemBurning && <div className="mt-[-20px]"><FireParticles active={true} isBlue={isBlueFlame} isLarge={true} /></div>}
        </div>
      )}

      {/* Box Burning Fire Effect */}
      {isBoxBurning && (
        <div className="absolute z-[40]">
           <FireParticles active={true} isBlue={isBlueFlame} isLarge={true} />
        </div>
      )}

      {/* Sparks during strike */}
      <SparkParticles active={isIgniting} />

      {/* Matchsticks */}
      {[...Array(matchCount)].map((_, index) => {
        const offsetLeft = (index - (matchCount - 1) / 2) * 6;
        const rotateOffset = (index - (matchCount - 1) / 2) * 2;
        
        let matchTop = isIgniting ? '48%' : isBoxOpen ? '72%' : '10%';
        let matchTransform = isIgniting 
          ? `translateX(110px) rotate(${8 + rotateOffset}deg) scaleY(0.97)` 
          : isBoxOpen 
            ? `translateY(15px) rotate(${rotateOffset}deg) scale(0.92)` 
            : `translateX(0) rotate(${rotateOffset}deg)`;

        if (isPlacingOnBox) {
          matchTop = '15%';
          matchTransform = `translateY(110px) rotate(${90 + rotateOffset}deg) scale(1.1)`;
        }

        return (
          <div 
            key={index}
            className={`absolute z-50 w-[9px] rounded-b-[2px] shadow-2xl ${isDiscarding ? 'match-discard' : ''}`}
            style={{
              height: '175px',
              left: '50%',
              marginLeft: `${-4.5 + offsetLeft}px`,
              backgroundColor: isCurrentlyCharred ? '#0c0c0c' : '#f5d9ad',
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent, rgba(255,255,255,0.15))',
              top: matchTop,
              opacity: (isDiscarding || isBoxDiscarding) ? 0 : 1,
              transform: matchTransform,
              transition: isBoxBurning || isItemBurning
                ? 'all 1s ease-in-out'
                : isBoxOpen 
                  ? 'none' 
                  : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <div 
              className={`absolute top-[-7px] left-[-4px] w-[17px] h-[28px] rounded-[50%_50%_35%_35%] shadow-lg transition-all duration-500
                ${isCurrentlyCharred ? 'bg-zinc-900 scale-90' : (isBlueFlame ? 'bg-[#1e40af]' : 'bg-[#2b1111]')}
              `}
              style={{
                 boxShadow: isCurrentlyCharred 
                   ? `0 0 60px ${isBlueFlame ? '#2563eb' : '#ff2800'}, inset 0 0 15px ${isBlueFlame ? '#60a5fa' : '#ff6400'}` 
                   : 'inset -3px -3px 4px rgba(0,0,0,0.7), inset 3px 3px 4px rgba(255,255,255,0.1)'
              }}
            >
              {(isBurning || isBoxBurning || isItemBurning) && index === Math.floor(matchCount / 2) && <FireParticles active={true} isBlue={isBlueFlame} />}
              {(isBurning || isBoxBurning || isItemBurning) && index === Math.floor(matchCount / 2) && <SmokeParticles active={true} />}
            </div>
          </div>
        );
      })}

      {/* The Matchbox Sleeve (The "Cartoon") */}
      <div className={`relative z-30 w-[290px] h-[180px] rounded-md shadow-[0_30px_70px_rgba(0,0,0,0.9)] border-2 border-black/30 bg-[#cc1a21] overflow-hidden transform transition-all duration-700
          ${isBoxBurning ? 'bg-zinc-950 scale-125 rotate-2 blur-[1px]' : ''}
          ${isBoxDiscarding ? 'match-discard' : ''}`}>
         <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] mix-blend-multiply"></div>
         <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${isBoxBurning || isItemBurning ? 'opacity-20' : 'opacity-100'}`}>
            <div className="absolute inset-3 border-2 border-white/80 rounded-sm opacity-90"></div>
            <div className="relative z-10 w-full flex justify-center mt-[-10px]">
                <VintageBanner className="w-44 h-14" />
                <div className="absolute top-[18px] text-[10px] font-bold text-black opacity-80" style={{ fontFamily: 'serif' }}></div>
            </div>
            <div className="relative z-10 w-[55%] h-[50%] bg-[#fde100] border-[3px] border-black flex flex-col items-center justify-center shadow-xl transform -rotate-1">
                <div className="text-6xl font-black text-black leading-none mt-[-5px]">T</div>
                <div className="text-[11px] font-black tracking-[0.2em] text-black uppercase mt-[-4px]">MATCHES</div>
            </div>
         </div>
         {isBoxBurning && <div className="absolute inset-0 bg-gradient-to-t from-orange-600/60 to-black mix-blend-multiply animate-pulse"></div>}
      </div>

      {/* The Matchbox Drawer */}
      <div 
        className={`absolute z-20 w-[276px] h-[166px] bg-[#f9f9f9] border-x-[5px] border-[#e2e2e2] rounded-sm shadow-[inset_0_15px_40px_rgba(0,0,0,0.6)] transition-all duration-[1000ms] flex flex-col justify-center gap-2 px-6 py-5 overflow-hidden
          ${isBoxDiscarding ? 'match-discard' : ''}`}
        style={{
          transform: isBoxOpen ? 'translateY(125px)' : (isBoxBurning || isItemBurning ? 'translateY(150px) scale(1.1) rotate(-1deg)' : 'translateY(0)'),
          backgroundColor: isBoxBurning || isItemBurning ? '#111' : '#f9f9f9',
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-[95%] h-[5px] bg-[#f2dab0] rounded-full relative shadow-sm border-b border-black/5" style={{ transform: `rotate(${(Math.random() - 0.5) * 2}deg)` }}>
            <div className={`w-4 h-5 rounded-full absolute -left-1.5 -top-1.5 shadow-[0_2px_5px_rgba(0,0,0,0.6)] ${isBoxBurning || isItemBurning ? 'bg-black' : (isBlueFlame ? 'bg-blue-900' : 'bg-[#1a0c0c]')}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};
