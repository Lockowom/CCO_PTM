export const RACK_CONFIG = {
  'A':  { levels: 3, positions: 50, color: 'indigo' },
  'B':  { levels: 2, positions: 50, color: 'purple' },
  'C':  { levels: 3, positions: 50, color: 'emerald' },
  'C2': { levels: 1, positions: 50, color: 'teal' },
  'D':  { levels: 4, positions: 44, color: 'orange', levelCap: { 4: 38 } },
  'E':  { levels: 3, positions: 36, color: 'rose' },
  'F':  { levels: 4, positions: 36, color: 'fuchsia' },
  'G':  { levels: 4, positions: 34, color: 'blue' },
  'H':  { levels: 4, positions: 12, color: 'slate' },
  'I':  { levels: 3, positions: 12, color: 'zinc' }
};

export const getPositionsForLevel = (rackId, level) => {
  const config = RACK_CONFIG[rackId];
  if (!config || level > config.levels) return 0;
  if (config.levelCap && config.levelCap[level] !== undefined) return config.levelCap[level];
  return config.positions;
};

export const TOTAL_POSITIONS = Object.entries(RACK_CONFIG)
  .reduce((sum, [rackId, rack]) => {
    let rackTotal = 0;
    for (let lvl = 1; lvl <= rack.levels; lvl++) {
      rackTotal += getPositionsForLevel(rackId, lvl);
    }
    return sum + rackTotal;
  }, 0);

export const MAX_LEVELS = Math.max(...Object.values(RACK_CONFIG).map(r => r.levels));
