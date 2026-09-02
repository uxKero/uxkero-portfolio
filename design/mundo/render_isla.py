# -*- coding: utf-8 -*-
"""Renderiza la isla real, con sus texturas, a un PNG isométrico.

No es la escena de Three.js: es una vista rápida para poder mirar el mundo y
juzgar el diseño sin abrir el navegador. Usa exactamente los mismos bloques y las
mismas texturas, así que lo que se ve acá es lo que hay.

Antes de correr esto hay que exportar mundo.json desde el TypeScript.
"""
import json, os
from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(BASE))
TEX = os.path.join(RAIZ, 'public', 'mundo')

datos = json.load(open(os.path.join(BASE, 'mundo.json')))
tipos, bloques = datos['materiales'], datos['bloques']

E = 2                      # cuantos pixeles de pantalla mide un pixel de textura
TW, TH = 8 * E, 4 * E      # media cara de arriba
TZ = 8 * E                 # altura de un bloque


def cargar(nombre):
    im = Image.open(os.path.join(TEX, nombre + '.png')).convert('RGBA')
    return im.resize((16 * E // 2, 16 * E // 2), Image.NEAREST)


cache = {}


def tex(nombre):
    if nombre not in cache:
        cache[nombre] = cargar(nombre)
    return cache[nombre]


def caras(t):
    nombres = t['tex']
    return tex(nombres[0]), tex(nombres[1])


def sombrear(im, f):
    px = im.copy()
    d = px.load()
    for y in range(px.height):
        for x in range(px.width):
            r, g, b, a = d[x, y]
            d[x, y] = (int(r * f), int(g * f), int(b * f), a)
    return px


def rombo(im):
    """Deforma la cara de arriba a un rombo isométrico."""
    w, h = TW * 2, TH * 2
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    src = im.load()
    dst = out.load()
    n = im.width
    for j in range(n):
        for i in range(n):
            r, g, b, a = src[i, j]
            if not a:
                continue
            cx = int((i - j) * (TW / float(n))) + TW
            cy = int((i + j) * (TH / float(n)))
            for oy in range(max(1, int(TH / float(n)) + 1)):
                for ox in range(max(1, int(TW / float(n)) + 1)):
                    if 0 <= cx + ox < w and 0 <= cy + oy < h:
                        dst[cx + ox, cy + oy] = (r, g, b, a)
    return out


def paralelogramo(im, hacia_derecha, alto):
    """Deforma una cara lateral: se inclina hacia arriba o hacia abajo."""
    w = TW
    out = Image.new('RGBA', (w, alto + TH + 2), (0, 0, 0, 0))
    src = im.load()
    dst = out.load()
    n = im.width
    for j in range(n):
        for i in range(n):
            r, g, b, a = src[i, j]
            if not a:
                continue
            cx = int(i * (TW / float(n)))
            base = int((n - 1 - i) * (TH / float(n))) if hacia_derecha else int(i * (TH / float(n)))
            cy = int(j * (alto / float(n))) + base
            for oy in range(max(1, int(alto / float(n)) + 1)):
                for ox in range(max(1, int(TW / float(n)) + 1)):
                    if 0 <= cx + ox < out.width and 0 <= cy + oy < out.height:
                        dst[cx + ox, cy + oy] = (r, g, b, a)
    return out


preparadas = {}
for i, t in enumerate(tipos):
    a, l = caras(t)
    preparadas[i] = {
        'arriba': rombo(a),
        'izq': paralelogramo(sombrear(l, 0.66), False, TZ),
        'der': paralelogramo(sombrear(l, 0.84), True, TZ),
        'arriba_media': rombo(a),
        'izq_media': paralelogramo(sombrear(l, 0.66), False, TZ // 2),
        'der_media': paralelogramo(sombrear(l, 0.84), True, TZ // 2),
    }

xs = [b[0] for b in bloques]
zs = [b[2] for b in bloques]
ys = [b[1] for b in bloques]
minx, maxx = min(xs), max(xs)
minz, maxz = min(zs), max(zs)
maxy = max(ys)

W = int((maxx - minx + maxz - minz + 4) * TW)
H = int((maxx - minx + maxz - minz + 4) * TH + (maxy + 3) * TZ)
ORIG = (int(-(minx - minz) * TW) + W // 2 - TW, int(TZ * (maxy + 2)))

img = Image.new('RGBA', (W, H), (16, 18, 26, 255))

# pintor: de atrás hacia adelante, y de abajo hacia arriba
bloques.sort(key=lambda b: (b[0] + b[2], b[1]))
for x, y, z, c, f in bloques:
    p = preparadas[c]
    px = ORIG[0] + int((x - z) * TW)
    py = ORIG[1] + int((x + z) * TH) - int(y * TZ)
    if f:
        dy = TZ // 2 if f == 1 else 0
        img.alpha_composite(p['izq_media'], (px - TW, py + TH + dy))
        img.alpha_composite(p['der_media'], (px, py + dy))
        img.alpha_composite(p['arriba_media'], (px - TW, py + dy))
    else:
        img.alpha_composite(p['izq'], (px - TW, py + TH))
        img.alpha_composite(p['der'], (px, py))
        img.alpha_composite(p['arriba'], (px - TW, py))

img = img.crop(img.getbbox())
salida = os.path.join(BASE, 'isla.png')
img.convert('RGB').save(salida)
print('isla ->', salida, img.size, len(bloques), 'bloques')
