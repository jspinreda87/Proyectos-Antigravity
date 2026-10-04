/**
 * ========================================================
 * LEVELS DATA & GENERATOR - CUBIC DASH (VERSION LARGA)
 * Niveles sustancialmente más largos (7.000px - 14.000px)
 * con múltiples fases (Cubo, Nave Espacial, Gravedad, Trampolines)
 * y obstáculos perfectamente espaciados para reacción natural.
 * ========================================================
 */

const GRID_SIZE = 40;

const LEVELS = [
  // ----------------------------------------------------
  // NIVEL 1: PASO INICIAL (1 Estrella - Aventura Completa)
  // Longitud: 7.500 píxeles con 5 fases progresivas
  // ----------------------------------------------------
  {
    id: 1,
    name: "Paso Inicial",
    difficulty: "Fácil",
    stars: 1,
    baseSpeed: 330,
    theme: {
      accent: "#00f0ff",
      accentGlow: "rgba(0, 240, 255, 0.4)",
      bgGradient: ["#070a18", "#0b1633"],
      gridColor: "rgba(0, 240, 255, 0.15)",
      floorColor: "#10162e",
      floorBorder: "#00f0ff",
      cubeColor: "#00f0ff"
    },
    length: 7500,
    objects: [
      // FASE 1: CUBO - APRENDIZAJE & SALTOS SUAVES (0 a 2.000 px)
      { type: 'spike', x: 600, y: 0 },
      { type: 'spike', x: 1100, y: 0 },
      { type: 'block', x: 1550, y: 0, w: 80, h: 40 },
      { type: 'star', x: 1590, y: 80 },
      { type: 'spike', x: 1950, y: 0 },

      // FASE 2: TRAMPOLINES Y ORBES (2.000 a 3.300 px)
      { type: 'pad', x: 2350, y: 0 },
      { type: 'star', x: 2500, y: 150 },
      { type: 'block', x: 2750, y: 0, w: 100, h: 40 },
      { type: 'spike', x: 3100, y: 0 },

      // FASE 3: PRIMER VUELO EN NAVE ESPACIAL (3.300 a 5.000 px) 🚀
      { type: 'portal_ship', x: 3400, y: 50 },
      { type: 'star', x: 3750, y: 160 },
      { type: 'spike', x: 4000, y: 0 },
      { type: 'spike_hanging', x: 4450, y: 0 },
      { type: 'star', x: 4700, y: 180 },
      { type: 'block', x: 4950, y: 120, w: 40, h: 70 }, // Obstáculo flotante en el centro

      // FASE 4: REGRESO AL CUBO (5.000 a 6.200 px) 🟩
      { type: 'portal_cube', x: 5300, y: 50 },
      { type: 'spike', x: 5650, y: 0 },
      { type: 'block', x: 6000, y: 0, w: 80, h: 40 },
      { type: 'orb', x: 6250, y: 85 },
      { type: 'spike', x: 6250, y: 0 },

      // FASE 5: RECTA FINAL TRIUNFAL (6.200 a 7.500 px)
      { type: 'pad', x: 6550, y: 0 },
      { type: 'star', x: 6700, y: 150 },
      { type: 'block', x: 6950, y: 0, w: 120, h: 40 },
      { type: 'spike', x: 7250, y: 0 }
    ]
  },

  // ----------------------------------------------------
  // NIVEL 2: SOBRECARGA NEÓN (2 Estrellas - Medio)
  // Longitud: 9.000 píxeles con Gravedad Invertida y Vuelo
  // ----------------------------------------------------
  {
    id: 2,
    name: "Sobrecarga Neón",
    difficulty: "Medio",
    stars: 2,
    baseSpeed: 350,
    theme: {
      accent: "#00ff66",
      accentGlow: "rgba(0, 255, 102, 0.4)",
      bgGradient: ["#051510", "#082a1d"],
      gridColor: "rgba(0, 255, 102, 0.18)",
      floorColor: "#0b2016",
      floorBorder: "#00ff66",
      cubeColor: "#00ff66"
    },
    length: 9000,
    objects: [
      // FASE 1: CUBO NEÓN
      { type: 'spike', x: 600, y: 0 },
      { type: 'block', x: 1050, y: 0, w: 80, h: 40 },
      { type: 'orb', x: 1450, y: 80 },
      { type: 'spike', x: 1450, y: 0 },
      { type: 'spike', x: 1900, y: 0 },

      // FASE 2: GRAVEDAD INVERTIDA EN EL TECHO
      { type: 'portal_gravity_inv', x: 2250, y: 50 },
      { type: 'spike_hanging', x: 2650, y: 0 },
      { type: 'block_ceiling', x: 3050, y: 0, w: 80, h: 40 },
      { type: 'star', x: 3300, y: 140 },
      { type: 'portal_gravity_norm', x: 3550, y: 50 },

      // FASE 3: NAVE ESPACIAL EN TÚNEL DE NEÓN 🚀
      { type: 'portal_ship', x: 3900, y: 50 },
      { type: 'star', x: 4250, y: 170 },
      { type: 'spike', x: 4550, y: 0 },
      { type: 'spike_hanging', x: 4950, y: 0 },
      { type: 'block', x: 5350, y: 0, w: 40, h: 100 },
      { type: 'star', x: 5650, y: 200 },
      { type: 'block_ceiling', x: 5950, y: 0, w: 40, h: 100 },

      // FASE 4: REGRESO A CUBO Y ORBES
      { type: 'portal_cube', x: 6350, y: 50 },
      { type: 'pad', x: 6700, y: 0 },
      { type: 'star', x: 6850, y: 160 },
      { type: 'spike', x: 7100, y: 0 },
      { type: 'orb', x: 7450, y: 85 },
      { type: 'spike', x: 7450, y: 0 },

      // FASE 5: RECTA FINAL
      { type: 'block', x: 7850, y: 0, w: 80, h: 40 },
      { type: 'spike', x: 8200, y: 0 },
      { type: 'block', x: 8550, y: 0, w: 100, h: 40 },
      { type: 'spike', x: 8800, y: 0 }
    ]
  },

  // ----------------------------------------------------
  // NIVEL 3: TORMENTA CUÁNTICA (3 Estrellas - Épico)
  // Longitud: 10.500 píxeles con Aceleraciones y Vuelo Extendido
  // ----------------------------------------------------
  {
    id: 3,
    name: "Tormenta Cuántica",
    difficulty: "Medio-Alto",
    stars: 3,
    baseSpeed: 380,
    theme: {
      accent: "#ff7700",
      accentGlow: "rgba(255, 119, 0, 0.45)",
      bgGradient: ["#1a090b", "#33120d"],
      gridColor: "rgba(255, 119, 0, 0.2)",
      floorColor: "#220e0d",
      floorBorder: "#ff7700",
      cubeColor: "#ff7700"
    },
    length: 10500,
    objects: [
      // FASE 1: CUBO RÍTMICO
      { type: 'spike', x: 600, y: 0 },
      { type: 'block', x: 1050, y: 0, w: 80, h: 40 },
      { type: 'orb', x: 1450, y: 80 },
      { type: 'spike', x: 1450, y: 0 },
      { type: 'pad', x: 1850, y: 0 },
      { type: 'star', x: 2000, y: 150 },

      // FASE 2: NAVE ESPACIAL
      { type: 'portal_ship', x: 2350, y: 50 },
      { type: 'star', x: 2700, y: 170 },
      { type: 'spike', x: 3000, y: 0 },
      { type: 'spike_hanging', x: 3400, y: 0 },
      { type: 'block', x: 3800, y: 50, w: 60, h: 30 },
      { type: 'star', x: 4150, y: 180 },

      // FASE 3: ACELERACIÓN Y CUBO
      { type: 'portal_cube', x: 4500, y: 50 },
      { type: 'portal_speed_fast', x: 4750, y: 0 },
      { type: 'spike', x: 5150, y: 0 },
      { type: 'block', x: 5550, y: 0, w: 80, h: 40 },
      { type: 'orb', x: 5950, y: 85 },
      { type: 'spike', x: 5950, y: 0 },

      // FASE 4: SEGUNDO VUELO EN NAVE
      { type: 'portal_ship', x: 6350, y: 50 },
      { type: 'star', x: 6700, y: 190 },
      { type: 'spike', x: 7000, y: 0 },
      { type: 'spike_hanging', x: 7400, y: 0 },
      { type: 'block_ceiling', x: 7800, y: 0, w: 40, h: 80 },
      { type: 'star', x: 8100, y: 160 },

      // FASE 5: RECTA FINAL
      { type: 'portal_cube', x: 8450, y: 50 },
      { type: 'portal_speed_norm', x: 8700, y: 0 },
      { type: 'pad', x: 9050, y: 0 },
      { type: 'star', x: 9200, y: 160 },
      { type: 'block', x: 9550, y: 0, w: 100, h: 40 },
      { type: 'spike', x: 9950, y: 0 },
      { type: 'spike', x: 10250, y: 0 }
    ]
  },

  // ----------------------------------------------------
  // NIVEL 4: DIMENSIÓN GLITCH (4 Estrellas - Desafío Maestro)
  // Longitud: 12.000 píxeles
  // ----------------------------------------------------
  {
    id: 4,
    name: "Dimensión Glitch",
    difficulty: "Difícil",
    stars: 4,
    baseSpeed: 410,
    theme: {
      accent: "#ff0077",
      accentGlow: "rgba(255, 0, 119, 0.5)",
      bgGradient: ["#140316", "#26062b"],
      gridColor: "rgba(255, 0, 119, 0.25)",
      floorColor: "#1d0722",
      floorBorder: "#ff0077",
      cubeColor: "#ff0077"
    },
    length: 12000,
    objects: [
      { type: 'spike', x: 600, y: 0 },
      { type: 'block', x: 1050, y: 0, w: 80, h: 40 },
      { type: 'pad', x: 1500, y: 0 },
      { type: 'spike', x: 1850, y: 0 },

      // Nave Espacial Glitch
      { type: 'portal_ship', x: 2200, y: 50 },
      { type: 'star', x: 2550, y: 170 },
      { type: 'spike', x: 2850, y: 0 },
      { type: 'spike_hanging', x: 3250, y: 0 },
      { type: 'block', x: 3650, y: 0, w: 40, h: 90 },
      { type: 'star', x: 4000, y: 190 },

      // Cubo y Gravedad Invertida
      { type: 'portal_cube', x: 4400, y: 50 },
      { type: 'portal_gravity_inv', x: 4800, y: 40 },
      { type: 'spike_hanging', x: 5200, y: 0 },
      { type: 'block_ceiling', x: 5600, y: 0, w: 80, h: 40 },
      { type: 'portal_gravity_norm', x: 6000, y: 40 },

      // Nave Espacial Fase 2
      { type: 'portal_ship', x: 6400, y: 50 },
      { type: 'star', x: 6750, y: 170 },
      { type: 'spike', x: 7100, y: 0 },
      { type: 'spike_hanging', x: 7550, y: 0 },
      { type: 'block_ceiling', x: 8000, y: 0, w: 40, h: 90 },

      // Cubo Final
      { type: 'portal_cube', x: 8450, y: 50 },
      { type: 'orb', x: 8850, y: 85 },
      { type: 'spike', x: 8850, y: 0 },
      { type: 'pad', x: 9300, y: 0 },
      { type: 'block', x: 9700, y: 0, w: 100, h: 40 },
      { type: 'spike', x: 10150, y: 0 },
      { type: 'orb', x: 10600, y: 85 },
      { type: 'spike', x: 10600, y: 0 },
      { type: 'block', x: 11100, y: 0, w: 120, h: 40 },
      { type: 'spike', x: 11500, y: 0 }
    ]
  },

  // ----------------------------------------------------
  // NIVEL 5: HIPERESPACIO DIMENSIONAL (5 Estrellas - Demon)
  // Longitud: 14.000 píxeles - La Odisea Cósmica Definitiva
  // ----------------------------------------------------
  {
    id: 5,
    name: "Hiperespacio",
    difficulty: "Demon",
    stars: 5,
    baseSpeed: 440,
    theme: {
      accent: "#ffe600",
      accentGlow: "rgba(255, 230, 0, 0.6)",
      bgGradient: ["#171302", "#302604"],
      gridColor: "rgba(255, 230, 0, 0.28)",
      floorColor: "#211b05",
      floorBorder: "#ffe600",
      cubeColor: "#ffe600"
    },
    length: 14000,
    objects: [
      { type: 'spike', x: 600, y: 0 },
      { type: 'block', x: 1050, y: 0, w: 80, h: 40 },
      { type: 'pad', x: 1500, y: 0 },
      { type: 'star', x: 1650, y: 150 },
      { type: 'spike', x: 1950, y: 0 },

      // Nave Cósmica Fase 1
      { type: 'portal_ship', x: 2350, y: 50 },
      { type: 'star', x: 2700, y: 170 },
      { type: 'spike', x: 3000, y: 0 },
      { type: 'spike_hanging', x: 3450, y: 0 },
      { type: 'block', x: 3900, y: 0, w: 40, h: 100 },
      { type: 'star', x: 4250, y: 200 },

      // Cubo y Gravedad
      { type: 'portal_cube', x: 4650, y: 50 },
      { type: 'orb', x: 5050, y: 85 },
      { type: 'spike', x: 5050, y: 0 },
      { type: 'portal_gravity_inv', x: 5450, y: 40 },
      { type: 'spike_hanging', x: 5850, y: 0 },
      { type: 'portal_gravity_norm', x: 6250, y: 40 },

      // Nave Cósmica Fase 2
      { type: 'portal_ship', x: 6650, y: 50 },
      { type: 'star', x: 7000, y: 180 },
      { type: 'spike', x: 7350, y: 0 },
      { type: 'spike_hanging', x: 7800, y: 0 },
      { type: 'block_ceiling', x: 8250, y: 0, w: 40, h: 90 },

      // Cubo y Aceleración
      { type: 'portal_cube', x: 8700, y: 50 },
      { type: 'portal_speed_fast', x: 9000, y: 0 },
      { type: 'pad', x: 9400, y: 0 },
      { type: 'spike', x: 9750, y: 0 },
      { type: 'orb', x: 10150, y: 85 },
      { type: 'spike', x: 10150, y: 0 },

      // Nave Cósmica Fase 3
      { type: 'portal_ship', x: 10600, y: 50 },
      { type: 'star', x: 10950, y: 170 },
      { type: 'spike', x: 11300, y: 0 },
      { type: 'spike_hanging', x: 11750, y: 0 },

      // Gran Recta Final
      { type: 'portal_cube', x: 12200, y: 50 },
      { type: 'portal_speed_norm', x: 12450, y: 0 },
      { type: 'block', x: 12850, y: 0, w: 100, h: 40 },
      { type: 'pad', x: 13250, y: 0 },
      { type: 'spike', x: 13600, y: 0 }
    ]
  }
];

