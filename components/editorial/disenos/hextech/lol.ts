// ─────────────────────────────────────────────────────────────────────────────
// Recursos de League of Legends desde Data Dragon, el CDN público de Riot, y
// los emblemas desde Community Dragon. Se usan como fan content, con el aviso
// legal que pide Riot en el pie. Cada elección de campeón, ítem o runa está
// atada al significado de lo que acompaña, no puesta al azar.
// ─────────────────────────────────────────────────────────────────────────────

import type { Bi } from '../../editorial-content';

export const VERSION = '16.18.1';
const DD = 'https://ddragon.leagueoflegends.com/cdn';
const CD = 'https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images';

export const splash = (campeon: string, skin: number) => `${DD}/img/champion/splash/${campeon}_${skin}.jpg`;
export const carga = (campeon: string, skin = 0) => `${DD}/img/champion/loading/${campeon}_${skin}.jpg`;
export const retratoCampeon = (campeon: string) => `${DD}/${VERSION}/img/champion/${campeon}.png`;
export const itemIcono = (id: string) => `${DD}/${VERSION}/img/item/${id}.png`;
export const runaIcono = (ruta: string) => `${DD}/img/${ruta}`;
export const emblema = (liga: string) => `${CD}/ranked-emblem/emblem-${liga}.png`;

const MODOS = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/content/src/leagueclient/gamemodeassets';

/** Fondos de sala que usa el cliente para cada modo. */
export const FONDO_SALA = {
  abismo: `${MODOS}/aram/img/gameflow-background.jpg`,
  grieta: `${MODOS}/classic_sru/img/gameflow-background.jpg`,
};

/** Ícono de invocador: K/DA Kai'Sa, el mismo tile que muestra el cliente. */
export const ICONO_INVOCADOR = 'https://cdn.communitydragon.org/latest/champion/Kaisa/tile/skin/14';

/** Arte de portada: K/DA, la cara Holo del sistema. */
export const ARTE = {
  temporada: splash('Ahri', 15),
  holo: splash('Ahri', 28),
  /** La Universidad de Piltover, carta de lugar de Legends of Runeterra (03PZ001). */
  piltover: '/hextech/piltover-universidad.webp',
};

/** Campeones para los retratos del grupo: salen al azar en cada visita. */
export const CAMPEONES_AZAR = [
  'Ahri', 'Akali', 'Ashe', 'Caitlyn', 'Camille', 'Ekko', 'Ezreal', 'Jayce', 'Jinx', 'Kaisa',
  'Lux', 'Orianna', 'Seraphine', 'Vi', 'Viktor', 'Zeri', 'Heimerdinger', 'Jhin', 'Yasuo', 'Yone',
  'Sett', 'Thresh', 'Senna', 'Lulu', 'Ornn', 'Zilean', 'Aphelios', 'Sylas', 'Qiyana', 'Gwen',
  'Vex', 'Viego', 'Nilah', 'Milio', 'Hwei', 'Smolder', 'Aurora', 'Ambessa', 'Mel', 'Yunara',
];

/** Toma `n` campeones distintos al azar. */
export const campeonesAlAzar = (n: number) => {
  const copia = [...CAMPEONES_AZAR];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, n);
};

/** Cada puesto se juega con un campeón que se le parece. */
export const CAMPEON_POR_ORG: Record<string, { campeon: string; motivo: Bi }> = {
  Educabot: { campeon: 'Heimerdinger', motivo: { es: 'El inventor que enseña', en: 'The inventor who teaches' } },
  'Cultura Interactiva': { campeon: 'Viktor', motivo: { es: 'La evolución con IA', en: 'Evolution through AI' } },
  'Cronos Cloud S.A.': { campeon: 'Zilean', motivo: { es: 'El guardián del tiempo', en: 'The keeper of time' } },
  KeroClow: { campeon: 'Ornn', motivo: { es: 'El herrero que construye', en: 'The smith who builds' } },
};

