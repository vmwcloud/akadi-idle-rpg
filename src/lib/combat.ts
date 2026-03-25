import { Hero, Enemy, LogEntry, FloatText } from './types';
import { genId } from './heroes';

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

function calcDmg(atk: number, def: number, cr: number, cd: number) {
  const base = Math.max(1, atk - def * 0.5);
  const v = 0.9 + Math.random() * 0.2;
  const isCrit = Math.random() < cr;
  return { dmg: Math.floor(base * v * (isCrit ? cd : 1)), isCrit };
}

export interface CombatResult {
  heroes: Hero[]; enemies: Enemy[];
  logs: LogEntry[]; floats: FloatText[];
  goldE: number; xpE: number; killE: number;
}

export function combatTick(heroes: Hero[], enemies: Enemy[]): CombatResult {
  const h = heroes.map(x => ({ ...x, s: { ...x.s } }));
  const e = enemies.map(x => ({ ...x, s: { ...x.s } }));
  const logs: LogEntry[] = [], floats: FloatText[] = [];
  let goldE = 0, xpE = 0, killE = 0;
  const log = (msg: string, type: LogEntry['type']) => logs.push({ id: genId(), msg, type });

  const deployed = h.filter(x => x.deployed && x.s.hp > 0);
  const alive = e.filter(x => x.s.hp > 0);
  if (!deployed.length || !alive.length) return { heroes: h, enemies: e, logs, floats, goldE, xpE, killE };

  type C = { t: 'h'; r: Hero } | { t: 'e'; r: Enemy };
  const order: C[] = [
    ...deployed.map(r => ({ t: 'h' as const, r })),
    ...alive.map(r => ({ t: 'e' as const, r })),
  ].sort((a, b) => b.r.s.spd - a.r.s.spd);

  for (const c of order) {
    const lh = h.filter(x => x.deployed && x.s.hp > 0);
    const le = e.filter(x => x.s.hp > 0);
    if (!lh.length || !le.length) break;

    if (c.t === 'h') {
      const hero = c.r;
      if (hero.s.hp <= 0) continue;

      if (hero.curCd <= 0) {
        log(`⚡ ${hero.emoji} ${hero.name} uses ${hero.skill}!`, 'skill');
        hero.curCd = hero.cd;

        if (hero.role === 'support') {
          const w = [...lh].sort((a, b) => a.s.hp / a.s.maxHp - b.s.hp / b.s.maxHp)[0];
          if (w) {
            const amt = Math.floor(w.s.maxHp * 0.3);
            w.s.hp = Math.min(w.s.maxHp, w.s.hp + amt);
            log(`💚 ${w.name} +${amt} HP`, 'heal');
            floats.push({ id: genId(), tid: w.id, text: `+${amt}`, type: 'heal' });
            if (hero.faction === 'celestial') {
              lh.filter(a => a.id !== w.id && a.s.hp > 0).forEach(a => {
                const sh = Math.floor(a.s.maxHp * 0.15);
                a.s.hp = Math.min(a.s.maxHp, a.s.hp + sh);
                floats.push({ id: genId(), tid: a.id, text: `+${sh}`, type: 'heal' });
              });
            }
          }
        } else if (hero.role === 'mage') {
          const mult = hero.faction === 'graveborn' ? 1.4 : 1.6;
          for (const en of le) {
            if (en.s.hp <= 0) continue;
            const d = Math.max(1, Math.floor(hero.s.atk * mult - en.s.def * 0.3));
            en.s.hp = Math.max(0, en.s.hp - d);
            floats.push({ id: genId(), tid: en.id, text: `-${d}`, type: 'damage' });
            if (hero.faction === 'graveborn') hero.s.hp = Math.min(hero.s.maxHp, hero.s.hp + Math.floor(d * 0.3));
            if (en.s.hp <= 0) { log(`${en.emoji} ${en.name} slain!`, 'death'); goldE += en.gold; xpE += en.xp; killE++; }
          }
        } else if (hero.role === 'warrior') {
          const t = [...le].sort((a, b) => a.s.hp - b.s.hp)[0];
          if (t) {
            const bm = hero.faction === 'mauler' ? 2.0 + (1 - hero.s.hp / hero.s.maxHp) : 2.2;
            const d = Math.max(1, Math.floor(hero.s.atk * bm - t.s.def * 0.3));
            t.s.hp = Math.max(0, t.s.hp - d);
            log(`💥 ${t.name} -${d}`, 'crit');
            floats.push({ id: genId(), tid: t.id, text: `-${d}`, type: 'crit' });
            if (t.s.hp <= 0) { log(`${t.emoji} ${t.name} slain!`, 'death'); goldE += t.gold; xpE += t.xp; killE++; }
          }
        } else if (hero.role === 'ranger') {
          const t = [...le].sort((a, b) => b.s.atk - a.s.atk)[0];
          if (t) {
            const m = hero.faction === 'graveborn' ? 2.5 : 2.0;
            const d = Math.max(1, Math.floor(hero.s.atk * m - t.s.def * 0.2));
            t.s.hp = Math.max(0, t.s.hp - d);
            log(`🎯 ${t.name} -${d}`, 'crit');
            floats.push({ id: genId(), tid: t.id, text: `-${d}`, type: 'crit' });
            if (t.s.hp <= 0) { log(`${t.emoji} ${t.name} slain!`, 'death'); goldE += t.gold; xpE += t.xp; killE++; }
          }
        } else {
          hero.s.def = Math.floor(hero.s.def * 1.3);
          log(`🛡️ ${hero.name} DEF up!`, 'system');
        }
      } else {
        const t = pick(le);
        if (t?.s.hp > 0) {
          const { dmg, isCrit } = calcDmg(hero.s.atk, t.s.def, hero.s.cr, hero.s.cd);
          t.s.hp = Math.max(0, t.s.hp - dmg);
          log(`${hero.emoji} ${hero.name} → ${t.emoji} ${t.name} ${dmg}${isCrit ? ' 💥' : ''}`, isCrit ? 'crit' : 'damage');
          floats.push({ id: genId(), tid: t.id, text: `-${dmg}`, type: isCrit ? 'crit' : 'damage' });
          if (t.s.hp <= 0) { log(`${t.emoji} ${t.name} slain!`, 'death'); goldE += t.gold; xpE += t.xp; killE++; }
        }
        hero.curCd = Math.max(0, hero.curCd - 1);
      }
    } else {
      const en = c.r;
      if (en.s.hp <= 0) continue;
      const t = pick(lh);
      if (t?.s.hp > 0) {
        const { dmg, isCrit } = calcDmg(en.s.atk, t.s.def, en.s.cr, en.s.cd);
        t.s.hp = Math.max(0, t.s.hp - dmg);
        log(`${en.emoji} ${en.name} → ${t.emoji} ${t.name} ${dmg}${isCrit ? ' 💥' : ''}`, isCrit ? 'crit' : 'damage');
        floats.push({ id: genId(), tid: t.id, text: `-${dmg}`, type: isCrit ? 'crit' : 'damage' });
        if (t.s.hp <= 0) log(`${t.emoji} ${t.name} fallen!`, 'death');
      }
    }
  }

  if (goldE > 0) log(`💰 +${goldE} gold, +${xpE} EXP`, 'loot');
  return { heroes: h, enemies: e, logs, floats, goldE, xpE, killE };
}
