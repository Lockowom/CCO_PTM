export const RACK_CONFIG = {
  'A': { levels: 3, positions: 28, color: 'indigo' },
  'B': { levels: 3, positions: 28, color: 'purple' },
  'C': { levels: 3, positions: 50, color: 'emerald' },
  'D': { levels: 4, positions: 50, color: 'orange' },
  'E': { levels: 4, positions: 50, color: 'rose' },
  'F': { levels: 4, positions: 50, color: 'fuchsia' },
  'G': { levels: 4, positions: 50, color: 'blue' },
  'H': { levels: 4, positions: 50, color: 'slate' },
  'I': { levels: 4, positions: 36, color: 'zinc' }
};

export const TOTAL_POSITIONS = Object.values(RACK_CONFIG)
  .reduce((sum, rack) => sum + rack.positions * rack.levels, 0);

export const MAX_LEVELS = Math.max(...Object.values(RACK_CONFIG).map(r => r.levels));
