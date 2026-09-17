"""Laminas de los proyectos: pasa cada imagen a tinta sobre papel.

Entrada:  design/editorial/fuente/*.png|jpg
          (og:image de cada sitio, o captura de la home cuando no tiene)
Salida:   public/editorial/proyectos/<slug>.jpg
          public/editorial/proyectos-color/<slug>.jpg (mismo encuadre, sin duotono,
          para los diseños que viven del color)

Las og:image de los proyectos vienen cada una con su propia direccion de arte:
juntas rompen el reparto de color de la publicacion. Pasadas a duotono papel
y tinta se leen como laminas impresas y entran en el mismo sistema.

Se probo tambien con trama de puntos, como el retrato, pero a este tamano se
come los textos de las interfaces.

    python design/editorial/laminas.py
"""

from pathlib import Path

from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parents[2]
FUENTE = Path(__file__).resolve().parent / "fuente"
SALIDA = RAIZ / "public" / "editorial" / "proyectos"
SALIDA_COLOR = RAIZ / "public" / "editorial" / "proyectos-color"

PAPEL = (244, 235, 221)
TINTA = (26, 25, 23)

ANCHO, ALTO = 720, 378  # 1200x630 a escala, que es lo que mide una og:image

# Nombre del archivo de origen por proyecto.
LAMINAS = {
    "kerocraft": "kerocraft.jpg",
    "voybien": "voybien.jpg",
    "clow": "clow.png",
    "anydesign": "gh-anydesign.png",
    "lastmemory": "gh-lastmemory.png",
    "saga": "gh-optimize-search-answers-agents.png",
    "clawdows": "gh-clawdows.png",
    "elcubil": "journeyden.png",
    "afondo": "afondo.jpg",
    "kanau": "kanau.png",
    "pokialert": "pokialert.png",
    "prodegame": "prodegame.jpg",
}


def encuadre(origen: Path) -> Image.Image:
    im = Image.open(origen).convert("RGB")
    return ImageOps.fit(im, (ANCHO, ALTO), Image.LANCZOS, centering=(0.5, 0.5))


def lamina(origen: Path) -> Image.Image:
    im = encuadre(origen)
    gris = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=(1, 1))
    # Un punto de gamma para que los medios tonos no se cierren.
    gris = gris.point([min(255, int(255 * (v / 255) ** 0.9)) for v in range(256)])
    return ImageOps.colorize(gris, black=TINTA, white=PAPEL)


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    SALIDA_COLOR.mkdir(parents=True, exist_ok=True)
    total = 0
    for slug, archivo in LAMINAS.items():
        origen = FUENTE / archivo
        if not origen.exists():
            print(f"falta {archivo}")
            continue
        destino = SALIDA / f"{slug}.jpg"
        lamina(origen).save(destino, quality=84, optimize=True, progressive=True)
        encuadre(origen).save(SALIDA_COLOR / f"{slug}.jpg", quality=84, optimize=True, progressive=True)
        kb = destino.stat().st_size / 1024
        total += kb
        print(f"{slug:12} {kb:6.0f} KB")
    print(f"{'total':12} {total:6.0f} KB")


if __name__ == "__main__":
    main()
