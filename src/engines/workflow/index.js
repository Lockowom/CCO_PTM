export function buildWorkflowMap(states = [], transitions = []) {
  return {
    statesByCode: Object.fromEntries(states.map((state) => [state.codigo || state.id, state])),
    transitionsByState: transitions.reduce((acc, transition) => {
      const key = transition.desde || '__root__';
      acc[key] = acc[key] || [];
      acc[key].push(transition);
      return acc;
    }, {})
  };
}

export function getAvailableTransitions(workflowMap, stateCode) {
  return workflowMap?.transitionsByState?.[stateCode || '__root__'] || [];
}
