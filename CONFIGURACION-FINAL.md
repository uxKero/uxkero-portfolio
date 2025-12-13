# ✅ Configuración Final - Base de Datos: uxkeroblog

## 📋 Resumen

Tanto en **desarrollo local** como en **producción (Railway)**, la base de datos se llama:
- **Nombre:** `uxkeroblog`
- **Local:** `localhost:3308/uxkeroblog`
- **Railway:** `yamanote.proxy.rlwy.net:47650/uxkeroblog`

## 🏠 Desarrollo Local

### Configuración en `.env.local`

```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-dev
```

### Conectar TablePlus/DBeaver

- **Host:** `localhost`
- **Port:** `3308`
- **User:** `root`
- **Password:** (vacío)
- **Database:** `uxkeroblog`

### Crear Tablas

Ejecuta: `EJECUTAR-AHORA-DESARROLLO.sql`

## 🚀 Producción (Railway)

### Configuración en Vercel (Environment Variables)

```env
DATABASE_URL=mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/uxkeroblog
JWT_SECRET=uxkero-admin-secret-key-production
```

### Conectar TablePlus/DBeaver

- **Host:** `yamanote.proxy.rlwy.net`
- **Port:** `47650`
- **User:** `root`
- **Password:** `BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN`
- **Database:** `uxkeroblog`

### Crear Tablas

Ejecuta: `EJECUTAR-AHORA-PRODUCCION.sql`

## ✅ Ventajas de Usar el Mismo Nombre

- ✅ Mismo nombre en ambos entornos = menos confusión
- ✅ Mismo SQL funciona en ambos
- ✅ Fácil cambiar entre entornos
- ✅ Misma estructura siempre

## 🔄 Cambiar entre Entornos

Solo cambia la URL de conexión en las variables de entorno:

**Desarrollo:**
```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
```

**Producción:**
```env
DATABASE_URL=mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/uxkeroblog
```

El nombre de la base de datos (`uxkeroblog`) es el mismo en ambos casos.

## 📝 Notas

- Las tablas se crean en `uxkeroblog` en ambos entornos
- El usuario admin se crea en `uxkeroblog` en ambos entornos
- Los datos están separados por entorno (diferentes servidores)
- Mismo nombre = misma estructura = menos errores

