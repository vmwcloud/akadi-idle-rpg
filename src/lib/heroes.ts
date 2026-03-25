import { Hero, Stats, Faction, Role } from './types';

export interface HeroTemplate {
  name: string; faction: Faction; role: Role; emoji: string;
  skill: string; skillDesc: string; cd: number;
  base: { hp: number; atk: number; def: number; spd: number; cr: number; cd: number };
}

export const TEMPLATES: HeroTemplate[] = [
  { name:'Valerius', faction:'lightbearer', role:'tank', emoji:'🛡️', skill:'Divine Shield', skillDesc:'Reduces damage taken by 50% for 2 turns', cd:4, base:{hp:320,atk:35,def:45,spd:8,cr:0.05,cd:1.5} },
  { name:'Lyra', faction:'lightbearer', role:'support', emoji:'✨', skill:'Radiant Heal', skillDesc:'Heals most wounded ally for 30% max HP', cd:3, base:{hp:200,atk:40,def:25,spd:12,cr:0.1,cd:1.5} },
  { name:'Kael', faction:'mauler', role:'warrior', emoji:'⚔️', skill:'Berserker Slash', skillDesc:'Deals 220% ATK damage, more at low HP', cd:3, base:{hp:260,atk:55,def:30,spd:10,cr:0.15,cd:1.8} },
  { name:'Zara', faction:'mauler', role:'ranger', emoji:'🏹', skill:'Piercing Arrow', skillDesc:'180% ATK piercing shot to all enemies', cd:4, base:{hp:210,atk:60,def:20,spd:14,cr:0.2,cd:2.0} },
  { name:'Thornweald', faction:'wilder', role:'mage', emoji:'🌿', skill:"Nature's Wrath", skillDesc:'160% ATK vine damage to all foes', cd:3, base:{hp:190,atk:65,def:22,spd:11,cr:0.12,cd:1.7} },
  { name:'Fenris', faction:'wilder', role:'warrior', emoji:'🐺', skill:'Savage Bite', skillDesc:'Leaps at weakest enemy for 220% ATK', cd:3, base:{hp:240,atk:52,def:28,spd:13,cr:0.18,cd:1.9} },
  { name:'Morrigan', faction:'graveborn', role:'mage', emoji:'💀', skill:'Soul Drain', skillDesc:'Drains life from enemies, heals self', cd:4, base:{hp:220,atk:62,def:24,spd:9,cr:0.1,cd:1.6} },
  { name:'Shade', faction:'graveborn', role:'ranger', emoji:'🗡️', skill:'Shadow Strike', skillDesc:'250% ATK to strongest enemy', cd:4, base:{hp:180,atk:70,def:18,spd:15,cr:0.25,cd:2.2} },
  { name:'Solara', faction:'celestial', role:'support', emoji:'☀️', skill:'Solar Blessing', skillDesc:'Heals all allies 20% HP, boosts ATK 15%', cd:5, base:{hp:250,atk:45,def:30,spd:11,cr:0.08,cd:1.5} },
  { name:'Aethon', faction:'celestial', role:'warrior', emoji:'⚡', skill:'Thunder Judgment', skillDesc:'200% ATK lightning to random enemy', cd:3, base:{hp:280,atk:58,def:35,spd:12,cr:0.15,cd:1.8} },
  { name:'Grimjaw', faction:'mauler', role:'tank', emoji:'🦁', skill:'War Cry', skillDesc:'Taunts all enemies, gains 30% damage reduction', cd:5, base:{hp:350,atk:30,def:48,spd:7,cr:0.05,cd:1.5} },
  { name:'Ivy', faction:'wilder', role:'support', emoji:'🍃', skill:'Bloom', skillDesc:'Regenerates all allies 10% HP over 3 turns', cd:4, base:{hp:210,atk:38,def:26,spd:13,cr:0.08,cd:1.5} },
];

let uid = 0;
export const genId = () => `${++uid}_${Date.now()}`;

export function scaleStats(b: HeroTemplate['base'], lvl: number, rar: number): Stats {
  const lm = 1 + (lvl - 1) * 0.12, rm = 1 + (rar - 1) * 0.25, m = lm * rm;
  const maxHp = Math.floor(b.hp * m);
  return {
    maxHp, hp: maxHp,
    atk: Math.floor(b.atk * m), def: Math.floor(b.def * m),
    spd: Math.floor(b.spd * (1 + (lvl - 1) * 0.02)),
    cr: Math.min(b.cr + rar * 0.02, 0.6), cd: b.cd + rar * 0.1,
  };
}

export function makeHero(ti: number, lvl = 1, rar = 1, deployed = false): Hero {
  const t = TEMPLATES[ti], s = scaleStats(t.base, lvl, rar);
  const base: Stats = { maxHp: t.base.hp, hp: t.base.hp, atk: t.base.atk, def: t.base.def, spd: t.base.spd, cr: t.base.cr, cd: t.base.cd };
  return {
    id: genId(), ti, name: t.name, faction: t.faction, role: t.role,
    emoji: t.emoji, skill: t.skill, skillDesc: t.skillDesc,
    cd: t.cd, curCd: 0, rar, lvl, exp: 0, s, base, deployed,
  };
}

export function levelUpHero(h: Hero): Hero {
  const nl = h.lvl + 1, ns = scaleStats(TEMPLATES[h.ti].base, nl, h.rar);
  return { ...h, lvl: nl, exp: 0, s: ns };
}

export const getLvCost = (l: number) => Math.floor(100 * Math.pow(l, 1.4));
export const getExpNeed = (l: number) => Math.floor(50 * Math.pow(l, 1.6));
export const getRarRand = () => { const r = Math.random(); return r < 0.01 ? 5 : r < 0.05 ? 4 : r < 0.2 ? 3 : r < 0.5 ? 2 : 1; };
