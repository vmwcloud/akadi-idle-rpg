import { Enemy, Stats } from './types';
import { genId } from './heroes';

const NAMES = ['Shadow Imp','Goblin Scout','Skeleton','Dark Acolyte','Venom Spider','Cave Troll','Fire Elemental','Ice Wraith','Necro Knight','Demon Soldier'];
const BOSS_NAMES = ['Gorrath the Destroyer','Queen Arachnia','Lord Vexmor','Dread King Malachar','Infernal Harbinger','Lich Emperor Zorath'];
const EMOJIS = ['👹','💀','🦇','🐉','👻','🕷️','🔥','❄️','⚰️','😈'];
const BOSS_EMOJIS = ['👿','🐲','☠️','🧟','👾'];

const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export function genEnemies(stage: number): Enemy[] {
  const boss = stage % 10 === 0;
  const n = boss ? 1 : Math.min(3, 1 + Math.floor(stage / 5));
  return Array.from({ length: n }, (_, i) => {
    const isBoss = boss && i === 0;
    const lvl = Math.max(1, stage + Math.floor(Math.random() * 3) - 1);
    const bm = 1 + (lvl - 1) * 0.15, m = bm * (isBoss ? 3.5 : 1);
    const maxHp = Math.floor((180 + Math.random() * 80) * m);
    const s: Stats = {
      maxHp, hp: maxHp,
      atk: Math.floor((25 + Math.random() * 20) * m),
      def: Math.floor((15 + Math.random() * 15) * m),
      spd: Math.floor(6 + Math.random() * 8 + lvl * 0.3),
      cr: 0.05 + stage * 0.002, cd: 1.5,
    };
    return {
      id: genId(), name: isBoss ? pick(BOSS_NAMES) : pick(NAMES),
      emoji: isBoss ? pick(BOSS_EMOJIS) : pick(EMOJIS),
      lvl, s, isBoss,
      gold: Math.floor((20 + stage * 8) * (isBoss ? 5 : 1)),
      xp: Math.floor((15 + stage * 5) * (isBoss ? 4 : 1)),
    };
  });
}
