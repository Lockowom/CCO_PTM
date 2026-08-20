export const calculateGroupVolume = (group) =>
  (Number(group?.cantidad || 0) *
    Number(group?.largo_cm || 0) *
    Number(group?.ancho_cm || 0) *
    Number(group?.alto_cm || 0)) /
  1_000_000;

export const summarizeSelectedLoads = (rows = []) =>
  rows.reduce(
    (summary, row) => ({
      nvs: summary.nvs + 1,
      bultos: summary.bultos + Number(row?.bultos || 0),
      peso: summary.peso + Number(row?.peso_total_kg || 0),
      volumen: summary.volumen + Number(row?.volumen_total_m3 || 0),
      faltan:
        summary.faltan +
        (Number(row?.peso_total_kg || 0) <= 0 || Number(row?.volumen_total_m3 || 0) <= 0 ? 1 : 0)
    }),
    { nvs: 0, bultos: 0, peso: 0, volumen: 0, faltan: 0 }
  );

export const validateCubicageGroups = (groups = [], expectedPackages = 0) => {
  const totalPackages = groups.reduce((total, group) => total + Number(group?.cantidad || 0), 0);
  if (groups.length < 1 || groups.length > 50) {
    return { valid: false, reason: 'GROUP_COUNT', totalPackages };
  }
  if (Number(expectedPackages || 0) > 0 && totalPackages !== Number(expectedPackages)) {
    return { valid: false, reason: 'PACKAGE_MISMATCH', totalPackages };
  }
  const dimensionsAreValid = groups.every(
    (group) =>
      Number(group?.cantidad) >= 1 &&
      Number(group?.cantidad) <= 10000 &&
      [group?.largo_cm, group?.ancho_cm, group?.alto_cm].every(
        (value) => Number(value) >= 1 && Number(value) <= 400
      )
  );
  return {
    valid: dimensionsAreValid,
    reason: dimensionsAreValid ? null : 'INVALID_DIMENSIONS',
    totalPackages
  };
};
