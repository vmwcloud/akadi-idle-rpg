'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useGame } from '@/lib/store';
import { useGameLoop } from '@/hooks/useGameLoop';
import { FACTION_COLORS, FACTION_LABELS, ROLE_LABELS, fmt, rarColor } from '@/lib/utils';
import { getLvCost, getExpNeed } from '@/lib/heroes';
import { Hero, Enemy, FloatText, LogEntry } from '@/lib/types';

// ── HP Bar ──
function HpBar({ cur, max, color = '#2ecc71', h = 6 }: { cur: number; max: number; color?: string; h?: number }) {
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  return (
    <div style={{ width: '100%', height: h, borderRadius: h, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, borderRadius: h, background: `linear-gradient(90deg,${color},${color}dd)`, boxShadow: `0 0 6px ${color}44`, transition: 'width 0.3s ease' }} />
    </div>
  );
}

// ── Battle Unit ──
function BattleUnit({ unit, isHero, floats }: { unit: Hero | Enemy; isHero: boolean; floats: FloatText[] }) {
  const dead = unit.s.hp <= 0;
  const accent = isHero ? (FACTION_COLORS[(unit as Hero).faction] || '#3498db') : '#e74c3c';
  const myFloats = floats.filter(f => f.tid === unit.id);

  return (
    <div className={`relative flex flex-col items-center transition-all duration-200 ${dead ? 'opacity-30 scale-90' : ''}`}>
      {myFloats.map(f => (
        <div key={f.id} className="absolute -top-2 left-1/2 -translate-x-1/2 animate-damage pointer-events-none z-20 font-bold whitespace-nowrap"
          style={{ color: f.type === 'heal' ? '#2ecc71' : f.type === 'crit' ? '#ff6b35' : '#e74c3c', fontSize: f.type === 'crit' ? 15 : 12, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
          {f.text}
        </div>
      ))}
      <div className={`relative w-[52px] h-[52px] rounded-xl flex items-center justify-center text-2xl border-2 ${!dead && isHero ? 'animate-float' : ''}`}
        style={{ borderColor: accent, background: 'linear-gradient(135deg,rgba(0,0,0,0.6),rgba(0,0,0,0.3))', boxShadow: dead ? 'none' : `0 0 12px ${accent}33`, filter: dead ? 'grayscale(1)' : 'none' }}>
        {isHero ? (unit as Hero).emoji : (unit as Enemy).emoji}
        <div className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded-md" style={{ background: accent, color: '#0a0e17' }}>
          {isHero ? (unit as Hero).lvl : (unit as Enemy).lvl}
        </div>
        {!isHero && (unit as Enemy).isBoss && <div className="absolute -top-1 -left-1 text-[10px]">👑</div>}
      </div>
      <div className="mt-1 text-[9px] font-semibold truncate max-w-[65px] text-center" style={{ color: dead ? '#555' : '#e8edf5' }}>
        {isHero ? (unit as Hero).name : (unit as Enemy).name}
      </div>
      <div className="w-[52px] mt-0.5"><HpBar cur={unit.s.hp} max={unit.s.maxHp} h={4} color={isHero ? '#2ecc71' : '#e74c3c'} /></div>
      {isHero && <div className="text-[7px] mt-0.5">{'⭐'.repeat((unit as Hero).rar)}</div>}
    </div>
  );
}

// ── Log Colors ──
const LC: Record<string, string> = { damage: '#c8d0dd', heal: '#2ecc71', skill: '#f5a623', death: '#e74c3c', system: '#3498db', loot: '#f5a623', crit: '#ff6b35' };

// ── Tabs ──
type Tab = 'battle' | 'heroes' | 'stats';

export default function GameClient() {
  const [tab, setTab] = useState<Tab>('battle');
  const [ready, setReady] = useState(false);
  const init = useGame(s => s.init);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { init(); setReady(true); }, [init]);
  useGameLoop();

  const g = useGame();
  const deployed = g.heroes.filter(h => h.deployed);
  const dCount = deployed.length;
  const isBoss = g.stage % 10 === 0;
  const canSummon = g.tokens > 0 || g.diamonds >= 100;
  const sorted = [...g.heroes].sort((a, b) => {
    if (a.deployed !== b.deployed) return a.deployed ? -1 : 1;
    if (a.rar !== b.rar) return b.rar - a.rar;
    return b.lvl - a.lvl;
  });

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
        <div className="text-center animate-pulse">
          <Image src="/icon-192.png" alt="Akadi" width={64} height={64} className="mx-auto rounded-2xl mb-3" />
          <div className="text-xl font-bold tracking-widest text-[#f5a623]" style={{ fontFamily: 'Georgia,serif' }}>AKADI</div>
          <div className="text-xs text-[#7a8ba7] mt-1">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col select-none" style={{ background: 'radial-gradient(ellipse at 20% 0%,rgba(52,152,219,0.06),transparent 50%),radial-gradient(ellipse at 80% 100%,rgba(155,89,182,0.06),transparent 50%),#0a0e17', fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-3 py-2.5" style={{ background: 'rgba(17,24,39,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <Image src="/icon-192.png" alt="Akadi" width={36} height={36} className="rounded-lg" />
          <div>
            <div className="text-sm font-bold tracking-widest text-[#e8edf5]" style={{ fontFamily: 'Georgia,serif' }}>AKADI</div>
            <div className="text-[9px] text-[#7a8ba7]">Lv.{g.pLvl} · Stage {g.stage}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.15)' }}>
            <span className="text-[11px]">💰</span><span className="text-xs font-bold text-[#f5a623]">{fmt(g.gold)}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.15)' }}>
            <span className="text-[11px]">💎</span><span className="text-xs font-bold text-[#3498db]">{fmt(g.diamonds)}</span>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="flex-1 px-3 py-3 pb-20 overflow-y-auto">

        {/* ── BATTLE TAB ── */}
        {tab === 'battle' && (
          <div className="space-y-2.5 animate-fade-in">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg,#0d1320,#131b2e 50%,#0d1320)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Stage header */}
              <div className="flex items-center justify-between px-3 py-2" style={{ background: isBoss ? 'linear-gradient(90deg,rgba(231,76,60,0.15),rgba(155,89,182,0.15))' : 'linear-gradient(90deg,rgba(52,152,219,0.1),rgba(46,204,113,0.1))', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-sm font-bold" style={{ fontFamily: 'Georgia,serif', color: isBoss ? '#e74c3c' : '#e8edf5' }}>
                  {isBoss ? '👑 BOSS ' : ''}Stage {g.stage}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => g.setSpeed(g.speed === 1 ? 2 : g.speed === 2 ? 3 : 1)} className="px-2.5 py-1 rounded-lg text-[11px] font-bold active:scale-95 transition-transform"
                    style={{ background: g.speed > 1 ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.06)', color: g.speed > 1 ? '#f5a623' : '#7a8ba7', border: `1px solid ${g.speed > 1 ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                    x{g.speed}
                  </button>
                  <button onClick={g.toggleAuto} className="px-2.5 py-1 rounded-lg text-[11px] font-bold active:scale-95 transition-transform"
                    style={{ background: g.auto ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)', color: g.auto ? '#2ecc71' : '#e74c3c', border: `1px solid ${g.auto ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}` }}>
                    {g.auto ? 'AUTO' : 'PAUSE'}
                  </button>
                </div>
              </div>
              {/* Arena */}
              <div className="px-3 py-4">
                <div className="flex justify-center gap-3.5 mb-5">{g.enemies.map(e => <BattleUnit key={e.id} unit={e} isHero={false} floats={g.floats} />)}</div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)' }} />
                  <span className="text-[10px] tracking-[3px] text-[#7a8ba7]" style={{ fontFamily: 'Georgia,serif' }}>⚔ VS ⚔</span>
                  <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)' }} />
                </div>
                <div className="flex justify-center gap-3.5">
                  {deployed.length ? deployed.map(h => <BattleUnit key={h.id} unit={h} isHero={true} floats={g.floats} />) : <div className="text-xs text-[#7a8ba7]">No heroes deployed!</div>}
                </div>
              </div>
            </div>
            {/* Battle log */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="px-3 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                <span className="text-[10px] tracking-widest text-[#7a8ba7]" style={{ fontFamily: 'Georgia,serif' }}>📜 BATTLE LOG</span>
              </div>
              <div ref={logRef} className="px-3 py-2 max-h-32 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a3550 transparent' }}>
                {g.logs.slice(0, 25).map((l, i) => (
                  <div key={l.id} className="text-[11px] leading-relaxed" style={{ color: LC[l.type] || '#e8edf5', opacity: i < 3 ? 1 : Math.max(0.3, 1 - i * 0.05) }}>{l.msg}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HEROES TAB ── */}
        {tab === 'heroes' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-base font-bold" style={{ fontFamily: 'Georgia,serif', color: '#e8edf5' }}>Heroes</div>
                <div className="text-[10px] text-[#7a8ba7]">{dCount}/5 deployed · {g.heroes.length} total</div>
              </div>
              <button onClick={g.summon} disabled={!canSummon} className="px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg,rgba(155,89,182,0.25),rgba(52,152,219,0.25))', color: '#a78bfa', border: '1px solid rgba(155,89,182,0.3)' }}>
                🌟 Summon {g.tokens > 0 ? `(${g.tokens})` : '(100💎)'}
              </button>
            </div>
            <div className="space-y-2">
              {sorted.map(h => {
                const fc = FACTION_COLORS[h.faction], cost = getLvCost(h.lvl), canLv = g.gold >= cost, canDep = !h.deployed && dCount < 5;
                return (
                  <div key={h.id} className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg,rgba(26,34,53,0.9),rgba(17,24,39,0.9))', border: `1px solid ${h.deployed ? fc + '55' : 'rgba(255,255,255,0.06)'}`, boxShadow: h.deployed ? `0 0 15px ${fc}15` : 'none' }}>
                    <div className="flex gap-2.5">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl border-2" style={{ borderColor: rarColor(h.rar), background: 'rgba(0,0,0,0.4)' }}>{h.emoji}</div>
                        <div className="text-[7px] mt-1">{'⭐'.repeat(h.rar)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[13px] font-bold truncate" style={{ fontFamily: 'Georgia,serif', color: '#e8edf5' }}>{h.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: fc + '22', color: fc }}>Lv.{h.lvl}</span>
                        </div>
                        <div className="flex gap-2 text-[9px] text-[#7a8ba7] mb-1.5">
                          <span style={{ color: fc }}>{FACTION_LABELS[h.faction]}</span>
                          <span>{ROLE_LABELS[h.role]}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[8px] mb-1.5">
                          {([['ATK', h.s.atk, '#e74c3c'], ['DEF', h.s.def, '#3498db'], ['HP', h.s.maxHp, '#2ecc71'], ['SPD', h.s.spd, '#f5a623']] as const).map(([l, v, c]) => (
                            <div key={l} className="text-center py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
                              <div className="text-[#7a8ba7]">{l}</div><div className="font-bold" style={{ color: c }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mb-1.5">
                          <div className="text-[8px] text-[#7a8ba7] mb-0.5">EXP: {h.exp}/{getExpNeed(h.lvl)}</div>
                          <HpBar cur={h.exp} max={getExpNeed(h.lvl)} h={3} color="#3498db" />
                        </div>
                        <div className="text-[8px] px-2 py-1 rounded mb-2" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.15)' }}>
                          <span className="text-[#f5a623]">⚡ {h.skill}:</span> <span className="text-[#7a8ba7]">{h.skillDesc}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => h.deployed ? g.undeploy(h.id) : g.deploy(h.id)} disabled={!h.deployed && !canDep}
                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-30"
                            style={{ background: h.deployed ? 'rgba(231,76,60,0.15)' : 'rgba(46,204,113,0.15)', color: h.deployed ? '#e74c3c' : '#2ecc71', border: `1px solid ${h.deployed ? 'rgba(231,76,60,0.25)' : 'rgba(46,204,113,0.25)'}` }}>
                            {h.deployed ? 'Withdraw' : canDep ? 'Deploy' : 'Full'}
                          </button>
                          <button onClick={() => g.levelUp(h.id)} disabled={!canLv}
                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-30"
                            style={{ background: canLv ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.04)', color: canLv ? '#f5a623' : '#555', border: `1px solid ${canLv ? 'rgba(245,166,35,0.25)' : 'rgba(255,255,255,0.06)'}` }}>
                            ⬆ Lv ({fmt(cost)}g)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          <div className="animate-fade-in">
            <div className="text-base font-bold mb-3" style={{ fontFamily: 'Georgia,serif', color: '#e8edf5' }}>Progression</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {([['👤', 'Player Level', g.pLvl], ['🏔️', 'Max Stage', g.maxStage], ['🦸', 'Total Heroes', g.heroes.length], ['💀', 'Enemies Slain', fmt(g.killed)]] as const).map(([icon, label, val]) => (
                <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-lg mb-0.5">{icon}</div>
                  <div className="text-[9px] text-[#7a8ba7]">{label}</div>
                  <div className="text-sm font-bold text-[#e8edf5]">{val}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-[#7a8ba7]">Stage Progress</span>
                <span className="text-xs font-bold text-[#f5a623]">{g.stage} / {Math.ceil(g.stage / 10) * 10}</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((g.stage % 10) || 10) / 10 * 100}%`, background: 'linear-gradient(90deg,#3498db,#9b59b6)', boxShadow: '0 0 10px rgba(52,152,219,0.4)' }} />
              </div>
              <div className="text-[8px] text-[#7a8ba7] mt-1">Next boss at stage {Math.ceil(g.stage / 10) * 10}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={g.save} className="flex-1 py-2 rounded-xl text-[11px] font-bold active:scale-95 transition-transform" style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.2)' }}>💾 Save</button>
              <button onClick={() => { if (confirm('Reset all progress?')) g.reset(); }} className="flex-1 py-2 rounded-xl text-[11px] font-bold active:scale-95 transition-transform" style={{ background: 'rgba(231,76,60,0.1)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.2)' }}>🗑️ Reset</button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ TAB BAR ═══ */}
      <div className="fixed bottom-0 left-0 right-0 px-3 pb-3 z-50">
        <div className="flex items-center justify-around rounded-2xl py-2" style={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', boxShadow: '0 -4px 30px rgba(0,0,0,0.5)' }}>
          {([['battle', '⚔️', 'Battle'], ['heroes', '🦸', 'Heroes'], ['stats', '📊', 'Stats']] as const).map(([id, icon, label]) => (
            <button key={id} onClick={() => setTab(id as Tab)} className="flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl active:scale-95 transition-transform"
              style={{ background: tab === id ? 'rgba(245,166,35,0.12)' : 'transparent' }}>
              <span className="text-lg" style={{ filter: tab === id ? 'none' : 'grayscale(0.5) opacity(0.6)' }}>{icon}</span>
              <span className="text-[9px] font-bold" style={{ color: tab === id ? '#f5a623' : '#7a8ba7' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
