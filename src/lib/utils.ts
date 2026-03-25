import { Faction, Role } from './types';

export const FACTION_COLORS: Record<Faction, string> = {
  lightbearer: '#f5c842', mauler: '#e74c3c', wilder: '#2ecc71', graveborn: '#9b59b6', celestial: '#3498db',
};
export const FACTION_LABELS: Record<Faction, string> = {
  lightbearer: 'Lightbearer', mauler: 'Mauler', wilder: 'Wilder', graveborn: 'Graveborn', celestial: 'Celestial',
};
export const ROLE_LABELS: Record<Role, string> = {
  tank: 'Tank', warrior: 'Warrior', mage: 'Mage', support: 'Support', ranger: 'Ranger',
};
export const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : ''+n;
export const rarColor = (r: number) => r>=5?'#ff6b35':r>=4?'#a855f7':r>=3?'#3b82f6':r>=2?'#22c55e':'#9ca3af';
