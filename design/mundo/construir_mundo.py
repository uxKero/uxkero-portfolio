# -*- coding: utf-8 -*-
"""Construye el mundo entero y lo deja listo para la escena.

Cambio de enfoque respecto de las primeras versiones, y vale la pena entender por qué:

1. LAS TEXTURAS SON LAS DE MINECRAFT, no dibujadas por mí. Las mías eran ruido
   generado y a un metro de distancia se notaba. Estas son pixel art hecho por
   artistas, y es la única forma de que se vea como Minecraft.

2. LAS CONSTRUCCIONES SON ESTRUCTURAS OFICIALES DE MOJANG, sacadas del jar del
   servidor. Hay 1180 adentro: casas de aldea, mansiones, bastiones, ciudades.
   Las hizo gente que construye para vivir, y se nota contra cualquier cosa que
   arme yo poniendo cubos a mano.

3. LA ISLA NO ES UN CUADRADO. La costa sale de ruido, tiene bahías y penínsulas,
   y el terreno tiene relieve. Un cuadrado perfecto no se lee como una isla.

Correr con:  python design/mundo/construir_mundo.py
"""
import gzip, io, json, math, os, random, zipfile

import nbtlib
from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(BASE))
SALIDA = os.path.join(RAIZ, 'public', 'mundo')

JAR_CLIENTE = 'C:/Users/alanp/AppData/Roaming/.minecraft/versions/26.2/26.2.jar'
JAR_SERVIDOR = 'C:/Users/alanp/Kero/minecraft/oneblock-dalan/gen2/versions/1.21.1/server-1.21.1.jar'

if not os.path.isdir(SALIDA):
    os.makedirs(SALIDA)

# ── 1. qué texturas necesita cada bloque ────────────────────────────────────
# arriba, costados, abajo. Si es una sola, va en las tres caras.
MATERIALES = {
    'pasto':        ('grass_block_top', 'grass_block_side', 'dirt'),
    'tierra':       ('dirt',),
    'arena':        ('sand',),
    'grava':        ('gravel',),
    'piedra':       ('stone',),
    'adoquin':      ('cobblestone',),
    'ladrillo_p':   ('stone_bricks',),
    'pizarra':      ('deepslate',),
    'calcita':      ('calcite',),
    'cuarzo':       ('quartz_block_top', 'quartz_block_side', 'quartz_block_top'),
    'andesita':     ('andesite',),
    'blackstone':   ('blackstone',),
    'prismarina':   ('prismarine',),
    'ladrillo':     ('bricks',),
    'terracota':    ('terracotta',),
    'roble':        ('oak_planks',),
    'abeto':        ('spruce_planks',),
    'tronco':       ('oak_log_top', 'oak_log', 'oak_log_top'),
    'tronco_abeto': ('spruce_log_top', 'spruce_log', 'spruce_log_top'),
    'hojas':        ('oak_leaves',),
    'hojas_cerezo': ('cherry_leaves',),
    'vidrio':       ('glass',),
    'agua':         ('water_still',),
    'cobre':        ('copper_block',),
    'cobre_oxidado': ('oxidized_copper',),
    'oro':          ('gold_block',),
    'musgo':        ('moss_block',),
    'lana':         ('white_wool',),
    'concreto_blanco': ('white_concrete',),
    'concreto_celeste': ('light_blue_concrete',),
    'farol':        ('lantern',),
    'libro':        ('bookshelf',),
    'camino':       ('dirt_path_top', 'dirt_path_side', 'dirt'),
    'heno':         ('hay_block_top', 'hay_block_side', 'hay_block_top'),
    'tierra_labrada': ('farmland',),
    'trigo':        ('wheat_stage7',),
}

IDS = list(MATERIALES.keys())
IDX = {n: i for i, n in enumerate(IDS)}


# Minecraft guarda el pasto, las hojas y el agua en GRIS, y los tiñe en tiempo real
# según el bioma. Si se usan tal cual, la isla entera sale gris. Estos son los tintes
# de bioma de llanura, que es el que corresponde a esta isla.
TINTES = {
    'grass_block_top': (0x79, 0xC0, 0x5A),
    'grass_block_side_overlay': (0x79, 0xC0, 0x5A),
    'oak_leaves': (0x59, 0xAE, 0x30),
    'water_still': (0x3F, 0x76, 0xE4),
}


