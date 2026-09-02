# -*- coding: utf-8 -*-
"""Genera las texturas de 16x16 del mundo, en public/mundo/.

Son propias, no de Mojang. 16 por 16 es la resolucion de Minecraft y es lo que hace
que se lea como Minecraft: lo que define el estilo es el tamano de la grilla y el
filtro sin suavizado, no el dibujo exacto.

Cambiar una textura es cambiar su funcion aca y volver a correr esto.
"""
import math, os, random
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(BASE, 'public', 'mundo')
N = 16

if not os.path.isdir(OUT):
    os.makedirs(OUT)


def lienzo(base):
    im = Image.new('RGBA', (N, N), base + (255,))
    return im, im.load()


def ruido(px, base, fuerza, rnd):
    for y in range(N):
        for x in range(N):
            d = rnd.randint(-fuerza, fuerza)
            r, g, b, a = px[x, y]
            px[x, y] = (max(0, min(255, r + d)), max(0, min(255, g + d)),
                        max(0, min(255, b + d)), a)


def suave(semilla, celdas=4):
    """Ruido de manchas: grilla chica al azar interpolada a 16x16. Devuelve 0..1."""
    rnd = random.Random(semilla)
    g = [[rnd.random() for _ in range(celdas + 1)] for _ in range(celdas + 1)]
    out = [[0.0] * N for _ in range(N)]
    paso = float(N) / celdas
    for y in range(N):
        for x in range(N):
            gx, gy = x / paso, y / paso
            x0, y0 = int(gx), int(gy)
            tx, ty = gx - x0, gy - y0
            tx = tx * tx * (3 - 2 * tx)          # suavizado
            ty = ty * ty * (3 - 2 * ty)
            a = g[y0][x0] * (1 - tx) + g[y0][x0 + 1] * tx
            b = g[y0 + 1][x0] * (1 - tx) + g[y0 + 1][x0 + 1] * tx
            out[y][x] = a * (1 - ty) + b * ty
    return out


