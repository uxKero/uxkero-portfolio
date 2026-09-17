---
version: anydesign-element-1
name: League client launcher shell (top bar + social panel)
source: ~/Downloads/lol1.png … lol5.png (capturas del cliente de League, 1283x721, septiembre 2026)
captured_at: 2026-09-16
kind: hybrid
target:
  description: "la barra superior y la columna social del launcher"
  region: "barra: 0,0 → 1283,82 · perfil: 1057,0 → 1283,82 · social: 1057,82 → 1283,690 · pie: 1057,686 → 1283,721"

colors:
  frame-gold: "#785A28"        # filete superior de 2px (medido y=0..1)
  bar-surface: "#070F1A"       # extract_colors barra2, 18.7% (degradado #050B17 → #0D131E)
  bar-bottom-rule: "#3E4445"   # línea de 1px en y=81
  surface: "#010A13"           # social 66.7%, perfil 37%
  panel: "#1E2328"             # pie del social 36.6%, relleno del botón JUEGA
  gold-text: "#CDBE91"         # pestañas inactivas y glifos de íconos
  gold-title: "#C3A363"        # título SOCIAL, anillos de avatar en línea
  gold-dim: "#645A3F"          # anillos de avatar desconectado
  gold-badge: "#C89B3C"        # insignia numérica del pie
  cream: "#F0E6D2"             # pestaña activa, nombre del perfil, encabezados de grupo
  grey-text: "#A09B8C"         # nombres en línea
  offline-name: "#535350"
  offline-status: "#5B5A56"
  online-green: "#0ACF83"      # punto y texto "En línea" (medido #007C34 con antialias)
  teal-rim: "#07B1B2"          # borde interno del botón JUEGA
  group-blue: "#143B5A"        # bloque de grupo, degradado #0E1E35 → #143B5A
  group-dot: "#3C4A5A"

typography:
  nav-tab: { family: "Beaufort for LoL → Cinzel", size: 15px, weight: 700, case: UPPERCASE, tracking: 0.04em }
  button-label: { family: "Beaufort → Cinzel", size: 15px, weight: 700, case: UPPERCASE }
  group-header: { family: "Beaufort → Cinzel", size: 12px, weight: 700, case: UPPERCASE, tracking: 0.05em }
  row-name: { family: "Spiegel → Barlow", size: 14px, weight: 400, case: "sentence" }
  row-status: { family: "Spiegel → Barlow", size: 12px, weight: 400, case: "sentence" }
  currency: { family: "Spiegel → Barlow", size: 14px, weight: 700, tabular: true }

spacing-used: [2, 4, 8, 12, 16, 24]
geometry:
  bar-height: 80px
  frame-top: 2px
  social-width: 226px
  row-height: 48px
  avatar: 32px con anillo de 2px
  icon-tab-width: 74px
  footer-height: 35px
  footer-button: 34x34 con borde de 1px
---

# Element — League client launcher shell

> Generado con la skill `anydesign` (element mode) sobre las capturas del cliente real.
> Kind: hybrid (shell en código, logo y glifos como SVG propios) · Fecha: 2026-09-16

## Source & target

- **Source**: cinco capturas del cliente actual (Juega, Tienda, Grupo, Colección, Perfil).
- **Targeting**: región visual ⚠️. Colores por `extract_colors.py` sobre recortes, bordes por barrido de píxeles.
- **Context**: todo apoya sobre `#010A13`; el contenido central pasa por detrás de la barra.

## 1. What this element is

El marco persistente del cliente: una barra de 80px con el llamado principal a la izquierda,
navegación de texto, una fila de íconos y las monedas, y a la derecha una columna de 226px
que arranca con el perfil y sigue con el grupo, la lista social y un pie de botones. Lo que
lo distingue es la **disciplina cromática**: todo es crema y oro apagado sobre casi negro, y
el único color vivo es el teal del botón y el verde de "en línea".

## 2. Spec

