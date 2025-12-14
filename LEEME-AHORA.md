# 🚨 INICIO DE SESIÓN - PASOS SIMPLES

## ✅ Solo necesitas:

### 1. Prender la base de datos en dbning
- Abre dbning
- Conéctate a: `localhost:3308`
- Base de datos: `uxkeroblog`

### 2. Ejecutar UN solo comando:

```bash
npm run dev
```

**¡Eso es todo!** Esto iniciará automáticamente:
- ✅ Frontend en `http://localhost:3000`
- ✅ API en `http://localhost:3001`

## 🔑 Credenciales

- **Usuario:** `admin`
- **Contraseña:** `admin123`

## ✅ Verificar que funciona

1. Deberías ver en la terminal:
   ```
   🚀 Servidor API corriendo en http://localhost:3001
   [vite] ready in XXX ms
   ```

2. Prueba en el navegador: `http://localhost:3001/api/health`
   - Deberías ver: `{"status":"ok","message":"API funcionando correctamente"}`

3. Ve a: `http://localhost:3000/admin/login`
   - Usuario: `admin`
   - Contraseña: `admin123`

## ❌ Si ves error 404

**Significa que la base de datos no está corriendo o el servidor no se inició.**

**Solución:**
1. Verifica que dbning esté corriendo y conectado a `localhost:3308`
2. Verifica que la base de datos `uxkeroblog` exista
3. Reinicia: `npm run dev`

## 📝 Nota

- **Solo necesitas prender la DB en dbning**
- **Solo ejecutas `npm run dev`**
- **Todo lo demás es automático**