def tenir(im, color):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            l = (r + g + b) / 3.0 / 255.0
            px[x, y] = (int(color[0] * l), int(color[1] * l), int(color[2] * l), a)
    return im


def extraer_texturas():
    z = zipfile.ZipFile(JAR_CLIENTE)
    faltan = []

    def abrir(t):
        im = Image.open(io.BytesIO(z.read('assets/minecraft/textures/block/%s.png' % t))).convert('RGBA')
        if im.height > im.width:                      # tira de animación: primer cuadro
            im = im.crop((0, 0, im.width, im.width))
        return im

    for nombre, texs in MATERIALES.items():
        for t in texs:
            destino = os.path.join(SALIDA, t + '.png')
            try:
                im = abrir(t)
            except KeyError:
                faltan.append(t)
                continue
            if t == 'grass_block_side':
                # el costado del pasto son dos capas: tierra y una franja que se tiñe
                base = abrir('grass_block_side')
                capa = tenir(abrir('grass_block_side_overlay'), TINTES['grass_block_side_overlay'])
                base.alpha_composite(capa)
                im = base
            elif t in TINTES:
                im = tenir(im, TINTES[t])
            im.save(destino)
    return faltan


# ── 2. traducir un bloque de Minecraft a uno de los nuestros ────────────────
REGLAS = [
    ('bookshelf', 'libro', 0), ('lantern', 'farol', 0), ('torch', 'farol', 0),
    ('glowstone', 'farol', 0), ('sea_lantern', 'farol', 0), ('campfire', 'farol', 0),
    ('glass_pane', 'vidrio', 0), ('glass', 'vidrio', 0),
    ('water', 'agua', 0),
    ('hay_block', 'heno', 0), ('farmland', 'tierra_labrada', 0), ('wheat', 'trigo', 0),
    ('bricks', 'ladrillo', 0), ('brick', 'ladrillo', 0),
    ('deepslate', 'pizarra', 0), ('blackstone', 'blackstone', 0),
    ('calcite', 'calcita', 0), ('quartz', 'cuarzo', 0),
    ('prismarine', 'prismarina', 0), ('andesite', 'andesita', 0),
    ('terracotta', 'terracota', 0), ('concrete', 'concreto_blanco', 0),
    ('stone_brick', 'ladrillo_p', 0), ('cobblestone', 'adoquin', 0),
    ('mossy', 'musgo', 0), ('moss', 'musgo', 0),
    ('spruce_log', 'tronco_abeto', 0), ('spruce', 'abeto', 0),
    ('_log', 'tronco', 0), ('stripped', 'tronco', 0),
    ('leaves', 'hojas', 0),
    ('planks', 'roble', 0), ('door', 'roble', 0), ('trapdoor', 'roble', 0),
    ('fence', 'roble', 0), ('barrel', 'roble', 0), ('lectern', 'roble', 0),
    ('crafting', 'roble', 0), ('chest', 'roble', 0), ('table', 'roble', 0),
    ('bed', 'lana', 0), ('wool', 'lana', 0), ('carpet', 'lana', 1),
    ('gold', 'oro', 0), ('copper', 'cobre', 0),
    ('dirt_path', 'camino', 0), ('path', 'camino', 0),
    ('grass_block', 'pasto', 0), ('podzol', 'pasto', 0),
    ('coarse_dirt', 'tierra', 0), ('dirt', 'tierra', 0),
    ('gravel', 'grava', 0), ('sand', 'arena', 0),
    ('stone', 'piedra', 0),
]

IGNORAR = ('air', 'jigsaw', 'structure_void', 'structure_block', 'barrier', 'light')
PLANTAS = ('flower', 'dandelion', 'poppy', 'tulip', 'daisy', 'cornflower', 'rose',
           'grass', 'fern', 'sapling', 'bamboo', 'sugar_cane', 'vine', 'lily')


