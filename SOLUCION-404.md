# 🔧 Solución al Error 404 en /api/auth/login

## ❌ Problema

Estás viendo:
```
POST http://localhost:3000/api/auth/login 404 (Not Found)
```

## ✅ Causa

Estás usando `npm run dev` (Vite), que **NO ejecuta las funciones serverless** de Vercel.

Las funciones en `api/` solo funcionan con `vercel dev`.

## 🚀 Solución Rápida

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Detener el servidor actual

Si tienes `npm run dev` corriendo, deténlo con `Ctrl+C`

### Paso 3: Iniciar con Vercel

```bash
vercel dev
```

La primera vez te pedirá:
- Set up and deploy? → **Y** (Yes)
- Which scope? → Selecciona tu cuenta
- Link to existing project? → **N** (No, crear nuevo)
- What's your project's name? → Presiona Enter (usa el nombre por defecto)
- In which directory is your code located? → **./** (Enter)

### Paso 4: Configurar Variables de Entorno

Cuando `vercel dev` pregunte por variables de entorno:

```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-dev
```

O crea `.env.local` antes de ejecutar `vercel dev`.

### Paso 5: Verificar

Deberías ver:
```
> Ready! Available at http://localhost:3000
```

Ahora prueba:
```
http://localhost:3000/api/health
```

Deberías ver: `{"status":"ok","message":"API funcionando correctamente"}`

### Paso 6: Iniciar Sesión

1. Ve a: `http://localhost:3000/admin/login`
2. Usuario: `admin`
3. Contraseña: `admin123`
4. Click en "Iniciar Sesión"

## ✅ Resumen

**❌ NO funciona:**
```bash
npm run dev  # Vite no ejecuta funciones serverless
```

**✅ SÍ funciona:**
```bash
vercel dev  # Ejecuta Vite + funciones serverless
```

## 📝 Nota sobre localStorage

El error de localStorage está silenciado en el código, pero puede seguir apareciendo en la consola. Es inofensivo y no afecta la funcionalidad.

## 🎯 Alternativa: Desplegar a Vercel

Si prefieres no usar `vercel dev` localmente:

1. Despliega a Vercel: `vercel --prod`
2. Configura las variables de entorno en Vercel
3. Usa el panel admin en producción

Pero para desarrollo, `vercel dev` es la mejor opción.

