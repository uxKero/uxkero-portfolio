# 🔧 Solución: Error 404 al Ver Blog

## ❌ Problema

Cuando intentas ver un blog, aparece:
```
⚠️ El servidor API no está corriendo (404)
```

## ✅ Solución

### El problema

El servidor API (Express) no está corriendo. Necesitas que **ambos** estén activos:
- Frontend (Vite) en `http://localhost:3000`
- API (Express) en `http://localhost:3001`

### Solución Rápida

1. **Detén el servidor actual** (si está corriendo):
   - Presiona `Ctrl+C` en la terminal

2. **Inicia TODO con un solo comando**:
   ```bash
   npm run dev
   ```

   Esto iniciará automáticamente:
   - ✅ Frontend en `http://localhost:3000`
   - ✅ API en `http://localhost:3001`

3. **Verifica que ambos estén corriendo**:
   
   Deberías ver en la terminal algo como:
   ```
   🚀 Servidor API corriendo en http://localhost:3001
   [vite] ready in XXX ms
   ```

4. **Recarga la página del blog**

### Si `npm run dev` no inicia ambos

Si solo ves Vite pero no el servidor API:

1. **Verifica que `concurrently` esté instalado**:
   ```bash
   npm list concurrently
   ```

2. **Si no está, instálalo**:
   ```bash
   npm install --save-dev concurrently
   ```

3. **O inicia manualmente en dos terminales**:

   **Terminal 1:**
   ```bash
   npm run dev:frontend
   ```

   **Terminal 2:**
   ```bash
   npm run dev:api
   ```

### Verificar que funciona

1. Abre: `http://localhost:3001/api/health`
   - Deberías ver: `{"status":"ok","message":"API funcionando correctamente"}`

2. Abre: `http://localhost:3000/principios-ui-impacto-real`
   - Deberías ver el blog correctamente

## 📝 Nota

- **NO uses solo `vite`** - eso solo inicia el frontend
- **Usa `npm run dev`** - inicia frontend + API automáticamente
- Si el servidor API no se inicia, revisa los errores en la terminal

