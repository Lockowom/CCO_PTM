export function runRules(rules = [], context = {}) {
  return rules.map((rule) => {
    const result = Boolean(rule.when?.(context));
    return {
      id: rule.id,
      level: rule.level || 'info',
      message: rule.message || '',
      matched: result,
      effect: result ? rule.then?.(context) : null
    };
  });
}

export function hasBlockingRule(results = []) {
  return results.some((result) => result.matched && result.level === 'error');
}
