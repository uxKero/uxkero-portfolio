// La caja de la portada se mueve con el puntero y la capa de conexiones tiene
// que seguirla. Este canal les pasa la posición sin atarlas entre sí.

export interface CajaHeroe {
  x: number;
  y: number;
  w: number;
  h: number;
  activa: boolean;
}

let actual: CajaHeroe | null = null;
const oyentes = new Set<(c: CajaHeroe | null) => void>();

export const publicarCaja = (c: CajaHeroe | null) => {
  actual = c;
  oyentes.forEach((f) => f(c));
};

export const escucharCaja = (f: (c: CajaHeroe | null) => void) => {
  oyentes.add(f);
  f(actual);
  return () => {
    oyentes.delete(f);
  };
};
