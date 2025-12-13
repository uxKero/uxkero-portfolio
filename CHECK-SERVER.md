# ✅ Checklist: Verificar que el Servidor Funcione

## 1. Verificar que el servidor esté corriendo

Abre una nueva terminal y ejecuta:

```bash
cd server
npm run dev
```

**Deberías ver:**
```
✅ Conectado a MySQL
✅ Tablas inicializadas correctamente
🚀 Servidor corriendo en http://localhost:3001
```

Si ves errores, revisa:
- ¿Están instaladas las dependencias? → `cd server && npm install`
- ¿Está configurado el `.env`? → Verifica `server/.env`
- ¿Railway está activo? → Verifica tu cuenta de Railway

## 2. Probar la conexión

Abre tu navegador y ve a:
```
http://localhost:3001/api/health
```

**Deberías ver:**
```json
{"status":"ok","message":"API funcionando correctamente"}
```

Si no funciona:
- El servidor no está corriendo → Inícialo con `npm run dev` en `server/`
- Error de conexión → Verifica que el puerto 3001 no esté ocupado

## 3. Verificar las tablas en MySQL

Las tablas se crean automáticamente cuando inicias el servidor. Si no se crean:

1. Verifica los logs del servidor
2. Asegúrate de que el usuario tenga permisos para crear tablas
3. Verifica las credenciales en `server/.env`

## 4. Crear usuario admin

**IMPORTANTE:** El servidor debe estar corriendo primero.

En otra terminal:
```bash
cd server
npm run create-admin admin tu_contraseña_segura
```

**Deberías ver:**
```
✅ Usuario admin creado/actualizado: admin
   Contraseña: tu_contraseña_segura
```

## 5. Probar el login desde el frontend

1. Asegúrate de que el frontend esté corriendo: `npm run dev`
2. Ve a: `http://localhost:3000/admin/login`
3. Inicia sesión con las credenciales que creaste

## Errores Comunes

### "ERR_CONNECTION_REFUSED"
**Solución:** El servidor no está corriendo. Inícialo con `cd server && npm run dev`

### "Access to storage is not allowed"
**Solución:** Ya está manejado en el código. Si persiste, verifica que no estés en un iframe.

### "Error conectando a MySQL"
**Solución:** 
- Verifica las credenciales en `server/.env`
- Asegúrate de que Railway esté activo
- Verifica que la base de datos exista

### "Tablas no se crean"
**Solución:**
- Verifica los logs del servidor
- Asegúrate de que el usuario tenga permisos
- Revisa la conexión a MySQL

