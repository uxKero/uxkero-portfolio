"""Retrato editorial: pasa la foto a tinta sobre papel con trama de puntos.

Entrada:  public/yo2.png (4,8 MB, fondo negro)
Salida:   public/editorial/retrato.png

La trama es un halftone real: cada celda de la grilla se convierte en un punto
cuyo diametro depende de cuanta tinta lleva esa zona. Las filas van corridas
media celda para que no se lea como una cuadricula.

    python design/editorial/tratar_retrato.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

RAIZ = Path(__file__).resolve().parents[2]
ENTRADA = RAIZ / "public" / "yo2.png"
SALIDA = RAIZ / "public" / "editorial" / "retrato.png"

PAPEL = (244, 235, 221)
TINTA = (21, 21, 21)

ANCHO, ALTO = 1050, 1400   # 3:4
CELDA = 7                  # paso de la grilla, en px de salida
SUPER = 3                  # supersampling para que el punto salga suave


def recortar(img: Image.Image) -> Image.Image:
    """Recorte 3:4 cerrado sobre la cabeza y el nacimiento de los hombros.

    El original tiene medio cuerpo sobre fondo negro: encuadrado entero queda
    un tercio de la pieza en negro vacio.
    """
    w, h = img.size
    izq = int(w * 0.10)
    der = int(w * 0.92)
    arriba = int(h * 0.07)
    ancho = der - izq
    alto_util = int(ancho * 4 / 3)
    if arriba + alto_util > h:
        alto_util = h - arriba
    return img.crop((izq, arriba, der, arriba + alto_util))


def preparar(img: Image.Image) -> Image.Image:
    """Gris con las luces levantadas, para que la cara gane la foto."""
    gris = ImageOps.grayscale(img)
    gris = ImageOps.autocontrast(gris, cutoff=(1, 2))
    # Curva suave: aclara los medios tonos sin quemar las altas luces.
    tabla = [min(255, int(255 * (v / 255) ** 0.78)) for v in range(256)]
    return gris.point(tabla)


def tramar(gris: Image.Image) -> Image.Image:
    lienzo = Image.new("RGB", (ANCHO * SUPER, ALTO * SUPER), PAPEL)
    pincel = ImageDraw.Draw(lienzo)
    pixeles = gris.load()

    paso = CELDA * SUPER
    # El punto lleno tiene que tapar la celda entera, incluso en diagonal.
    radio_max = paso * 0.78

    fila = 0
    y = 0
    while y < ALTO * SUPER:
        corrimiento = (paso // 2) if fila % 2 else 0
        x = -corrimiento
        while x < ANCHO * SUPER:
            cx = min(ANCHO - 1, max(0, (x + paso // 2) // SUPER))
            cy = min(ALTO - 1, max(0, (y + paso // 2) // SUPER))
            tinta = 1.0 - pixeles[cx, cy] / 255.0
            if tinta > 0.012:
                r = radio_max * (tinta ** 0.5)
                px, py = x + paso / 2, y + paso / 2
                pincel.ellipse((px - r, py - r, px + r, py + r), fill=TINTA)
            x += paso
        y += paso
        fila += 1

    return lienzo.resize((ANCHO, ALTO), Image.LANCZOS)


def main() -> None:
    original = Image.open(ENTRADA).convert("RGB")
    gris = preparar(recortar(original)).resize((ANCHO, ALTO), Image.LANCZOS)
    salida = tramar(gris)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    salida.save(SALIDA, optimize=True)
    kb = SALIDA.stat().st_size / 1024
    print(f"{SALIDA.relative_to(RAIZ)}  {ANCHO}x{ALTO}  {kb:.0f} KB")


if __name__ == "__main__":
    main()
