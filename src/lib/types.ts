export type Faction = 'lightbearer' | 'mauler' | 'wilder' | 'graveborn' | 'celestial';
export type Role = 'tank' | 'warrior' | 'mage' | 'support' | 'ranger';

export interface Stats {
  maxHp: number; hp: number; atk: number; def: number;
  spd: number; cr: number; cd: number;
}

export interface Hero {
  id: string; ti: number; name: string; faction: Faction; role: Role;
  emoji: string; skill: string; skillDesc: string;
  cd: number; curCd: number; rar: number; lvl: number; exp: number;
  s: Stats; base: Stats; deployed: boolean;
}

export interface Enemy {
  id: string; name: string; emoji: string; lvl: number;
  s: Stats; isBoss: boolean; gold: number; xp: number;
}

export interface LogEntry {
  id: string; msg: string; type: 'damage'|'heal'|'skill'|'death'|'system'|'loot'|'crit';
}

export interface FloatText {
  id: string; tid: string; text: string; type: 'damage'|'heal'|'crit';
}
