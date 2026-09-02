// Solo contenido. La geometría del mundo se genera con design/mundo/construir_mundo.py
// y vive en /mundo/mundo.json: acá no hay ni un bloque.

export interface Ficha {
  id: string;
  nombre: string;
  rol: string;
  estado: string;
  texto: string;
}

export const CONTENIDO: Ficha[] = [
  {
    id: 'base',
    nombre: 'La base',
    rol: 'KeroClow, independiente',
    estado: 'en curso',
    texto:
      'Acá construyo lo mío. Producto, diseño y desarrollo asistido por agentes, de la idea al deploy sin pasar por nadie. Todo lo que está en la sala de proyectos salió de este taller.',
  },
  {
    id: 'educabot',
    nombre: 'Educabot',
    rol: 'AI Experience Designer',
    estado: 'activo',
    texto:
      'EdTech argentina. Diseño la experiencia de los productos con IA: cómo se conversa con un agente, qué muestra y dónde para. Del otro lado hay chicos y docentes, que es el público que menos perdona una interfaz confusa.',
  },
  {
    id: 'cultura',
    nombre: 'Cultura Interactiva',
    rol: 'Internal Ops & AI Enablement',
    estado: 'activo',
    texto:
      'Operaciones internas y habilitación de IA para equipos en más de veinte países de Latinoamérica. Mapear cómo trabaja la gente, automatizar lo repetido y enseñar a usar lo nuevo sin que se rompa nada en el camino.',
  },
  {
    id: 'voybien',
    nombre: 'VoyBien',
    rol: 'Fundador. Producto, UX y desarrollo',
    estado: 'en vivo',
    texto:
      'Mapa colaborativo de seguridad de Mar del Plata, cuadra por cuadra. Los vecinos puntúan y el planificador de rutas sugiere el camino más seguro con esa información. Lo hice solo y está publicado. Es un faro porque eso hace: mira el territorio y avisa.',
  },
  {
    id: 'prodegame',
    nombre: 'PRODEGAME',
    rol: 'Fundador. Producto, UX y dev asistido por IA',
    estado: 'terminado',
    texto:
      'Está en ruinas porque terminó, y está en el mapa porque lo hice. Lo dejo a la vista a propósito: un portfolio donde todo salió bien no le sirve a nadie.',
  },
  {
    id: 'logros',
    nombre: 'Avances',
    rol: 'Certificaciones',
    estado: 'logros',
    texto: 'Cuatro conseguidos. Los pilares del monumento son uno por cada uno.',
  },
];

export interface Proyecto { nombre: string; que: string; brillo?: boolean; }

export const PROYECTOS: Proyecto[] = [
  { nombre: 'Clow', que: 'Librería de componentes React. Papel, tinta y sakura. Registro compatible con shadcn.' },
  { nombre: 'lastmemory', que: 'Memoria persistente para agentes de código: una red de markdown anclada al repo.' },
  { nombre: 'anydesign', que: 'Skill que lee una imagen, un sitio o un Figma y devuelve el sistema de diseño escrito.', brillo: true },
  { nombre: 'clawdows', que: 'App de bandeja para Windows. Clawd el cangrejo camina mientras Claude trabaja.' },
  { nombre: 'SAGA', que: 'Skill abierta para que cualquier entidad sea encontrable y bien descrita por una IA.' },
  { nombre: 'A Fondo', que: 'Una carrera entera de piloto, de karting a Fórmula 1, hasta donde te alcance la butaca.' },
  { nombre: 'Journeyden', que: 'El Cubil. Un juego con jugadores reales del otro lado.' },
  { nombre: 'Kanau', que: 'App de citas y vida nocturna.' },
];

export const LOGROS = [
  { nombre: 'Enterprise Project Management', de: 'Microsoft', anio: '2025' },
  { nombre: 'UX Design Professional', de: 'Google', anio: '2025' },
  { nombre: 'AI Fluency Framework & Foundations', de: 'Anthropic', anio: '2025' },
  { nombre: 'Claude Code in Action', de: 'Anthropic', anio: '2025' },
];

export const IDENTIDAD = {
  nombre: 'ALAN PONCE',
  rol: 'AI Experience Designer & Product Lead',
  lugar: 'Mar del Plata, Argentina',
};
