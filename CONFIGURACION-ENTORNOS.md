# 🔧 Configuración de Entornos

## 📋 Desarrollo Local vs Producción

El sistema está configurado para usar automáticamente:
- **Desarrollo:** Base de datos local (localhost:3308)
- **Producción:** Railway (yamanote.proxy.rlwy.net:47650)

## 🏠 Desarrollo Local

### Configuración

Crea o edita `server/.env` con:

```env
# Base de datos local
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog

# JWT Secret
JWT_SECRET=uxkero-admin-secret-key-dev

# Server Port
PORT=3001
```

### Conectar TablePlus a Local

1. Abre TablePlus
2. Crea nueva conexión MySQL:
   - **Host:** `localhost`
   - **Port:** `3308`
   - **User:** `root`
   - **Password:** (vacío)
   - **Database:** `uxkeroblog`

### Crear Tablas en Local

1. Conéctate a `uxkeroblog` en TablePlus
2. Abre `TABLAS-SQL.sql`
3. Copia y ejecuta el SQL en TablePlus

### Crear Usuario Admin Local

```bash
cd server
npm run create-admin admin tu_contraseña
```

## 🚀 Producción (Railway)

### Configuración

Crea o edita `server/.env` con:

```env
# URL pública de Railway (mismo nombre de BD: uxkeroblog)
MYSQL_PUBLIC_URL=mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/uxkeroblog

# JWT Secret (producción - CAMBIAR)
JWT_SECRET=uxkero-admin-secret-key-production-CHANGE-THIS

# Server Port
PORT=3001
```

### Conectar TablePlus a Railway

1. Abre TablePlus
2. Crea nueva conexión MySQL:
   - **Host:** `yamanote.proxy.rlwy.net`
   - **Port:** `47650`
   - **User:** `root`
   - **Password:** `BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN`
   - **Database:** `uxkeroblog` (mismo nombre que en local)

O importa desde URL:
```
mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/railway
```

### Crear Tablas en Railway

1. Conéctate a `railway` en TablePlus
2. Abre `TABLAS-SQL.sql`
3. Copia y ejecuta el SQL en TablePlus

### Crear Usuario Admin en Railway

```bash
cd server
# Asegúrate de que server/.env tenga la configuración de Railway
npm run create-admin admin tu_contraseña
```

## 🔄 Cambiar entre Entornos

### Para Desarrollo Local

Edita `server/.env`:
```env
DATABASE_URL=mysql://root:@localhost:3308/uxkeroblog
```

### Para Producción (Railway)

Edita `server/.env`:
```env
MYSQL_PUBLIC_URL=mysql://root:BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN@yamanote.proxy.rlwy.net:47650/railway
```

O usa las variables individuales:
```env
MYSQLHOST=yamanote.proxy.rlwy.net
MYSQLPORT=47650
MYSQLUSER=root
MYSQLPASSWORD=BHXeMJftXFWKfLIeyOruIrXLbrOYhGuN
MYSQLDATABASE=uxkeroblog
```

## ✅ Verificación

Al iniciar el servidor, verás:

**Desarrollo:**
```
✅ Conectado a MySQL - Local (Desarrollo)
   Host: localhost:3308
   Database: uxkeroblog
✅ Tablas encontradas en la base de datos
```

**Producción:**
```
✅ Conectado a MySQL - Railway (Producción)
   Host: yamanote.proxy.rlwy.net:47650
   Database: uxkeroblog
✅ Tablas encontradas en la base de datos
```

## 📝 Notas

- El sistema detecta automáticamente si es local o remoto
- SSL se habilita automáticamente para conexiones remotas
- Puedes tener ambas conexiones en TablePlus y cambiar fácilmente
- Los datos de desarrollo y producción están completamente separados