def traducir(nombre, props):
    """Devuelve (id_material, forma) o None si el bloque se descarta."""
    corto = nombre.split(':')[-1]
    if any(corto == i or corto.startswith(i) for i in IGNORAR):
        return None
    if corto in ('short_grass', 'tall_grass', 'grass'):
        return None
    if any(p in corto for p in PLANTAS) and 'block' not in corto:
        return None
    forma = 0
    if 'slab' in corto:
        forma = 2 if props.get('type') == 'top' else 1
    elif 'stairs' in corto:
        forma = 2 if props.get('half') == 'top' else 1
    for clave, mat, f in REGLAS:
        if clave in corto:
            return IDX[mat], forma or f
    return IDX['piedra'], forma


# ── 3. leer una estructura oficial ──────────────────────────────────────────
_serv = zipfile.ZipFile(JAR_SERVIDOR)
_rutas = {n.split('/structure/')[1]: n for n in _serv.namelist() if '/structure/' in n}


def leer_estructura(rel):
    datos = _serv.read(_rutas[rel])
    f = nbtlib.File.parse(gzip.GzipFile(fileobj=io.BytesIO(datos)))
    raiz = f[''] if '' in f else f
    paleta = []
    for p in raiz['palette']:
        props = {str(k): str(v) for k, v in dict(p.get('Properties', {})).items()}
        paleta.append(traducir(str(p['Name']), props))
    salida = []
    for b in raiz['blocks']:
        t = paleta[int(b['state'])]
        if t is None:
            continue
        x, y, z = (int(v) for v in b['pos'])
        salida.append((x, y, z, t[0], t[1]))
    size = [int(v) for v in raiz['size']]
    return salida, size


faltan = extraer_texturas()
if faltan:
    print('  OJO, faltan texturas en el jar:', faltan)


# ── 4. la isla ──────────────────────────────────────────────────────────────
LADO = 60          # el doble que antes: todo estaba encimado
rnd = random.Random(2026)


def ruido(celdas, semilla):
    """Ruido de manchas interpolado, para la costa y el relieve."""
    r = random.Random(semilla)
    g = [[r.random() for _ in range(celdas + 2)] for _ in range(celdas + 2)]

    def valor(x, z):
        gx, gz = x / float(LADO) * celdas, z / float(LADO) * celdas
        x0, z0 = int(gx), int(gz)
        tx, tz = gx - x0, gz - z0
        tx = tx * tx * (3 - 2 * tx)
        tz = tz * tz * (3 - 2 * tz)
        a = g[z0][x0] * (1 - tx) + g[z0][x0 + 1] * tx
        b = g[z0 + 1][x0] * (1 - tx) + g[z0 + 1][x0 + 1] * tx
        return a * (1 - tz) + b * tz

    return valor


costa = ruido(5, 11)
relieve = ruido(7, 23)

bloques = {}


def poner(x, y, z, mat, f=0):
    bloques[(x, y, z)] = (mat, f)


def altura_terreno(x, z):
    """Devuelve la altura del suelo, o None si ahí hay mar."""
    cx, cz = x - LADO / 2.0, z - LADO / 2.0
    d = math.hypot(cx, cz) / (LADO / 2.0)
    # la costa deja de ser un círculo perfecto por el ruido: bahías y penínsulas
    borde = 0.62 + costa(x, z) * 0.30
    if d > borde:
        return None
    h = 1 + int(relieve(x, z) * 3.2)
    caida = max(0.0, (d - (borde - 0.16)) / 0.16)      # se hunde hacia la orilla
    return max(0, h - int(caida * 3))


NIVEL_MAR = 0

for z in range(LADO):
    for x in range(LADO):
        h = altura_terreno(x, z)
        if h is None:
            poner(x, NIVEL_MAR, z, IDX['agua'])
            for y in range(-3, NIVEL_MAR):
                poner(x, y, z, IDX['arena'])
            continue
        for y in range(-3, h + 1):
            if y == h:
                poner(x, y, z, IDX['arena'] if h <= 1 else IDX['pasto'])
            elif y >= h - 2:
                poner(x, y, z, IDX['tierra'])
            else:
                poner(x, y, z, IDX['piedra'])

# mar abierto alrededor, para que no se vea el borde del mundo
for z in range(-14, LADO + 14):
    for x in range(-14, LADO + 14):
        if 0 <= x < LADO and 0 <= z < LADO:
            continue
        poner(x, NIVEL_MAR, z, IDX['agua'])