// Opciones de personalización
const CUBE_SKINS = {
  faces: [
    { id: 'normal', name: 'Ojos Curiosos', emoji: '👀', unlockReq: 'Gratis' },
    { id: 'cool', name: 'Gafas de Sol', emoji: '😎', unlockReq: 'Nivel 1' },
    { id: 'cat', name: 'Gatito Pixel', emoji: '🐱', unlockReq: 'Nivel 2' },
    { id: 'robot', name: 'Visor Cyborg', emoji: '🤖', unlockReq: 'Nivel 3' },
    { id: 'fire', name: 'Fuego Ninja', emoji: '🔥', unlockReq: 'Nivel 4' },
    { id: 'king', name: 'Rey Neón', emoji: '👑', unlockReq: 'Nivel 5' }
  ],
  colors: [
    { id: 'cyan', hex: '#00f0ff', name: 'Cian Neón' },
    { id: 'green', hex: '#00ff66', name: 'Verde Lima' },
    { id: 'pink', hex: '#ff0077', name: 'Rosa Eléctrico' },
    { id: 'yellow', hex: '#ffe600', name: 'Oro Solar' },
    { id: 'purple', hex: '#a855f7', name: 'Púrpura Galáctico' },
    { id: 'orange', hex: '#ff7700', name: 'Fuego Carmesí' }
  ]
};

window.LEVELS = LEVELS;
window.CUBE_SKINS = CUBE_SKINS;
window.GRID_SIZE = GRID_SIZE;
