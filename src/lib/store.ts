import { create } from 'zustand';
import { Hero, Enemy, LogEntry, FloatText } from './types';
import { makeHero, levelUpHero, getLvCost, genId, TEMPLATES, scaleStats, getRarRand } from './heroes';
import { genEnemies } from './enemies';
import { combatTick } from './combat';

const SAVE = 'akadi_v2';

interface Game {
  gold: number; diamonds: number; stage: number; maxStage: number; pLvl: number;
  heroes: Hero[]; enemies: Enemy[];
  logs: LogEntry[]; floats: FloatText[];
  auto: boolean; speed: number; tokens: number; killed: number;
  lastOn: number;
}

interface Actions {
  init: () => void; tick: () => void;
  toggleAuto: () => void; setSpeed: (s: number) => void;
  deploy: (id: string) => void; undeploy: (id: string) => void;
  levelUp: (id: string) => void; summon: () => void;
  save: () => void; reset: () => void; clearFloats: () => void;
}

function fresh(): Game {
  const h1 = makeHero(0,1,1,true), h2 = makeHero(2,1,1,true), h3 = makeHero(1,1,1,true);
  return {
    gold:200, diamonds:10, stage:1, maxStage:1, pLvl:1,
    heroes:[h1,h2,h3], enemies:genEnemies(1),
    logs:[{id:genId(),msg:'⚔️ Welcome to Akadi!',type:'system'}],
    floats:[], auto:true, speed:1, tokens:3, killed:0, lastOn:Date.now(),
  };
}

function load(): Game {
  if (typeof window === 'undefined') return fresh();
  try {
    const raw = localStorage.getItem(SAVE);
    if (!raw) return fresh();
    const g = JSON.parse(raw) as Game;
    const now = Date.now(), elapsed = Math.min((now - g.lastOn) / 1000, 28800);
    if (elapsed > 60) {
      const idleG = Math.floor(elapsed * 5 * g.stage * 0.5);
      const idleX = Math.floor(elapsed * 2 * g.stage * 0.3);
      g.gold += idleG;
      g.logs.unshift({ id: genId(), msg: `🌙 Welcome back! +${idleG} gold, +${idleX} EXP (${Math.floor(elapsed/60)} min away)`, type: 'loot' });
      const dep = g.heroes.filter(h => h.deployed);
      if (dep.length) {
        const each = Math.floor(idleX / dep.length);
        g.heroes = g.heroes.map(h => h.deployed ? { ...h, exp: h.exp + each } : h);
      }
    }
    g.lastOn = now;
    if (!g.enemies?.length) g.enemies = genEnemies(g.stage);
    return g;
  } catch { return fresh(); }
}

export const useGame = create<Game & Actions>((set, get) => ({
  ...fresh(),

  init: () => set(load()),

  tick: () => set(g => {
    if (!g.auto) return g;
    const dep = g.heroes.filter(h => h.deployed && h.s.hp > 0);
    const alv = g.enemies.filter(e => e.s.hp > 0);

    // All enemies dead → next stage
    if (alv.length === 0) {
      const ns = g.stage + 1, nms = Math.max(g.maxStage, ns);
      return {
        ...g, stage: ns, maxStage: nms, pLvl: Math.floor(nms/5)+1,
        enemies: genEnemies(ns),
        heroes: g.heroes.map(h => ({ ...h, s: { ...h.s, hp: h.deployed ? Math.min(h.s.maxHp, h.s.hp + Math.floor(h.s.maxHp * 0.3)) : h.s.hp }, curCd: 0 })),
        logs: [{ id: genId(), msg: ns%10===0 ? `🏰 BOSS STAGE ${ns}!` : `📍 Stage ${ns}...`, type: 'system' }, ...g.logs.slice(0, 39)],
      };
    }
    // All heroes dead → retry
    if (dep.length === 0) {
      return {
        ...g, enemies: genEnemies(g.stage),
        heroes: g.heroes.map(h => ({ ...h, s: { ...h.s, hp: h.deployed ? h.s.maxHp : h.s.hp }, curCd: 0 })),
        logs: [{ id: genId(), msg: `💫 Retrying Stage ${g.stage}...`, type: 'system' }, ...g.logs.slice(0, 39)],
      };
    }

    const r = combatTick(g.heroes, g.enemies);
    let heroes = r.heroes;
    if (r.xpE > 0) {
      const ld = heroes.filter(h => h.deployed && h.s.hp > 0);
      const each = Math.floor(r.xpE / Math.max(1, ld.length));
      heroes = heroes.map(h => h.deployed && h.s.hp > 0 ? { ...h, exp: h.exp + each } : h);
    }
    return {
      ...g, heroes, enemies: r.enemies,
      gold: g.gold + r.goldE, killed: g.killed + r.killE,
      logs: [...r.logs, ...g.logs].slice(0, 40),
      floats: r.floats,
    };
  }),

  toggleAuto: () => set(g => ({ auto: !g.auto })),
  setSpeed: (s) => set({ speed: s }),

  deploy: (id) => set(g => {
    if (g.heroes.filter(h => h.deployed).length >= 5) return g;
    return { heroes: g.heroes.map(h => h.id === id ? { ...h, deployed: true, s: { ...h.s, hp: h.s.maxHp }, curCd: 0 } : h) };
  }),
  undeploy: (id) => set(g => ({ heroes: g.heroes.map(h => h.id === id ? { ...h, deployed: false } : h) })),

  levelUp: (id) => set(g => {
    const h = g.heroes.find(x => x.id === id);
    if (!h) return g;
    const cost = getLvCost(h.lvl);
    if (g.gold < cost) return g;
    const up = levelUpHero(h);
    return {
      gold: g.gold - cost,
      heroes: g.heroes.map(x => x.id === id ? up : x),
      logs: [{ id: genId(), msg: `⬆️ ${h.emoji} ${h.name} → Lv.${up.lvl}!`, type: 'system' }, ...g.logs.slice(0, 39)],
    };
  }),

  summon: () => set(g => {
    if (g.tokens <= 0 && g.diamonds < 100) return g;
    const ti = Math.floor(Math.random() * TEMPLATES.length), rar = getRarRand();
    const lvl = Math.max(1, Math.floor(g.stage * 0.7));
    const nh = makeHero(ti, lvl, rar, false);
    const useDia = g.tokens <= 0;
    return {
      heroes: [...g.heroes, nh],
      diamonds: useDia ? g.diamonds - 100 : g.diamonds,
      tokens: useDia ? g.tokens : g.tokens - 1,
      logs: [{ id: genId(), msg: `🌟 Summoned ${'⭐'.repeat(rar)} ${nh.emoji} ${nh.name} Lv.${lvl}!`, type: 'system' }, ...g.logs.slice(0, 39)],
    };
  }),

  save: () => {
    if (typeof window === 'undefined') return;
    const s = get();
    try { localStorage.setItem(SAVE, JSON.stringify({ ...s, floats: [], lastOn: Date.now(), logs: s.logs.slice(0, 20) })); } catch {}
  },

  reset: () => { if (typeof window !== 'undefined') localStorage.removeItem(SAVE); set(fresh()); },
  clearFloats: () => set({ floats: [] }),
}));
