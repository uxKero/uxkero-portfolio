# 🚀 CÓMO INICIAR EL SERVIDOR

## ⚠️ IMPORTANTE: El servidor DEBE estar corriendo antes de usar el panel de admin

### Paso 1: Abrir Terminal para el Servidor

Abre una **nueva terminal** (PowerShell, CMD, o la terminal de tu IDE).

### Paso 2: Ir al Directorio del Servidor

```bash
cd C:\Proyectos\uxkero\server
```

### Paso 3: Verificar que Existe el Archivo .env

Asegúrate de que existe `server/.env` con este contenido:

```env
MYSQLHOST=mysql.railway.internal
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN
MYSQLDATABASE=railway
JWT_SECRET=uxkero-admin-secret-key-2025
PORT=3001
```

### Paso 4: Instalar Dependencias (Solo la Primera Vez)

```bash
npm install
```

### Paso 5: Iniciar el Servidor

```bash
npm run dev
```

### ✅ Deberías Ver Esto:

```
✅ Conectado a MySQL
✅ Tablas inicializadas correctamente
🚀 Servidor corriendo en http://localhost:3001
```

**¡NO CIERRES ESTA TERMINAL!** El servidor debe seguir corriendo.

### Paso 6: Verificar que Funciona

Abre tu navegador y ve a:
```
http://localhost:3001/api/health
```

Deberías ver:
```json
{"status":"ok","message":"API funcionando correctamente"}
```

### Paso 7: Crear Usuario Admin (En Otra Terminal)

Abre **otra terminal nueva** y ejecuta:

```bash
cd C:\Proyectos\uxkero\server
npm run create-admin admin tu_contraseña_segura
```

Ejemplo:
```bash
npm run create-admin admin MiPassword123
```

### Paso 8: Usar el Panel de Admin

Ahora sí, ve a:
```
http://localhost:3000/admin/login
```

Y usa las credenciales que creaste.

---

## 🔧 Solución de Problemas

### Error: "ERR_CONNECTION_REFUSED"

**Causa:** El servidor no está corriendo.

**Solución:**
1. Ve a la terminal donde debería estar el servidor
2. Verifica que veas "🚀 Servidor corriendo en http://localhost:3001"
3. Si no lo ves, ejecuta `npm run dev` en `server/`

### Error: "Cannot find module"

**Causa:** Las dependencias no están instaladas.

**Solución:**
```bash
cd server
npm install
```

### Error: "Error conectando a MySQL"

**Causa:** Credenciales incorrectas o Railway no está activo.

**Solución:**
1. Verifica `server/.env`
2. Asegúrate de que Railway esté activo
3. Verifica las credenciales de MySQL

### El servidor se cierra inmediatamente

**Causa:** Error en la conexión a MySQL o en la inicialización.

**Solución:**
1. Revisa los mensajes de error en la terminal
2. Verifica las credenciales en `server/.env`
3. Asegúrate de que Railway esté activo

---

## 📝 Notas

- El servidor debe estar corriendo **todo el tiempo** mientras uses el panel de admin
- Puedes dejar el servidor corriendo en segundo plano
- Si cierras la terminal, el servidor se detiene
- Para detener el servidor, presiona `Ctrl + C` en la terminal

