# CLAUDE.md

## Proyecto

Sitio estático en español sobre componentes de PC, armado y diagnóstico básico, con un visor 3D de modelos hechos en Blender. El alcance completo está en `docs/MVP.md`.

Antes de empezar cualquier tarea, lee `docs/MVP.md` y `docs/TASKS.md`.

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run test         # tests unitarios (Vitest)
npm run lint         # ESLint + Prettier
npm run e2e          # smoke test con Playwright
```

Antes de dar una tarea por terminada: `npm run lint && npm run test && npm run build`.

## Estructura

```
src/
  components/    UI reutilizable (SafetyNotice, Layout, Card, etc.)
  viewer/        escena 3D, carga de .glb, selección de piezas
  guides/        render de guías y frontmatter
  glossary/      glosario y búsqueda
  data/          components.json y validación con zod
  config.ts      URL de donaciones, proveedor de analítica
content/guides/  guías en Markdown
public/models/   modelos .glb (los provee el autor)
docs/            MVP.md, TASKS.md
```

## Reglas de trabajo

- **Una tarea a la vez.** Toma la siguiente tarea pendiente de `docs/TASKS.md`, márcala como en curso y, al terminarla, márcala como completada.
- **Commits pequeños,** con un solo tema por commit.
- **Tests obligatorios** para la lógica de datos, la validación de frontmatter y la coincidencia entre nodos del `.glb` y `modelNode`.

## Contenido técnico

- Las especificaciones, voltajes, medidas y recomendaciones deben tener fuente verificable. Si no la tienes, escribe `"pendiente de verificar"` en el campo. No inventes datos.
- Toda guía con `safetyWarning: true` debe mostrar el componente `SafetyNotice`. Esto aplica a electricidad, fuentes de poder y piezas con carga residual.
- Las guías de reparación siempre incluyen la sección "Cuándo pedir ayuda profesional".

## Modelos 3D

- No generes modelos 3D ni los inventes. Los provee el autor en `public/models/`.
- Si falta un modelo, muestra un placeholder y registra la advertencia en consola.
- Cada pieza clicable es un nodo cuyo nombre coincide con `modelNode` en `components.json`.

## Restricciones del MVP

- No agregues pagos, cuentas de usuario, comentarios ni backend.
- La URL de donaciones se lee desde `src/config.ts`. No la pongas hardcodeada en componentes.
- No uses analítica con cookies de terceros.
- Todo el texto visible va en español.
- El visor debe tener fallback si WebGL no está disponible.

## Formato de guías

Frontmatter obligatorio:

```yaml
title: string
slug: string
level: "básico" | "intermedio"
estimatedTime: string
safetyWarning: boolean
relatedComponents: string[]   # ids de components.json
```

Secciones, en este orden: Qué necesitas · Pasos (numerados) · Errores comunes · Cuándo pedir ayuda profesional.
