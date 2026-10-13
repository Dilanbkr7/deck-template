# DECK Template

Base reutilizable de una landing de diseño web y software a medida. Hero de **tres escenas de scroll**, personaje en capas 2.5D, portal luminoso original, partículas 3D, tipografía interactiva y secciones de servicios/contacto.

La copia incluye solo el código activo, tres imágenes WebP y las fuentes locales. No requiere videos, Git LFS, claves, cuenta de un proveedor ni servicios externos para funcionar. Las dependencias se descargan al instalar.

## Empezar

Usa **Node.js 24 LTS** y Git. La versión está en `.nvmrc`.

```bash
git clone https://github.com/Dilanbkr7/deck-template.git mi-proyecto
cd mi-proyecto
npm ci
npm run dev
```

Abre `http://localhost:3000`. Si está ocupado: `npm run dev -- --port 3002`.

```bash
npm run check   # ESLint + pruebas + compilación de producción
npm run build
npm start
```

`npm start` necesita una compilación previa. No subas `node_modules` ni `.next`; se regeneran.

## Dónde personalizar

| Archivo o carpeta | Qué cambiar |
| --- | --- |
| `src/config/site.ts` | Marca, subtítulo del estudio, ubicación, metadatos y enlace público de contacto. El enlace inicial apunta a `example.com`: reemplázalo antes de publicar. |
| `src/components/hero/layered/scenes.ts` | Los tres titulares, descripciones, CTAs, colores, imágenes y orden de las escenas. Mantén tres entradas para conservar este recorrido. |
| `public/media/hero-character/` | Tres personajes recortados en WebP transparente. Usa dimensiones y encuadres consistentes para que no salten entre escenas. |
| `src/components/hero/layered/LayeredHero.tsx` | Director GSAP/ScrollTrigger: transiciones, desplazamiento, pin y navegación entre capítulos. También contiene los microtextos de cabecera y pie del hero. |
| `src/components/hero/layered/ParallaxHero.module.css` | Fondo, perspectiva de capas, posición del personaje, lente de desenfoque, tamaños y adaptación móvil. |
| `src/components/hero/portal/EnergyPortal.tsx` | Portal propio: proyección, colores, trazos, luz en movimiento y reacción al puntero. No contiene el componente Orb de React Bits. |
| `src/components/hero/layered/DepthAtmosphere.tsx` | Partículas reales de Three.js / React Three Fiber / Drei. Densidad, recorrido y material. |
| `src/components/hero/cinematic/InteractiveTitle.tsx` | Interacción del texto: iluminación, prisma, enfoque y onda. |
| `src/components/hero/cinematic/MagneticLink.tsx` | Movimiento de enlaces al acercar el cursor. |
| `src/components/hero/cinematic/siteCopy.ts` | Textos de servicios, metodología y contacto debajo del hero. |
| `src/components/hero/cinematic/StudioContent.tsx` | Estructura de esas secciones. |
| `src/components/hero/cinematic/Cinema.module.css` | Tipografía interactiva y estilos de las secciones inferiores. |
| `src/app/layout.tsx` y `src/app/fonts/` | Fuentes locales y estructura global; sus licencias están junto a los archivos. |
| `src/app/page.tsx` y `src/components/hero/Hero.tsx` | Entrada de la página y composición del hero con el resto del sitio. |
| `.github/workflows/ci.yml` | Validación automática al subir a `main` o abrir un pull request. |

## Cómo funciona

1. GSAP fija el hero durante tres alturas de ventana. Cada tramo cambia la escena con una transición de opacidad y desenfoque. No son exactamente tres golpes de rueda: cada dispositivo tiene una sensibilidad diferente.
2. El fondo, el personaje, la plataforma, el texto y las partículas tienen movimientos independientes. Las imágenes son planas con transparencia: el efecto del personaje es 2.5D, no un modelo con geometría 3D.
3. El portal usa Canvas 2D y proyecta anillos con perspectiva. Un único canvas de React Three Fiber dibuja las partículas de las escenas. Solo se anima el portal activo; se limita la resolución para reducir carga.
4. Motion controla apariciones y enlaces. El botón **AMBIENTE** pausa los efectos decorativos; el scroll continúa funcionando.
5. Con `prefers-reduced-motion` las escenas aparecen en una lectura vertical sin pin ni partículas. Los controles mantienen navegación por teclado y un enlace permite saltar el hero.

Las imágenes optimizadas mantienen el repositorio pequeño, pero las librerías 3D todavía tienen un coste de descarga y GPU. Mide en móviles reales antes de entregar cada proyecto. Evita sumar videos o duplicar canvases 3D sin revisar ese coste.

## Trabajar con ramas

`main` es la base estable. Una rama comparte los archivos del proyecto y representa otra línea de cambios; cambiar de rama actualiza esos archivos.

```bash
git switch main
git pull --ff-only
git switch -c codex/experimento-portal
# Cambia los efectos y comprueba el resultado
npm run check
git add src
git commit -m "feat: refine portal lighting"
git push -u origin codex/experimento-portal
```

Abre un pull request hacia `main`. Revisa la comparación y las comprobaciones antes de fusionar. Para volver a la base, guarda tus cambios en un commit y ejecuta:

```bash
git switch main
git pull --ff-only
```

No uses `reset --hard` para cambiar de rama ni subas experimentos directamente a la base si todavía quieres conservarla estable.

## Convertir un clon en otro proyecto

Clonar conserva `origin` apuntando a esta plantilla. Para evitar subir el trabajo de un cliente aquí, crea primero su repositorio vacío y cambia el destino dentro del clon:

```bash
git remote rename origin template
git remote add origin https://github.com/TU-USUARIO/TU-NUEVO-PROYECTO.git
git push -u origin main
```

Esto conserva la base inicial como historial del nuevo proyecto. Antes de cada push verifica `git remote -v` y `git status`. Si activas **Template repository** en Settings de GitHub, podrás usar **Use this template** para crear repositorios nuevos sin compartir historial.

## Datos y publicación

- El destino de contacto es de demostración. No hay formulario, backend, analítica ni credenciales preconfiguradas.
- `.env*`, claves, carpetas locales, compilaciones y dependencias están excluidas de Git. Ningún archivo `.env` es necesario para iniciar esta base.
- Todo lo que escribas en `src/config/site.ts` y en componentes del navegador es público. Nunca pongas contraseñas o tokens allí ni en variables `NEXT_PUBLIC_*`.
- El repositorio es público: las personas pueden leer su código y sus recursos. Revisa [LICENSE.md](LICENSE.md) y [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) antes de redistribuirlo.

## Antes de entregar

Cambia marca, contacto, metadatos e imágenes; comprueba móvil y escritorio, las tres escenas, la pausa y movimiento reducido; ejecuta `npm run check`; prueba `npm run build` y `npm start`. El servicio de desarrollo no sustituye una publicación de producción.
