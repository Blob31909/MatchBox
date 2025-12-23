
import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export const SparkParticles: React.FC<{ active: boolean }> = ({ active }) => {
  const [sparks, setSparks] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setSparks([]);
      return;
    }

    const interval = setInterval(() => {
      setSparks(prev => [
        ...prev.slice(-20),
        {
          id: Math.random(),
          x: (Math.random() - 0.2) * 150,
          y: (Math.random() - 0.5) * 100,
          size: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? 'bg-yellow-400' : 'bg-orange-300'
        }
      ]);
    }, 20);

    return () => clearInterval(interval);
  }, [active]);

  if (!active && sparks.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {sparks.map(s => (
        <div
          key={s.id}
          className={`absolute rounded-full spark ${s.color} shadow-[0_0_8px_currentColor]`}
          style={{
            width: s.size,
            height: s.size,
            left: 'calc(50% + 100px)',
            top: '50%',
            '--tw-translate-x': `${s.x}px`,
            '--tw-translate-y': `${s.y}px`
          } as any}
        />
      ))}
    </div>
  );
};

export const FireParticles: React.FC<{ active: boolean; isBlue?: boolean; isLarge?: boolean }> = ({ active, isBlue, isLarge }) => {
  if (!active) return null;

  const colors = isBlue ? {
    glow: 'bg-blue-600/30 shadow-[0_0_50px_#2563eb]',
    outer: 'bg-blue-700 shadow-[0_0_20px_#1e40af]',
    mid: 'bg-blue-400 shadow-[0_0_15px_#60a5fa]',
    inner: 'bg-cyan-300 shadow-[0_0_10px_#67e8f9]',
    core: 'bg-white'
  } : {
    glow: 'bg-orange-600/30 shadow-[0_0_40px_#ea580c]',
    outer: 'bg-red-700 shadow-[0_0_20px_#991b1b]',
    mid: 'bg-orange-600 shadow-[0_0_15px_#ea580c]',
    inner: 'bg-orange-400 shadow-[0_0_10px_#fb923c]',
    core: 'bg-orange-200'
  };

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50 transition-transform duration-500 ${isLarge ? 'scale-[2.5]' : ''}`}>
      <div className="relative bottom-10 flex items-center justify-center">
        <div className={`absolute w-24 h-40 blur-[40px] rounded-full animate-pulse ${colors.glow}`}></div>
        <div className={`absolute w-14 h-28 rounded-full flame-real opacity-60 mix-blend-screen ${colors.outer}`}></div>
        <div className={`absolute w-10 h-22 rounded-full flame-real mix-blend-screen opacity-90 ${colors.mid}`}></div>
        <div className={`absolute w-6 h-14 rounded-full flame-real mix-blend-screen ${colors.inner}`}></div>
        <div className={`absolute w-3 h-8 rounded-full flame-real opacity-40 ${colors.core}`}></div>
      </div>
    </div>
  );
};

export const SmokeParticles: React.FC<{ active: boolean }> = ({ active }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const interval = setInterval(() => {
      setParticles(prev => [
        ...prev.slice(-15),
        {
          id: Math.random(),
          x: (Math.random() - 0.5) * 40,
          y: -40,
          size: Math.random() * 50 + 20,
          color: 'bg-zinc-600'
        }
      ]);
    }, 150);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute rounded-full smoke-particle ${p.color} blur-[25px] opacity-10`}
          style={{
            width: p.size,
            height: p.size,
            left: `calc(50% + ${p.x}px)`,
            top: `calc(0% + ${p.y}px)`
          }}
        />
      ))}
    </div>
  );
};