# ── 5. las construcciones, oficiales de Mojang ──────────────────────────────
# Cada una elegida porque significa algo, no porque quedaba bien:
#   la base   → casa grande de aldea, es donde vive el que construye
#   Educabot  → la biblioteca, que es lo más parecido a una escuela que hay
#   Cultura   → el punto de reunión, que es literalmente donde se junta la gente
#   PRODEGAME → una ruina de verdad, no una casa a la que le saqué bloques

def apoyar(bloques_est, size, cx, cz, rot=0):
    """Pega una estructura en el terreno, apoyada en el suelo y sin flotar."""
    sx, sy, sz = size

    def girar(x, z):
        if rot == 1:
            return sz - 1 - z, x
        if rot == 2:
            return sx - 1 - x, sz - 1 - z
        if rot == 3:
            return z, sx - 1 - x
        return x, z

    ancho, largo = (sz, sx) if rot in (1, 3) else (sx, sz)
    x0, z0 = cx - ancho // 2, cz - largo // 2

    # se apoya en la altura MÁS BAJA del terreno que pisa, y se rellena abajo:
    # así nunca queda una esquina en el aire
    alturas = []
    for dz in range(largo):
        for dx in range(ancho):
            h = altura_terreno(x0 + dx, z0 + dz)
            if h is not None:
                alturas.append(h)
    if not alturas:
        return None
    base = min(alturas)

    for (bx, by, bz, mat, f) in bloques_est:
        gx, gz = girar(bx, bz)
        poner(x0 + gx, base + by, z0 + gz, mat, f)

    # cimiento: se rellena el hueco entre la estructura y el terreno
    for dz in range(largo):
        for dx in range(ancho):
            h = altura_terreno(x0 + dx, z0 + dz)
            if h is None:
                continue
            for y in range(h, base):
                poner(x0 + dx, y, z0 + dz, IDX['adoquin'])
    return (x0, base, z0, ancho, sy, largo)


PLANOS = [
    ('base',      'village/plains/houses/plains_big_house_1.nbt',     20, 30, 0),
    ('educabot',  'village/plains/houses/plains_library_1.nbt',       14, 12, 1),
    ('cultura',   'village/plains/houses/plains_medium_house_1.nbt',  44, 16, 2),
    ('prodegame', 'underwater_ruin/big_brick_3.nbt',                  15, 45, 0),
]

CAJAS = {}
for ident, ruta, cx, cz, rot in PLANOS:
    est, size = leer_estructura(ruta)
    CAJAS[ident] = apoyar(est, size, cx, cz, rot)

# ── VoyBien: el faro. Es lo único que construyo yo, porque no existe en vanilla
FX, FZ = 44, 42
hf = altura_terreno(FX, FZ) or 1
for dz in range(-3, 4):
    for dx in range(-3, 4):
        if dx * dx + dz * dz <= 10:
            poner(FX + dx, hf, FZ + dz, IDX['prismarina'])