/** El ítem de cada producto. */
export const ITEM_POR_PRODUCTO: Record<string, { id: string } & Bi> = {
  "kerocraft": {
    "id": "3078",
    "es": "Fuerza de la Trinidad",
    "en": "Trinity Force"
  },
  "voybien": {
    "id": "3026",
    "es": "Ángel Guardián",
    "en": "Guardian Angel"
  },
  "clow": {
    "id": "3003",
    "es": "Báculo del Arcángel",
    "en": "Archangel's Staff"
  },
  "anydesign": {
    "id": "3089",
    "es": "Sombrero Mortífero de Rabadon",
    "en": "Rabadon's Deathcap"
  },
  "lastmemory": {
    "id": "3041",
    "es": "Robaalmas de Mejai",
    "en": "Mejai's Soulstealer"
  },
  "elcubil": {
    "id": "1082",
    "es": "El Sello de la Oscuridad",
    "en": "Dark Seal"
  },
  "saga": {
    "id": "2503",
    "es": "Antorcha de Fuegoscuro",
    "en": "Blackfire Torch"
  },
  "clawdows": {
    "id": "3145",
    "es": "Alternador Hextech",
    "en": "Hextech Alternator"
  },
  "pokialert": {
    "id": "3040",
    "es": "Abrazo del Serafín",
    "en": "Seraph's Embrace"
  },
  "afondo": {
    "id": "3152",
    "es": "Cinturón Cohete Hextech",
    "en": "Hextech Rocketbelt"
  },
  "kanau": {
    "id": "4629",
    "es": "Impulso Cósmico",
    "en": "Cosmic Drive"
  },
  "prodegame": {
    "id": "3070",
    "es": "Lágrima de la Diosa",
    "en": "Tear of the Goddess"
  }
};

