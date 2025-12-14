# 🔧 Solución: Puerto 3001 ya está en uso

## ❌ Error

```
Error: listen EADDRINUSE: address already in use :::3001
```

## ✅ Solución Rápida

### Opción 1: Cerrar la terminal anterior (Más fácil)

1. Busca otra terminal/ventana donde esté corriendo `npm run dev` o `npm run dev:api`
2. Presiona `Ctrl+C` para detenerlo
3. Vuelve a ejecutar: `npm run dev`

### Opción 2: Matar el proceso manualmente

**En PowerShell:**
```powershell
# Encontrar el proceso
netstat -ano | findstr :3001

# Verás algo como:
# TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    12345

# Matar el proceso (reemplaza 12345 con el PID que veas)
taskkill /PID 12345 /F
```

**En CMD:**
```cmd
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Opción 3: Reiniciar la computadora

Si nada funciona, reinicia la computadora (liberará todos los puertos).

## 🔍 Verificar

Después de liberar el puerto, ejecuta:
```bash
npm run dev
```

Deberías ver:
```
🚀 Servidor API corriendo en http://localhost:3001
```

## 📝 Prevenir en el futuro

- Siempre cierra las terminales anteriores antes de iniciar una nueva
- Usa `Ctrl+C` para detener procesos correctamente
- No ejecutes `npm run dev` múltiples veces sin cerrar las anteriores

