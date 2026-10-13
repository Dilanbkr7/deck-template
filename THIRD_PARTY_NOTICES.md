# Componentes y recursos de terceros

Las licencias de cada paquete se conservan en su distribución, instalada mediante `npm ci`. El archivo `package-lock.json` registra las versiones exactas. La reserva de derechos de DECK no sustituye estas licencias.

| Recurso | Aviso / referencia |
| --- | --- |
| Next.js, React, React DOM, Three.js | Licencias MIT de sus respectivas distribuciones. |
| React Three Fiber, Drei, Motion (`framer-motion`) | Licencias MIT de sus respectivas distribuciones. |
| Lucide React | Licencia ISC; consulta el paquete `lucide-react`. |
| GSAP / ScrollTrigger | [Licencia estándar de GSAP](https://gsap.com/community/standard-license/). Permite uso en sitios comerciales bajo sus condiciones; conserva los avisos del paquete. |
| Archivo Black | SIL Open Font License: `src/app/fonts/LICENSE-archivoblack.txt`. |
| Geist y Geist Mono | SIL Open Font License: `src/app/fonts/LICENSE-geist.txt` y `LICENSE-geistmono.txt`. |
| Imágenes de personaje | Recursos visuales suministrados en el proyecto original. Antes de redistribuir a terceros, el titular debe verificar los derechos de esos recursos y sus herramientas de generación. No se afirma exclusividad sobre las imágenes. |

## Portal luminoso

`EnergyPortal.tsx` es una implementación original mediante proyección de anillos sobre Canvas 2D. No se incluyeron el código, shader ni recursos de Orb de React Bits. El proyecto web original conserva su integración separadamente.

La [licencia MIT + Commons Clause de React Bits](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) permite el uso comercial en sitios y restringe la redistribución de los componentes como tales o en paquetes. Por eso esta copia reutilizable usa su propio portal.
