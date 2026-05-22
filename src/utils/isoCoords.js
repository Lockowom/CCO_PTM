// utils/isoCoords.js

export const TILE_WIDTH = 100;
export const TILE_HEIGHT = 100;
export const ELEVATION_STEP = 80; 
export const AISLE_SPACING = 150; 

export const get3DCoords = (pasilloStr, columna, nivel) => {
  const pasilloNum = pasilloStr.charCodeAt(0) - 64; 
  
  // Posición real en el espacio 3D
  const x = columna * TILE_WIDTH;
  const y = pasilloNum * (TILE_HEIGHT + AISLE_SPACING);
  const z = nivel * ELEVATION_STEP;

  return { x, y, z };
};