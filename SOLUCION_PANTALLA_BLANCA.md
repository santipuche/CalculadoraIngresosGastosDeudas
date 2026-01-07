# Solución: Pantalla en Blanco en Móvil

Si ves una pantalla en blanco al acceder a la app desde móvil, sigue estos pasos:

## Opción 1: Limpiar caché del navegador (Recomendado)

### En Chrome/Safari móvil:
1. Abre la configuración del navegador
2. Ve a "Privacidad" o "Configuración del sitio"
3. Busca "Borrar datos de navegación" o "Borrar caché"
4. Selecciona:
   - ✅ Caché
   - ✅ Cookies y datos del sitio
5. Confirma y limpia
6. Vuelve a abrir la app

### Método rápido (funciona en la mayoría de móviles):
1. Abre la URL de tu app
2. Mantén presionado el botón de recargar (⟳) en el navegador
3. Selecciona "Recargar sin caché" o "Recarga forzada"

## Opción 2: Modo incógnito

1. Abre el navegador en modo incógnito/privado
2. Accede a la URL de la app
3. Esto cargará la versión más reciente sin caché

## Opción 3: Desinstalar PWA (si la instalaste)

Si instalaste la app en tu pantalla de inicio:

1. Mantén presionado el ícono de la app
2. Selecciona "Desinstalar" o "Eliminar de inicio"
3. Vuelve a acceder desde el navegador
4. Reinstala la PWA si lo deseas

## Opción 4: Actualización manual del Service Worker

1. Abre la app en el navegador móvil
2. Abre las herramientas de desarrollo (si están disponibles)
3. Ve a "Application" → "Service Workers"
4. Haz clic en "Unregister"
5. Recarga la página

## ¿Por qué sucede esto?

La app es una Progressive Web App (PWA) que usa un Service Worker para funcionar offline. A veces, el service worker cachea una versión antigua de la app, especialmente después de actualizaciones importantes.

## Cambios recientes que requieren limpieza de caché:

- ✅ Actualización del sistema de IDs para transacciones
- ✅ Nuevo formato de moneda ($X.XXX.XXX,XX)
- ✅ Nuevo nombre de la app
- ✅ Actualización de rutas del logo
- ✅ Cambio de nombre del repositorio

Una vez que limpies el caché, la app debería funcionar correctamente con todas las nuevas características.
