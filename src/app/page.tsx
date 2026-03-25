'use client';
import dynamic from 'next/dynamic';

const GameClient = dynamic(() => import('@/components/GameClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
      <div className="text-center animate-pulse">
        <div className="text-4xl mb-3">⚔️</div>
        <div className="text-xl font-bold tracking-widest text-[#f5a623]" style={{ fontFamily: 'Georgia,serif' }}>AKADI</div>
        <div className="text-xs text-[#7a8ba7] mt-1">Loading...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return <GameClient />;
}