/** Los árboles de runas, en el orden de los grupos de oficio. */
export const ARBOLES_RUNAS: ({ clave: string; icono: string; runas: ({ icono: string } & Bi)[] } & Bi)[] = [
  {
    "clave": "Inspiration",
    "icono": "perk-images/Styles/7203_Whimsy.png",
    "es": "Inspiración",
    "en": "Inspiration",
    "runas": [
      {
        "icono": "perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png",
        "es": "Aumento Glacial",
        "en": "Glacial Augment"
      },
      {
        "icono": "perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png",
        "es": "Libro de Hechizos Abierto",
        "en": "Unsealed Spellbook"
      },
      {
        "icono": "perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png",
        "es": "Primer Golpe",
        "en": "First Strike"
      },
      {
        "icono": "perk-images/Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png",
        "es": "Destello Hextech",
        "en": "Hextech Flashtraption"
      },
      {
        "icono": "perk-images/Styles/Inspiration/MagicalFootwear/MagicalFootwear.png",
        "es": "Calzado Mágico",
        "en": "Magical Footwear"
      },
      {
        "icono": "perk-images/Styles/Inspiration/CashBack/CashBack2.png",
        "es": "Reembolso",
        "en": "Cash Back"
      },
      {
        "icono": "perk-images/Styles/Inspiration/PerfectTiming/AlchemistCabinet.png",
        "es": "Tónico Triple",
        "en": "Triple Tonic"
      },
      {
        "icono": "perk-images/Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png",
        "es": "Tónico de Distorsión Temporal",
        "en": "Time Warp Tonic"
      }
    ]
  },
  {
    "clave": "Sorcery",
    "icono": "perk-images/Styles/7202_Sorcery.png",
    "es": "Brujería",
    "en": "Sorcery",
    "runas": [
      {
        "icono": "perk-images/Styles/Sorcery/SummonAery/SummonAery.png",
        "es": "Invocación: Aery",
        "en": "Summon Aery"
      },
      {
        "icono": "perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png",
        "es": "Cometa Arcano",
        "en": "Arcane Comet"
      },
      {
        "icono": "perk-images/Styles/Sorcery/PhaseRush/StormraidersSurgeRuneIcon2.png",
        "es": "Arrebato del Cabalgatormentas",
        "en": "Stormraider's Surge"
      },
      {
        "icono": "perk-images/Styles/Sorcery/DeathfireTouch/DEATHFIRE_TOUCH_KEYSTONE.png",
        "es": "Toque de la Muerte Ígnea",
        "en": "Deathfire Touch"
      },
      {
        "icono": "perk-images/Styles/Sorcery/NullifyingOrb/Axiom_Arcanist.png",
        "es": "Arcanista Axiomático",
        "en": "Axiom Arcanist"
      },
      {
        "icono": "perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png",
        "es": "Anillo de Flujo de Maná",
        "en": "Manaflow Band"
      },
      {
        "icono": "perk-images/Styles/Sorcery/NimbusCloak/6361.png",
        "es": "Capa del Nimbo",
        "en": "Nimbus Cloak"
      },
      {
        "icono": "perk-images/Styles/Sorcery/Transcendence/Transcendence.png",
        "es": "Trascendencia",
        "en": "Transcendence"
      }
    ]
  },
  {
    "clave": "Precision",
    "icono": "perk-images/Styles/7201_Precision.png",
    "es": "Precisión",
    "en": "Precision",
    "runas": [
      {
        "icono": "perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png",
        "es": "Estrategia Ofensiva",
        "en": "Press the Attack"
      },
      {
        "icono": "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
        "es": "Cadencia Letal",
        "en": "Lethal Tempo"
      },
      {
        "icono": "perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png",
        "es": "Sobre la Marcha",
        "en": "Fleet Footwork"
      },
      {
        "icono": "perk-images/Styles/Precision/Conqueror/Conqueror.png",
        "es": "Conquistador",
        "en": "Conqueror"
      },
      {
        "icono": "perk-images/Styles/Precision/AbsorbLife/AbsorbLife.png",
        "es": "Absorber Vida",
        "en": "Absorb Life"
      },
      {
        "icono": "perk-images/Styles/Precision/Triumph.png",
        "es": "Triunfo",
        "en": "Triumph"
      },
      {
        "icono": "perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png",
        "es": "Concentración Profunda",
        "en": "Presence of Mind"
      },
      {
        "icono": "perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png",
        "es": "Leyenda: Celeridad",
        "en": "Legend: Alacrity"
      }
    ]
  },
  {
    "clave": "Resolve",
    "icono": "perk-images/Styles/7204_Resolve.png",
    "es": "Valor",
    "en": "Resolve",
    "runas": [
      {
        "icono": "perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png",
        "es": "Agarre del Perpetuo",
        "en": "Grasp of the Undying"
      },
      {
        "icono": "perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png",
        "es": "Réplica",
        "en": "Aftershock"
      },
      {
        "icono": "perk-images/Styles/Resolve/Guardian/Guardian.png",
        "es": "Guardián",
        "en": "Guardian"
      },
      {
        "icono": "perk-images/Styles/Resolve/Demolish/Demolish.png",
        "es": "Demolición",
        "en": "Demolish"
      },
      {
        "icono": "perk-images/Styles/Resolve/FontOfLife/FontOfLife.png",
        "es": "Fuente de Vida",
        "en": "Font of Life"
      },
      {
        "icono": "perk-images/Styles/Resolve/MirrorShell/MirrorShell.png",
        "es": "Golpe de Escudo",
        "en": "Shield Bash"
      },
      {
        "icono": "perk-images/Styles/Resolve/Conditioning/Conditioning.png",
        "es": "Acondicionamiento",
        "en": "Conditioning"
      },
      {
        "icono": "perk-images/Styles/Resolve/SecondWind/SecondWind.png",
        "es": "Segundo Aire",
        "en": "Second Wind"
      }
    ]
  }
];

/** Emblemas de liga para los desafíos, del primero al último. */
export const LIGAS = ['gold', 'platinum', 'emerald', 'diamond'];

export const AVISO_RIOT =
  "UXKERO isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.";
