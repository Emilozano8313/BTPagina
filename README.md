BlackTapioca — Proyecto web (single-page)
=========================================

Resumen
-------
Este repositorio contiene una página estática de un negocio de Tapioca Frappe (BlackTapioca). El proyecto está refactorizado en módulos CSS y JS para facilitar mantenimiento y escalabilidad.

Estructura principal (actual)
----------------------------
- index.html  — Página principal (semántica: header, nav, main, aside, footer)
- css/
  - colors.css
  - typography.css
  - layout.css
  - components.css
  - buttons.css
  - main-styles.css  (importa los anteriores)
  - styles.css       (versión legacy / copia)
- js/
  - cart.js          (lógica de carrito: API global `Cart`)
  - ui.js            (renderizado y bindings UI)
  - app.js           (versión legacy / copia)
  - main-script.js   (otra copia legacy)
- img/ (imágenes usadas por la web)

Cómo ejecutar localmente
------------------------
La forma más rápida de probar la página localmente es usando un servidor HTTP simple. Desde la carpeta `PaginaWeb` ejecuta uno de los siguientes comandos según tu entorno:

- Python 3 (recomendado):

```bash
cd /home/emi/Documentos/PaginaWeb
python3 -m http.server 8000
```

Luego abre en tu navegador: http://localhost:8000

Qué revisar después de levantar el servidor
- Verifica que las imágenes se carguen (hero y tarjetas).
- Añade un producto al carrito y prueba que el botón "Pedir por WhatsApp" genere el mensaje correcto.

Guía rápida de mantenimiento
---------------------------
- Actualizar precios / productos:
  - Edita `index.html` en la sección `#menu`. Cada `<article class="card-item">` tiene `data-name` y `data-price`. Mantén `data-price` en formato numérico (ej. `88.00`).
  - Cambia el texto visible en `<h4>` y `<p>` según sea necesario.

- Cambiar número de WhatsApp usado para checkout:
  - Edita `js/ui.js` y `js/cart.js` (en el lugar donde se construye `wa.href`) y reemplaza `7774467451` por tu número en formato internacional si lo deseas.

- Añadir nuevas imágenes:
  - Coloca las imágenes en `img/` y referencia la ruta relativa (ej. `img/nuevo-sabor.jpg`) desde `index.html`.

- Estilos y componentes:
  - `css/layout.css` controla grid y estructura general.
  - `css/components.css` contiene estilos de tarjetas, cart-panel y footer.
  - `css/buttons.css` contiene estilos de botones y CTAs.
  - Usa `css/main-styles.css` como punto de import (no edites si prefieres separar módulos).

Limpieza recomendada (opcional)
------------------------------
Actualmente hay archivos “legacy” que son copias de versiones anteriores y pueden causar confusión si se mantienen:
- `css/styles.css` (copia completa de estilos antiguos)
- `js/app.js` y `js/main-script.js` (copias antiguas del script)

Si adoptas la estructura modular (recomendada), elimina los archivos legacy para evitar duplicidad:

```bash
rm css/styles.css
rm js/app.js
rm js/main-script.js
```

Comprobación automática de rutas (resultado)
------------------------------------------
He analizado `index.html` y comprobado la presencia de los archivos referenciados. Estado:

- css/colors.css                 — Encontrado
- css/typography.css             — Encontrado
- css/main-styles.css            — Encontrado
- js/cart.js                     — Encontrado
- js/ui.js                       — Encontrado
- img/logoBlanco.png             — Encontrado
- img/Chocolate.jpg              — Encontrado
- img/Mazapan.jpg                — Encontrado
- img/MoraAzul.jpg               — Encontrado
- img/Taro.jpg                   — Encontrado
- img/Matcha.jpg                 — Encontrado

No se encontraron rutas faltantes en `index.html`.

Notas finales y buenas prácticas
--------------------------------
- Control de versiones: mantén el proyecto en git y crea ramas para cambios grandes.
- Minificación: para producción, minifica CSS/JS y optimiza imágenes.
- Internacionalización: ahora el sitio está en español; si más adelante quieres multi-idioma, externaliza textos a JSON y carga según la preferencia del usuario.

Si quieres, puedo:
- Eliminar los archivos legacy automáticamente.
- Generar un pequeño script `npm` o `Makefile` para tareas comunes (levantar servidor, limpiar, minificar).
- Ejecutar una comprobación más profunda (por ejemplo validar que todas las imágenes no estén corruptas o medir tamaños).

Dime qué prefieres que haga después y lo implemento.