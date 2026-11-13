# TASKS: backlog del MVP

Estados: `[ ]` pendiente · `[~]` en curso · `[x]` completada.
Trabajar en orden salvo que una tarea indique lo contrario.

## Semana 1: base

- [x] **T01** Inicializar proyecto con Vite, React, TypeScript, ESLint, Prettier y Vitest.
- [x] **T02** Layout base con header y navegación: Inicio, Visor, Guías, Glosario, Apoyar, Legal.
- [x] **T03** Crear `src/data/components.json` con 6 componentes (placa madre, CPU, RAM, GPU, fuente, almacenamiento). Usar el modelo de datos de `docs/MVP.md`.
- [x] **T04** Validar `components.json` con zod y agregar tests.
- [x] **T05** Cargar un `.glb` de prueba en el visor (puede ser un cubo placeholder).
- [x] **T06** Escena 3D con cámara, luces, controles de órbita y encuadre automático.

## Semana 2: visor

- [x] **T07** Selección por clic de nodos con resaltado de la pieza activa.
- [x] **T08** Panel de detalle: nombre, función, especificaciones clave y enlaces a guías.
- [x] **T09** Lista lateral accesible por teclado, sincronizada con la selección del visor.
- [ ] **T10** Fallback sin WebGL: lista de componentes e imagen de respaldo.
- [ ] **T11** Test que verifica que cada `modelNode` existe como nodo en el `.glb`.

## Semana 3: contenido

- [ ] **T12** Cargar guías desde `content/guides/` con frontmatter validado.
- [ ] **T13** Página de guía: pasos, errores comunes, "cuándo pedir ayuda profesional" y `SafetyNotice` cuando corresponda.
- [ ] **T14** Redactar guía "Armado de PC paso a paso". Marcar contenido pendiente de revisión técnica.
- [ ] **T15** Redactar guía "Cableado básico". Marcar contenido pendiente de revisión técnica.
- [ ] **T16** Redactar guía "La PC no enciende". Marcar contenido pendiente de revisión técnica.
- [ ] **T17** Glosario con búsqueda por texto.
- [ ] **T18** Página "Apoyar" con URL configurable en `src/config.ts` y texto de transparencia.

## Semana 4: cierre

- [ ] **T19** Página Legal: aviso de responsabilidad y créditos de modelos, textos e imágenes.
- [ ] **T20** Analítica sin cookies (con el proveedor que defina el autor).
- [ ] **T21** SEO básico: title, meta description, Open Graph y sitemap.
- [ ] **T22** Smoke E2E con Playwright: inicio → visor → guía.
- [ ] **T23** Optimización: compresión de `.glb`, carga diferida del visor y revisión de Lighthouse en móvil.
- [ ] **T24** Deploy estático y revisión en celular y escritorio.

## Post-MVP (no tocar sin acuerdo)

- Simulador de compatibilidad entre piezas.
- Enlaces de afiliado.
- Guaraní.
- Videos complementarios.