def mezclar(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def escalonar(t, pasos):
    """Recorta un valor continuo a pocos escalones. Es lo que convierte un degradado
    sucio en colores planos con borde nitido, que es como se ven las de Minecraft."""
    return min(pasos - 1, int(t * pasos)) / float(pasos - 1)


def pintar_suave(im, claro, oscuro, semilla, celdas=4, extra=None):
    px = im.load()
    n = suave(semilla, celdas)
    n2 = suave(semilla + 100, celdas * 2)
    for y in range(N):
        for x in range(N):
            t = min(1.0, max(0.0, n[y][x] * 0.72 + n2[y][x] * 0.28))
            px[x, y] = mezclar(oscuro, claro, t) + (255,)
    if extra:
        extra(px, n)
    return im


def guardar(im, nombre):
    im.save(os.path.join(OUT, nombre + '.png'))
    return nombre


def simple(nombre, base, fuerza=14, semilla=1):
    rnd = random.Random(semilla)
    im, px = lienzo(base)
    ruido(px, base, fuerza, rnd)
    return guardar(im, nombre)


def pasto_arriba():
    """Pasto de arriba: cuatro verdes planos en manchas, mas acentos oscuros sueltos."""
    im = Image.new('RGBA', (N, N))
    px = im.load()
    rnd = random.Random(7)
    n = suave(7, 4)
    n2 = suave(107, 8)
    for y in range(N):
        for x in range(N):
            t = escalonar(min(0.999, n[y][x] * 0.6 + n2[y][x] * 0.4), 4)
            px[x, y] = mezclar((92, 148, 62), (134, 194, 92), t) + (255,)
    for _ in range(22):
        px[rnd.randrange(N), rnd.randrange(N)] = (74, 124, 52, 255)
    for _ in range(12):
        px[rnd.randrange(N), rnd.randrange(N)] = (152, 210, 108, 255)
    return guardar(im, 'pasto_arriba')


def pasto_lado():
    """Costado del bloque de pasto: tierra abajo, franja de pasto arriba, irregular."""
    im = Image.new('RGBA', (N, N))
    px = im.load()
    rnd = random.Random(11)
    n = suave(11, 4)
    for y in range(N):
        for x in range(N):
            t = escalonar(min(0.999, n[y][x]), 3)
            px[x, y] = mezclar((116, 86, 60), (152, 118, 86), t) + (255,)
    for x in range(N):
        h = 3 + rnd.randint(0, 2)
        for y in range(h):
            t = escalonar(rnd.random(), 3)
            px[x, y] = mezclar((92, 148, 62), (134, 194, 92), t) + (255,)
        px[x, h] = (74, 124, 52, 255)                      # borde marcado
    return guardar(im, 'pasto_lado')


def madera():
    rnd = random.Random(3)
    im, px = lienzo((168, 130, 82))
    ruido(px, None, 10, rnd)
    for y in (0, 5, 6, 11, 12, 15):         # juntas horizontales de los tablones
        for x in range(N):
            px[x, y] = (128, 96, 58, 255)
    for (x, y0, y1) in ((5, 0, 6), (11, 6, 12), (3, 12, 16)):
        for y in range(y0, y1):
            px[x, y] = (128, 96, 58, 255)
    return guardar(im, 'madera')


def cobre():
    rnd = random.Random(5)
    im, px = lienzo((196, 122, 84))
    ruido(px, None, 12, rnd)
    for _ in range(18):                     # manchas de oxido
        x, y = rnd.randrange(N), rnd.randrange(N)
        px[x, y] = (122, 168, 140, 255)
    return guardar(im, 'cobre')


def piedra():
    rnd = random.Random(2)
    im, px = lienzo((128, 132, 138))
    ruido(px, None, 18, rnd)
    return guardar(im, 'piedra')


def lana():
    rnd = random.Random(9)
    im, px = lienzo((226, 222, 214))
    ruido(px, None, 8, rnd)
    for y in range(0, N, 4):                # trama tejida
        for x in range(N):
            if (x + y) % 4 == 0:
                px[x, y] = (206, 200, 190, 255)
    return guardar(im, 'lana')


def techo():
    rnd = random.Random(4)
    im, px = lienzo((186, 84, 78))
    ruido(px, None, 12, rnd)
    for x in range(0, N, 4):                # tejas
        for y in range(N):
            px[x, y] = (150, 62, 58, 255)
    return guardar(im, 'techo')


def faro():
    rnd = random.Random(6)
    im, px = lienzo((228, 232, 240))
    ruido(px, None, 7, rnd)
    for y in (7, 8):
        for x in range(N):
            px[x, y] = (200, 206, 218, 255)
    return guardar(im, 'faro')


def luz():
    rnd = random.Random(8)
    im, px = lienzo((246, 214, 120))
    ruido(px, None, 16, rnd)
    for _ in range(20):
        x, y = rnd.randrange(N), rnd.randrange(N)
        px[x, y] = (255, 246, 196, 255)
    return guardar(im, 'luz')


def musgo():
    rnd = random.Random(13)
    im, px = lienzo((92, 118, 70))
    ruido(px, None, 20, rnd)
    for _ in range(30):
        x, y = rnd.randrange(N), rnd.randrange(N)
        px[x, y] = (66, 88, 50, 255)
    return guardar(im, 'musgo')


def oro():
    rnd = random.Random(15)
    im, px = lienzo((236, 196, 88))
    ruido(px, None, 10, rnd)
    for x in range(N):                      # brillo diagonal
        if 0 <= x < N:
            px[x, max(0, x - 2)] = (255, 236, 168, 255)
    return guardar(im, 'oro')


def agua():
    """Agua: bandas planas de azul, no un degradado. Se lee como agua de bloque."""
    im = Image.new('RGBA', (N, N))
    px = im.load()
    n = suave(21, 3)
    for y in range(N):
        for x in range(N):
            onda = math.sin(x * 0.5 + y * 0.22 + n[y][x] * 4.5) * 0.5 + 0.5
            t = escalonar(min(0.999, onda * 0.6 + n[y][x] * 0.4), 4)
            px[x, y] = mezclar((54, 104, 176), (116, 172, 226), t) + (255,)
    return guardar(im, 'agua')


def hojas():
    """Hojas: verdes planos, acentos oscuros y agujeros por donde pasa la luz."""
    im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    px = im.load()
    rnd = random.Random(31)
    n = suave(31, 4)
    n2 = suave(177, 8)
    for y in range(N):
        for x in range(N):
            v = n[y][x] * 0.55 + n2[y][x] * 0.45
            if v < 0.2:
                continue                                  # agujero
            t = escalonar(min(0.999, (v - 0.2) / 0.8), 3)
            px[x, y] = mezclar((46, 92, 44), (104, 158, 70), t) + (255,)
    for _ in range(16):
        x, y = rnd.randrange(N), rnd.randrange(N)
        if px[x, y][3]:
            px[x, y] = (34, 70, 36, 255)
    return guardar(im, 'hojas')


def tronco():
    rnd = random.Random(33)
    im, px = lienzo((110, 84, 56))
    ruido(px, None, 12, rnd)
    for x in (2, 3, 9, 13):
        for y in range(N):
            px[x, y] = (84, 62, 40, 255)
    return guardar(im, 'tronco')


hechas = [
    pasto_arriba(), pasto_lado(), simple('tierra', (134, 102, 74), 15, 12),
    madera(), cobre(), piedra(), lana(), techo(), faro(), luz(), musgo(), oro(),
    agua(), hojas(), tronco(),
]
print('%d texturas de %dx%d en %s' % (len(hechas), N, N, os.path.relpath(OUT, BASE)))
print('  ' + '  '.join(hechas))

def vidrio():
    """Ventana. Alfa parcial para que se vea lo de adentro."""
    im = Image.new('RGBA', (N, N), (150, 200, 226, 90))
    px = im.load()
    for i in range(N):
        px[i, 0] = px[i, N - 1] = px[0, i] = px[N - 1, i] = (206, 226, 240, 220)
    for i in range(2, N - 2):                # reflejo diagonal
        px[i, i] = (232, 244, 252, 150)
    return guardar(im, 'vidrio')


def ladrillo():
    rnd = random.Random(41)
    im, px = lienzo((120, 120, 124))
    ruido(px, None, 14, rnd)
    for y in (0, 7, 15):
        for x in range(N):
            px[x, y] = (92, 92, 96, 255)
    for (x, y0, y1) in ((7, 0, 8), (3, 8, 16), (12, 8, 16)):
        for y in range(y0, y1):
            px[x, y] = (92, 92, 96, 255)
    return guardar(im, 'ladrillo')


def faro_rojo():
    rnd = random.Random(43)
    im, px = lienzo((198, 74, 68))
    ruido(px, None, 10, rnd)
    return guardar(im, 'faro_rojo')


def camino():
    rnd = random.Random(45)
    im, px = lienzo((158, 148, 130))
    ruido(px, None, 22, rnd)
    for _ in range(28):
        x, y = rnd.randrange(N), rnd.randrange(N)
        px[x, y] = (128, 118, 102, 255)
    return guardar(im, 'camino')


def madera_oscura():
    rnd = random.Random(47)
    im, px = lienzo((104, 74, 48))
    ruido(px, None, 10, rnd)
    for y in (0, 5, 6, 11, 12, 15):
        for x in range(N):
            px[x, y] = (76, 52, 32, 255)
    return guardar(im, 'madera_oscura')


def arena():
    rnd = random.Random(49)
    im, px = lienzo((222, 206, 160))
    ruido(px, None, 12, rnd)
    return guardar(im, 'arena')


hechas += [vidrio(), ladrillo(), faro_rojo(), camino(), madera_oscura(), arena()]
print('  + ' + '  '.join(hechas[-6:]))

# ── segunda tanda: materiales con identidad ────────────────────────────────
# Cada construccion tiene que verse distinta de las otras, y eso lo da el material.

def moteada(nombre, claro, oscuro, semilla, pasos=4, celdas=4):
    """Piedra genérica: manchas planas entre dos tonos."""
    im = Image.new('RGBA', (N, N))
    px = im.load()
    n = suave(semilla, celdas)
    n2 = suave(semilla + 50, celdas * 2)
    for y in range(N):
        for x in range(N):
            t = escalonar(min(0.999, n[y][x] * 0.6 + n2[y][x] * 0.4), pasos)
            px[x, y] = mezclar(oscuro, claro, t) + (255,)
    return guardar(im, nombre)


def ladrillos(nombre, claro, oscuro, junta, semilla, alto=4):
    """Aparejo de ladrillo de verdad: hiladas trabadas."""
    im = Image.new('RGBA', (N, N))
    px = im.load()
    n = suave(semilla, 4)
    for y in range(N):
        for x in range(N):
            t = escalonar(min(0.999, n[y][x]), 3)
            px[x, y] = mezclar(oscuro, claro, t) + (255,)
    for y in range(0, N, alto):
        for x in range(N):
            px[x, y] = junta + (255,)
        desfase = (y // alto) % 2 * (N // 4)
        for x in range(desfase, N, N // 2):
            for dy in range(1, alto):
                if y + dy < N:
                    px[x % N, y + dy] = junta + (255,)
    return guardar(im, nombre)


def liso(nombre, base, semilla, fuerza=6):
    """Concreto y cuarzo: casi plano, apenas una variación para que no sea muerto."""
    im = Image.new('RGBA', (N, N))
    px = im.load()
    n = suave(semilla, 3)
    for y in range(N):
        for x in range(N):
            d = int((n[y][x] - 0.5) * fuerza)
            px[x, y] = tuple(max(0, min(255, base[i] + d)) for i in range(3)) + (255,)
    return guardar(im, nombre)


def tablones(nombre, claro, oscuro, junta, semilla):
    im = Image.new('RGBA', (N, N))
    px = im.load()
    n = suave(semilla, 4)
    for y in range(N):
        for x in range(N):
            t = escalonar(min(0.999, n[y][x]), 3)
            px[x, y] = mezclar(oscuro, claro, t) + (255,)
    for y in (0, 5, 6, 11, 12, 15):
        for x in range(N):
            px[x, y] = junta + (255,)
    for (x, y0, y1) in ((5, 0, 6), (11, 6, 12), (3, 12, 16)):
        for y in range(y0, y1):
            px[x, y] = junta + (255,)
    return guardar(im, nombre)


def farol():
    """Farol: hierro oscuro con el corazón encendido."""
    im = Image.new('RGBA', (N, N), (58, 52, 46, 255))
    px = im.load()
    for y in range(3, 13):
        for x in range(3, 13):
            px[x, y] = (255, 224, 150, 255)
    for y in range(5, 11):
        for x in range(5, 11):
            px[x, y] = (255, 246, 206, 255)
    for i in range(N):
        px[i, 0] = px[i, 1] = px[i, N - 1] = px[i, N - 2] = (48, 42, 38, 255)
    for x in (0, 1, 14, 15):
        for y in range(N):
            px[x, y] = (48, 42, 38, 255)
    return guardar(im, 'farol')


def flores(nombre, color):
    """Pasto con flores: se usa como bloque suelto arriba del pasto."""
    im = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    px = im.load()
    rnd = random.Random(hash(nombre) % 999)
    for _ in range(7):
        cx, cy = rnd.randrange(2, N - 3), rnd.randrange(2, N - 3)
        for dy in range(3):
            px[cx, cy + dy] = (74, 124, 52, 255)
        for dx, dy in ((0, -1), (1, 0), (-1, 0), (0, 0)):
            px[cx + dx, cy + dy] = color + (255,)
    return guardar(im, nombre)


hechas += [
    moteada('pizarra', (78, 78, 86), (48, 48, 54), 61, 4),
    moteada('andesita', (150, 152, 152), (118, 120, 122), 63, 4),
    moteada('calcita', (226, 226, 222), (198, 198, 196), 65, 3),
    moteada('blackstone', (56, 50, 58), (32, 28, 34), 67, 4),
    moteada('prismarina', (110, 176, 162), (74, 136, 128), 69, 4),
    ladrillos('ladrillo_rojo', (176, 96, 74), (146, 76, 60), (108, 58, 46), 71, 4),
    ladrillos('ladrillo_barro', (166, 132, 106), (140, 108, 86), (108, 82, 64), 73, 4),
    liso('cuarzo', (236, 233, 226), 75, 8),
    liso('concreto_blanco', (222, 224, 226), 77, 6),
    liso('concreto_celeste', (86, 152, 202), 79, 8),
    liso('concreto_amarillo', (232, 178, 60), 81, 8),
    liso('terracota_naranja', (168, 98, 56), 83, 10),
    tablones('abeto', (122, 92, 62), (96, 70, 46), (74, 54, 36), 85),
    tablones('cerezo', (216, 156, 154), (188, 128, 128), (150, 98, 100), 87),
    moteada('cobre_oxidado', (108, 168, 140), (82, 138, 116), 89, 4),
    moteada('hojas_cerezo', (238, 176, 196), (206, 138, 164), 91, 3),
    farol(),
    flores('flores_rojas', (206, 74, 66)),
    flores('flores_amarillas', (238, 200, 74)),
]
print('  + segunda tanda: %d texturas' % 19)
