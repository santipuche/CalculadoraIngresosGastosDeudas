# Instrucciones para agregar el logo

Para completar la configuración del logo de la app, sigue estos pasos:

## Pasos:

1. **Descargar la imagen:**
   - Abre esta URL en tu navegador: https://i.postimg.cc/QBVHdvbZ/478b64ec61ff4533a5418e6244be480d.jpg
   - Haz clic derecho → "Guardar imagen como..."

2. **Convertir a PNG (recomendado para mejor calidad como icono):**
   - Usa una herramienta online como https://image.online-convert.com/convert-to-png
   - O usa un editor de imágenes como GIMP, Photoshop, o Preview (Mac)
   - Guarda como `logo.png`

3. **Colocar en el proyecto:**
   - Copia el archivo `logo.png` a la carpeta: `/home/user/CalculadoraObjetivoMensual/public/`

4. **Verificar:**
   - Ejecuta `npm run dev` para ver el logo en acción
   - El logo aparecerá como favicon en la pestaña del navegador
   - También se usará como icono cuando se instale la PWA

## Nota:
Los archivos `index.html` y `vite.config.js` ya están configurados para usar `logo.png`.
Solo necesitas colocar la imagen en la carpeta `public/`.

---

Una vez completado, puedes eliminar este archivo de instrucciones.
