# 🚀 Inicio Rápido - Sin Vercel CLI

## ✅ Solución Simple

Ahora tienes un servidor Express que funciona **sin necesidad de Vercel CLI**.

## 📋 Pasos

### 1. Instalar dependencias (si faltan)

```bash
npm install
```

### 2. Configurar `.env.local`

Crea `.env.local` en la raíz:

```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-dev
```

### 3. Iniciar TODO (Frontend + API)

```bash
npm run dev:all
```

Esto iniciará:
- **Frontend:** `http://localhost:3000` (Vite)
- **API:** `http://localhost:3001` (Express)

### 4. O iniciar por separado

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - API:**
```bash
npm run dev:api
```

## 🔑 Login

1. Ve a: `http://localhost:3000/admin/login`
2. Usuario: `admin`
3. Contraseña: `admin123`

## ✅ Verificar que funciona

Prueba: `http://localhost:3001/api/health`

Deberías ver: `{"status":"ok","message":"API funcionando correctamente"}`

## 📝 Notas

- **Desarrollo:** Usa `npm run dev:all` (Express en puerto 3001)
- **Producción:** Las funciones serverless en `api/` se usan automáticamente en Vercel
- **No necesitas Vercel CLI** para desarrollo local

## 🎯 Resumen

```bash
# Todo en uno
npm run dev:all

# O por separado
npm run dev      # Frontend (puerto 3000)
npm run dev:api  # API (puerto 3001)
```

