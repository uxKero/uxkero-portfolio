# 🔄 Restaurar Blog "Principios de UI"

## ❌ Problema

El blog "Principios de UI: De la Teoría al Impacto Real" estaba hardcodeado en el frontend y se perdió durante la migración a la base de datos.

## ✅ Solución

### Opción 1: Ejecutar SQL (Rápido)

1. Abre **TablePlus/DBeaver**
2. Conéctate a `uxkeroblog`
3. Abre el archivo `RESTAURAR-BLOG-PRINCIPIOS-UI.sql`
4. Ejecuta el SQL completo
5. Esto creará el blog con contenido básico
6. Luego edítalo desde el panel admin para restaurar el contenido completo

### Opción 2: Crear desde el Panel Admin

1. Ve a `http://localhost:3000/admin`
2. Click en "Nuevo Blog"
3. Completa los campos:
   - **Slug:** `principios-ui-impacto-real`
   - **Título (ES):** `Principios de UI: De la Teoría al Impacto Real`
   - **Título (EN):** `UI Principles: From Theory to Real Impact`
   - **Subtítulo (ES):** `Por qué una interfaz "bonita" no es suficiente y cómo el diseño UI estratégico aumenta conversiones, retención y satisfacción del usuario.`
   - **Subtítulo (EN):** `Why a "beautiful" interface is not enough and how strategic UI design increases conversions, retention and user satisfaction.`
   - **Categoría (ES):** `Estrategia de Diseño`
   - **Categoría (EN):** `Design Strategy`
   - **Tiempo de Lectura (ES):** `15 min lectura`
   - **Tiempo de Lectura (EN):** `15 min read`
   - **Fecha de Publicación:** `2025-12-10`
   - **Contenido:** Restaura el contenido completo que tenías

## 📝 Nota

El contenido HTML completo del blog se perdió durante la migración. Necesitas restaurarlo manualmente desde el panel admin o desde el SQL si tienes una copia del contenido original.

## ✅ Verificar

Después de restaurar, verifica:
1. El blog aparece en el panel admin
2. El blog se puede ver en: `http://localhost:3000/principios-ui-impacto-real`
3. El blog aparece en la lista de blogs del portfolio

