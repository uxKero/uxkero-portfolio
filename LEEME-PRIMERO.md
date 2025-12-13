# ⚠️ IMPORTANTE: Cómo Iniciar el Sistema

## 🚨 Problema Común: Error 404 en /api/auth/login

Si ves este error:
```
POST http://localhost:3000/api/auth/login 404 (Not Found)
```

**Causa:** Estás usando `npm run dev` que NO ejecuta las funciones serverless.

## ✅ Solución: Usar Vercel CLI

### Instalación (Solo una vez)

```bash
npm install -g vercel
```

### Iniciar el Sistema

```bash
npm run dev:api
```

O directamente:
```bash
vercel dev
```

**NO uses:** `npm run dev` (solo inicia Vite, sin APIs)

## 📋 Checklist Completo

1. ✅ **Tablas creadas** → Ejecuta `EJECUTAR-AHORA-DESARROLLO.sql` en TablePlus
2. ✅ **Usuario admin creado** → Incluido en el SQL anterior
3. ✅ **`.env.local` creado** → Con `DATABASE_URL` y `JWT_SECRET`
4. ✅ **Iniciar con `vercel dev`** → NO con `npm run dev`

## 🔑 Credenciales

- **Usuario:** `admin`
- **Contraseña:** `admin123`

## 🎯 Comandos Rápidos

```bash
# Desarrollo (con APIs)
npm run dev:api

# O directamente
vercel dev

# Solo frontend (sin APIs - NO recomendado)
npm run dev
```

## 📝 Notas

- `vercel dev` ejecuta Vite + funciones serverless
- `npm run dev` solo ejecuta Vite (sin APIs)
- Para producción, despliega a Vercel

