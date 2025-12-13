# Sistema de Administración de Blogs

## Configuración Inicial

### 1. Instalar dependencias del backend

```bash
cd server
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado con tus credenciales de MySQL. Si necesitas cambiarlo, edita `server/.env`.

### 3. Crear usuario admin

```bash
cd server
npm run dev
# En otra terminal:
npx tsx src/scripts/create-admin.ts admin tu_contraseña_segura
```

### 4. Iniciar el servidor

```bash
cd server
npm run dev
```

El servidor estará corriendo en `http://localhost:3001`

### 5. Configurar la URL de la API en el frontend

Crea un archivo `.env` en la raíz del proyecto (si no existe):

```env
VITE_API_URL=http://localhost:3001/api
```

### 6. Iniciar el frontend

```bash
npm run dev
```

## Uso

### Acceder al panel de administración

1. Ve a `http://localhost:3000/admin/login`
2. Inicia sesión con las credenciales que creaste
3. Serás redirigido a `/admin` donde podrás:
   - Ver todos los blogs
   - Crear nuevos blogs
   - Editar blogs existentes
   - Eliminar blogs

### Crear un blog

1. Haz clic en "Nuevo Blog"
2. Completa los campos:
   - **Slug**: URL amigable (ej: `mi-primer-blog`)
   - **Títulos y Subtítulos**: En español e inglés
   - **Contenido**: Usa el editor WYSIWYG para formatear el texto
   - **Categoría**: Opcional
   - **Imagen de portada**: URL de la imagen
   - **Fecha de publicación**: Opcional
   - **Tiempo de lectura**: Opcional

3. Haz clic en "Guardar Blog"

### Ver un blog

Los blogs se pueden ver en:
- `http://localhost:3000/{slug}`

Por ejemplo, si el slug es `mi-primer-blog`, la URL será:
- `http://localhost:3000/mi-primer-blog`

## Estructura de la Base de Datos

### Tabla `blogs`

- `id`: ID único
- `slug`: URL amigable (único)
- `title_es`, `title_en`: Títulos en ambos idiomas
- `subtitle_es`, `subtitle_en`: Subtítulos opcionales
- `content_es`, `content_en`: Contenido HTML del blog
- `category_es`, `category_en`: Categorías opcionales
- `author`: Autor (default: "Alan Ponce")
- `cover_image_url`: URL de la imagen de portada
- `published_at`: Fecha de publicación
- `read_time_es`, `read_time_en`: Tiempo estimado de lectura
- `created_at`, `updated_at`: Timestamps automáticos

### Tabla `admin_users`

- `id`: ID único
- `username`: Nombre de usuario (único)
- `password_hash`: Hash de la contraseña
- `created_at`: Timestamp de creación

## Notas

- Los blogs se renderizan con el mismo diseño que tenías antes
- El contenido se guarda como HTML (desde ReactQuill)
- Los blogs soportan bilingüismo (español/inglés)
- El sistema mantiene el diseño profesional de tu portfolio