for y in range(1, 16):
    banda = IDX['calcita'] if (y // 3) % 2 == 0 else IDX['ladrillo']
    for dz in range(-2, 3):
        for dx in range(-2, 3):
            d = dx * dx + dz * dz
            if d > 5:
                continue
            if d >= 4 or y == 1:
                poner(FX + dx, hf + y, FZ + dz, banda)
for y in (16, 17):
    for dz in range(-2, 3):
        for dx in range(-2, 3):
            if dx * dx + dz * dz > 5:
                continue
            poner(FX + dx, hf + y, FZ + dz, IDX['vidrio'])
for dz in range(-1, 2):
    for dx in range(-1, 2):
        poner(FX + dx, hf + 16, FZ + dz, IDX['farol'])
        poner(FX + dx, hf + 17, FZ + dz, IDX['farol'])
for dz in range(-2, 3):
    for dx in range(-2, 3):
        if dx * dx + dz * dz <= 5:
            poner(FX + dx, hf + 18, FZ + dz, IDX['pizarra'])
poner(FX, hf + 19, FZ, IDX['oro'])
CAJAS['voybien'] = (FX - 3, hf, FZ - 3, 7, 20, 7)

# ── los logros: un pequeño monumento ───────────────────────────────────────
LX, LZ = 30, 44
hl = altura_terreno(LX, LZ) or 1
for dz in range(-2, 3):
    for dx in range(-3, 4):
        poner(LX + dx, hl, LZ + dz, IDX['calcita'])
for i, dx in enumerate((-3, -1, 1, 3)):
    for y in range(1, 3):
        poner(LX + dx, hl + y, LZ, IDX['oro'])
    poner(LX + dx, hl + 3, LZ, IDX['farol'])
CAJAS['logros'] = (LX - 3, hl, LZ - 2, 7, 4, 5)


# ── 6. caminos, árboles y detalle ──────────────────────────────────────────
# ocupado = donde hay construcción, no donde hay terreno. Antes tomaba el terreno
# entero y por eso no entraba ni un árbol.
ocupado = set()
for c in CAJAS.values():
    if not c:
        continue
    x0, _, z0, ancho, _, largo = c
    for dz in range(-1, largo + 1):
        for dx in range(-1, ancho + 1):
            ocupado.add((x0 + dx, z0 + dz))


def libre(x, z, margen=3):
    for dz in range(-margen, margen + 1):
        for dx in range(-margen, margen + 1):
            if (x + dx, z + dz) in ocupado:
                return False
    return True


def sendero(x1, z1, x2, z2):
    x, z = x1, z1
    while (x, z) != (x2, z2):
        h = altura_terreno(x, z)
        if h is not None and h > 1:
            poner(x, h, z, IDX['camino'])
            if altura_terreno(x, z + 1) == h:
                poner(x, h, z + 1, IDX['camino'])
        if x != x2 and (z == z2 or rnd.random() < 0.5):
            x += 1 if x < x2 else -1
        elif z != z2:
            z += 1 if z < z2 else -1
        else:
            break


CENTROS = {i: (c[0] + c[3] // 2, c[2] + c[5] // 2) for i, c in CAJAS.items() if c}
for destino in ('educabot', 'cultura', 'voybien', 'logros', 'prodegame'):
    a, b = CENTROS['base'], CENTROS[destino]
    sendero(a[0], a[1], b[0], b[1])


def arbol(x, z, alto, hojas_mat):
    h = altura_terreno(x, z)
    if h is None or h < 2:
        return
    for y in range(1, alto + 1):
        poner(x, h + y, z, IDX['tronco'])
    for dy in (alto - 1, alto):
        for dz in range(-2, 3):
            for dx in range(-2, 3):
                if abs(dx) == 2 and abs(dz) == 2:
                    continue
                if dx == 0 and dz == 0:
                    continue
                poner(x + dx, h + dy, z + dz, hojas_mat)
    for dz in range(-1, 2):
        for dx in range(-1, 2):
            if abs(dx) + abs(dz) <= 1:
                poner(x + dx, h + alto + 1, z + dz, hojas_mat)


puestos = 0
intentos = 0
while puestos < 34 and intentos < 4000:
    intentos += 1
    x, z = rnd.randrange(4, LADO - 4), rnd.randrange(4, LADO - 4)
    h = altura_terreno(x, z)
    if h is None or h < 2 or not libre(x, z, 3):
        continue
    arbol(x, z, 4 + rnd.randrange(2), IDX['hojas_cerezo'] if rnd.random() < 0.18 else IDX['hojas'])
    for dz in range(-2, 3):
        for dx in range(-2, 3):
            ocupado.add((x + dx, z + dz))
    puestos += 1

# piedras y matas sueltas en la costa
for _ in range(90):
    x, z = rnd.randrange(LADO), rnd.randrange(LADO)
    h = altura_terreno(x, z)
    if h is None or (x, z) in ocupado:
        continue
    if h <= 1:
        poner(x, h + 1, z, IDX['piedra'], 1)

# ── 6b. limpiar lo que quedó colgado ───────────────────────────────────────
# Las ruinas oficiales traen pedazos sueltos a propósito, porque en el juego están
# hundidas en arena. En tierra firme quedan flotando en el aire y se ven como un
# error. Se sacan los que no tienen nada que los sostenga, hasta que no quede ninguno.
def limpiar_colgados():
    sacados = 0
    for _ in range(8):
        solidos = {k for k, v in bloques.items() if IDS[v[0]] != 'agua'}
        fuera = []
        for (x, y, z), (m, f) in bloques.items():
            if IDS[m] in ('agua', 'hojas', 'hojas_cerezo') or y <= 0:
                continue
            if (x, y - 1, z) in solidos:
                continue
            if any((x + dx, y, z + dz) in solidos for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                continue
            fuera.append((x, y, z))
        if not fuera:
            break
        for k in fuera:
            del bloques[k]
        sacados += len(fuera)
    return sacados


print('  bloques colgados removidos: %d' % limpiar_colgados())


# ── 7. exportar ────────────────────────────────────────────────────────────
mats = []
for nombre, texs in MATERIALES.items():
    t = list(texs) if len(texs) == 3 else [texs[0]] * 3
    mats.append({'id': nombre, 'tex': t})

# Se descartan los bloques que ningún ojo puede ver: los que tienen los seis vecinos
# opacos. En una isla con relieve eso es casi la mitad del mundo, y son bloques que
# el navegador estaría dibujando para nada.
TRANSPARENTES = {IDX['agua'], IDX['vidrio'], IDX['hojas'], IDX['hojas_cerezo'], IDX['farol']}


def opaco(x, y, z):
    b = bloques.get((x, y, z))
    return b is not None and b[1] == 0 and b[0] not in TRANSPARENTES


lista = []
for (x, y, z), (m, f) in bloques.items():
    if f == 0 and m not in TRANSPARENTES and all(
        opaco(x + dx, y + dy, z + dz)
        for dx, dy, dz in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))
    ):
        continue
    lista.append([x, y, z, m, f])
lista.sort(key=lambda b: (b[1], b[0], b[2]))
print('  ocultos descartados: %d de %d' % (len(bloques) - len(lista), len(bloques)))

# el jugador aparece en el camino, delante de la casa principal
bx, bz = CENTROS['base']
sx = bx
sz = CAJAS['base'][2] - 4
sy = (altura_terreno(sx, sz) or 1) + 1

datos = {
    'lado': LADO,
    'materiales': mats,
    'bloques': lista,
    'cajas': {k: list(v) for k, v in CAJAS.items() if v},
    'spawn': [sx + 0.5, sy + 0.05, sz + 0.5],
}
with open(os.path.join(SALIDA, 'mundo.json'), 'w') as f:
    json.dump(datos, f, separators=(',', ':'))

import shutil
shutil.copy(os.path.join(SALIDA, 'mundo.json'), os.path.join(BASE, 'mundo.json'))

print('mundo listo')
print('  isla de %dx%d, %d bloques, %d materiales' % (LADO, LADO, len(lista), len(mats)))
print('  construcciones oficiales: %d' % len(PLANOS))
print('  arboles: %d' % puestos)
print('  spawn en %s' % datos['spawn'])
print('  peso del json: %.1f KB' % (os.path.getsize(os.path.join(SALIDA, 'mundo.json')) / 1024.0))


# ── 8. verificación ────────────────────────────────────────────────────────
# Revisar a ojo una isla de 60x60 no es viable, y un bloque flotando arruina la
# ilusión más que cualquier textura fea.
solidos = {(x, y, z) for (x, y, z), (m, f) in bloques.items() if IDS[m] != 'agua'}
problemas = 0


def revisar(ok, msg):
    global problemas
    print(('  OK  ' if ok else '  MAL ') + msg)
    if not ok:
        problemas += 1


flotando = []
for (x, y, z), (m, f) in bloques.items():
    if IDS[m] in ('agua', 'hojas', 'hojas_cerezo') or y <= 0:
        continue
    if (x, y - 1, z) in solidos:
        continue
    if any((x + dx, y, z + dz) in solidos for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1))):
        continue
    flotando.append((x, y, z, IDS[m]))
revisar(not flotando, 'bloques flotando: %d' % len(flotando))
for b in flotando[:6]:
    print('        %s en %s' % (b[3], b[:3]))

sx, sy, sz = datos['spawn']
cx, cy, cz = int(sx), int(sy), int(sz)
revisar((cx, cy, cz) not in solidos, 'el spawn no está dentro de un bloque')
revisar((cx, cy + 1, cz) not in solidos, 'el spawn tiene la cabeza libre')
revisar((cx, cy - 1, cz) in solidos, 'el spawn tiene piso debajo')

alturas = [y for (x, y, z) in solidos]
print('  alturas del mundo: %d a %d' % (min(alturas), max(alturas)))
print(('\n%d problema(s)\n' % problemas) if problemas else '\nSin problemas\n')
