'use client';
import { useEffect, useRef } from 'react';
import { useGame } from '@/lib/store';

export function useGameLoop() {
  const tick = useGame(s => s.tick);
  const save = useGame(s => s.save);
  const clearFloats = useGame(s => s.clearFloats);
  const speed = useGame(s => s.speed);
  const auto = useGame(s => s.auto);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (ref.current) clearInterval(ref.current);
    if (auto) {
      ref.current = setInterval(() => {
        tick();
        save();
        setTimeout(clearFloats, 600);
      }, Math.max(400, 1500 / speed));
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [tick, save, clearFloats, speed, auto]);
}
