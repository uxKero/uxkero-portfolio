# 🚀 Inicio Rápido del Sistema de Blogs

## Paso 1: Instalar Dependencias del Servidor

```bash
cd server
npm install
```

## Paso 2: Configurar Variables de Entorno

El archivo `server/.env` ya está configurado con tus credenciales de Railway. Si necesitas cambiarlo, edítalo.

## Paso 3: Crear Usuario Administrador

**IMPORTANTE:** Primero debes iniciar el servidor, luego crear el usuario.

```bash
# Terminal 1 - Iniciar servidor
cd server
npm run dev

# Terminal 2 - Crear usuario admin (espera a que el servidor esté corriendo)
cd server
npm run create-admin admin tu_contraseña_segura
```

## Paso 4: Configurar Frontend

Crea un archivo `.env` en la raíz del proyecto (al mismo nivel que `package.json`):

```env
VITE_API_URL=http://localhost:3001/api
```

## Paso 5: Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Deberías ver:
```
✅ Conectado a MySQL
✅ Tablas inicializadas correctamente
🚀 Servidor corriendo en http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Paso 6: Acceder al Panel de Admin

1. Abre tu navegador en: `http://localhost:3000/admin/login`
2. Inicia sesión con las credenciales que creaste
3. ¡Listo! Ya puedes crear blogs

## Solución de Problemas

### Error: ERR_CONNECTION_REFUSED

**Causa:** El servidor backend no está corriendo.

**Solución:**
1. Asegúrate de estar en el directorio `server`
2. Ejecuta `npm run dev`
3. Espera a ver el mensaje "🚀 Servidor corriendo en http://localhost:3001"

### Error: Access to storage is not allowed

**Causa:** Problema con localStorage en algunos contextos.

**Solución:** Ya está manejado en el código. Si persiste, verifica que no estés en un iframe o contexto restringido.

### Error: No se pudo conectar a MySQL

**Causa:** Credenciales incorrectas o Railway no está activo.

**Solución:**
1. Verifica las credenciales en `server/.env`
2. Asegúrate de que Railway esté activo
3. Verifica que la base de datos `railway` exista

### Las tablas no se crean

**Causa:** El servidor no puede conectarse a MySQL.

**Solución:**
1. Verifica la conexión a MySQL
2. Asegúrate de que el usuario tenga permisos para crear tablas
3. Revisa los logs del servidor para ver el error específico

## Verificar que Todo Funciona

1. **Servidor corriendo:** `http://localhost:3001/api/health` debería responder `{"status":"ok"}`
2. **Frontend corriendo:** `http://localhost:3000` debería mostrar tu portfolio
3. **Admin funcionando:** `http://localhost:3000/admin/login` debería mostrar el formulario de login