**Barra superior**
- 80px; filete superior de 2px `frame-gold`; fondo en degradado vertical `#050B17 → #0D131E`; línea inferior de 1px `bar-bottom-rule`.
- **Logo + botón**: el escudo circular (oro con núcleo teal) se superpone al botón por la izquierda. Botón de 40px: borde exterior 1px `#463714`, borde interior 2px `teal-rim`, relleno `panel`, etiqueta `button-label` en crema. En estado "JUEGA" el lado derecho termina en punta; en "GRUPO" es rectangular.
- **Pestañas de texto**: `nav-tab` en `gold-text`, ~38px entre sí. Activa: `cream`.
- **Íconos**: glifos **planos y monocromos** en `gold-text`, 26px, en celdas de ~74px separadas por filetes verticales de 1px que se desvanecen arriba y abajo. **Activo**: glifo en `cream`, doble chevron en contorno dorado colgando del borde superior y un degradado claro que sube desde abajo.
- **Monedas**: dos líneas. Arriba una píldora de borde 1px `#3C3C41`, ícono dorado, cifra en `currency` blanca y botón `+` circular con borde dorado. Abajo sin píldora, ícono teal.

**Perfil (arriba de la columna)**
- Avatar de 54px: anillo teal exterior con anillo dorado, placa de nivel debajo con borde dorado y cifra gris.
- Nombre en `cream` bold, estado con punto y texto `online-green`, íconos chicos a la derecha.
- Controles de ventana (`? _ ⚙ ×`) en gris, fila superior derecha.

**Columna social**
- Bloque de grupo: degradado azul `#0E1E35 → #143B5A` con brillo diagonal; título `group-header` gris con ícono; fila de 5 puntos (el primero crema, el resto `group-dot`); subtítulo gris.
- Cabecera "SOCIAL" en `gold-title` con cuatro íconos dorados.
- Grupos: triángulo + `group-header` en `cream` + contador entre paréntesis.
- Fila de 48px: avatar 32px con anillo de 2px (`gold-title` en línea, `gold-dim` desconectado) y punto de estado abajo a la derecha; nombre `row-name` en `grey-text` o `offline-name`; estado en `online-green` o `offline-status`. **Desconectado cambia color, no opacidad.**
- Barra de desplazamiento fina dorada a la derecha.
- **Pie**: 35px sobre `surface`; botones de 34px con borde 1px dorado oscuro y glifo crema; insignia `gold-badge` montada sobre el segundo botón; versión centrada en gris; botón a la derecha.

**States**: hover ❓ no observado (propuesta: glifo y texto a `cream`). Activo ✅ observado en pestañas e íconos.

## 3. Reconstruction prompt

Reconstruí solo el marco del launcher en React y CSS sobre `#010A13`. Barra de 80px con filete
superior de 2px `#785A28` y línea inferior de 1px `#3E4445`. A la izquierda un escudo circular
que monta sobre un botón con borde exterior 1px `#463714`, borde interior 2px `#07B1B2` y relleno
`#1E2328`, etiqueta en mayúscula Cinzel bold crema, lado derecho en punta. Pestañas en Cinzel bold
15px `#CDBE91`, la activa en `#F0E6D2`. Íconos planos monocromos `#CDBE91` en celdas de 74px con
filetes verticales que se desvanecen; el activo con doble chevron dorado en contorno colgando
arriba y degradado claro desde abajo. Columna derecha de 226px: perfil con avatar de anillo teal
y oro y placa de nivel; bloque azul de grupo; lista social con grupos en mayúscula crema, filas
de 48px con avatar de 32px y anillo dorado, nombre gris `#A09B8C`, estado verde `#0ACF83`, y
desconectados en `#535350` / `#5B5A56` sin transparencia; pie de botones cuadrados con insignia
dorada. No uses íconos a color, no uses vidrio ni blur, no redondees los paneles.

## 5. Consistency notes

- Los logos, glifos y el arte de Riot no se copian: el escudo y los glifos se redibujan como SVG propios con la misma lógica (oro plano, crema plano).
- El contenido es el del portfolio: las filas sociales son productos y enlaces, el grupo es la disponibilidad.

## 6. Confidence & open questions

| Aspect | Confidence | Why |
|---|---|---|
| Colores | ✅ | `extract_colors.py` sobre recortes de las cinco capturas + muestreo puntual |
| Geometría | ✅ | Barrido de píxeles (barra 80px, filete 2px, filas 48px) |
| Tipografía | ⚠️ | Beaufort y Spiegel son licenciadas; alternativas Cinzel y Barlow |
| Hover | ❓ | Capturas estáticas |
