# Guía de Configuración del Sistema de Blogs

## Pasos para Configurar el Sistema

### 1. Instalar Dependencias del Backend

```bash
cd server
npm install
```

### 2. Configurar Variables de Entorno del Backend

El archivo `server/.env` ya está configurado con tus credenciales de MySQL de Railway. Si necesitas cambiarlo, edita el archivo.

### 3. Crear Usuario Administrador

Primero, inicia el servidor:

```bash
cd server
npm run dev
```

Luego, en otra terminal, crea el usuario admin:

```bash
cd server
npm run create-admin admin tu_contraseña_segura
```

**Ejemplo:**
```bash
npm run create-admin admin MiPasswordSegura123
```

### 4. Configurar Variables de Entorno del Frontend

Crea un archivo `.env` en la raíz del proyecto (al mismo nivel que `package.json`):

```env
VITE_API_URL=http://localhost:3001/api
```

### 5. Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Uso del Sistema

### Acceder al Panel de Administración

1. Abre tu navegador y ve a: `http://localhost:3000/admin/login`
2. Inicia sesión con las credenciales que creaste
3. Serás redirigido automáticamente al panel de administración

### Crear un Blog

1. En el panel de admin, haz clic en **"Nuevo Blog"**
2. Completa los campos:
   - **Slug**: URL amigable (ej: `mi-primer-blog`)
   - **Títulos**: En español e inglés
   - **Subtítulos**: Opcionales, en ambos idiomas
   - **Contenido**: Usa el editor WYSIWYG para formatear
   - **Categoría**: Opcional
   - **Imagen de portada**: URL de la imagen
   - **Fecha de publicación**: Opcional
   - **Tiempo de lectura**: Opcional (ej: "15 min lectura")
3. Haz clic en **"Guardar Blog"**

### Ver un Blog

Los blogs se pueden ver en:
- `http://localhost:3000/{slug}`

Por ejemplo, si el slug es `mi-primer-blog`:
- `http://localhost:3000/mi-primer-blog`

## Estructura del Proyecto

```
uxkero/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Configuración de BD
│   │   ├── routes/        # Rutas de API
│   │   ├── middleware/    # Middleware de auth
│   │   └── scripts/       # Scripts de utilidad
│   └── package.json
├── components/
│   ├── admin/            # Componentes del panel admin
│   ├── blog/             # Componentes de blogs
│   └── ui/               # Componentes shadcn/ui
├── lib/                  # Utilidades
├── utils/                # Utilidades de API
└── App.tsx              # Componente principal
```

## Características

✅ Sistema de autenticación con JWT
✅ Editor WYSIWYG para contenido rico
✅ Soporte bilingüe (Español/Inglés)
✅ Diseño profesional que mantiene el estilo de tu portfolio
✅ URLs amigables personalizables
✅ Gestión completa de blogs (crear, editar, eliminar)
✅ Base de datos MySQL en Railway

## Notas Importantes

- El contenido de los blogs se guarda como HTML
- Los blogs mantienen el mismo diseño visual que tenías antes
- El sistema es completamente privado - solo tú puedes acceder a `/admin`
- Los blogs se pueden compartir en redes sociales
- El sistema calcula automáticamente las fechas de publicación

## Solución de Problemas

### Error de conexión a la base de datos

Verifica que las credenciales en `server/.env` sean correctas y que Railway esté activo.

### Error 401 al intentar acceder a /admin

Asegúrate de haber iniciado sesión correctamente. Si el token expiró, simplemente inicia sesión de nuevo.

### El blog no se muestra

Verifica que:
1. El slug sea correcto
2. El blog esté guardado en la base de datos
3. El servidor backend esté corriendo

