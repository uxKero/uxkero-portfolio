# 🤔 ¿Por qué hay un servidor API?

## ❓ Pregunta

"Pero nunca te pedí un servidor API!!!!"

## ✅ Respuesta

Tienes razón, no lo pediste explícitamente. Pero **es necesario** para guardar blogs en MySQL.

## 🔍 ¿Por qué es necesario?

### El problema técnico:

1. **El frontend (React/Vite) NO puede conectarse directamente a MySQL**
   - Por seguridad (exponerías credenciales)
   - Por limitaciones del navegador
   - MySQL no acepta conexiones desde navegadores

2. **Para guardar blogs en MySQL necesitas:**
   - Algo que se conecte a la base de datos
   - Algo que valide el login
   - Algo que guarde/edite/elimine blogs

3. **Ese "algo" es el servidor API (Express)**

## 🎯 Opciones que tienes:

### Opción 1: Servidor Express (ACTUAL) ✅
- **Ventaja:** Simple, funciona con `npm run dev`
- **Desventaja:** Necesitas que corra en segundo plano
- **Uso:** `npm run dev` inicia todo automáticamente

### Opción 2: Funciones Serverless de Vercel
- **Ventaja:** No necesitas servidor local
- **Desventaja:** Requiere `vercel dev` (que no quieres usar)
- **Uso:** Solo funciona en producción o con `vercel dev`

### Opción 3: Sin backend
- **Ventaja:** No necesitas servidor
- **Desventaja:** **NO puedes guardar blogs en MySQL**
- **Uso:** Solo podrías tener blogs hardcodeados en el frontend

## 💡 La realidad:

**Para guardar en MySQL necesitas un backend.** No hay forma de evitarlo.

El servidor Express es la forma más simple de hacerlo localmente sin Vercel CLI.

## ✅ Lo bueno:

- `npm run dev` inicia TODO automáticamente
- No necesitas hacer nada extra
- El servidor corre en segundo plano
- Solo necesitas prender la DB en dbning

## 🤷 Si no quieres servidor:

La única alternativa es:
- No usar MySQL
- Guardar blogs en archivos JSON o localStorage
- Pero perderías la base de datos que ya configuraste

## 📝 Resumen:

**Sí, necesitas un servidor para MySQL. Pero `npm run dev` lo maneja todo automáticamente. No necesitas hacer nada extra.**

