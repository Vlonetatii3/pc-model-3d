# MVP: Web de componentes de PC (nombre de trabajo: ArmaTuPC)

> Nombre provisional. Ver sección 13.

## 1. Objetivo

Sitio web en español donde una persona aprende qué es cada componente de una PC, cómo armarla y cómo diagnosticar fallas básicas. El diferencial es un visor 3D interactivo con modelos hechos en Blender.

## 2. Usuarios

- **Principiante** que quiere armar su primera PC.
- **Aficionado o estudiante técnico** que quiere reparar un problema básico.

## 3. Alcance del MVP

### F1. Visor 3D de una PC completa
- Modelo único con: placa madre, CPU, RAM, GPU, fuente, almacenamiento y gabinete.
- Rotar, acercar y alejar. Encuadre automático al cargar.
- Clic en una pieza: se resalta y abre un panel con nombre, función, especificaciones clave y enlaces a guías relacionadas.
- Lista lateral de componentes que hace lo mismo que el clic. Debe ser navegable con teclado.

### F2. Guías (3)
1. Armado de PC paso a paso.
2. Cableado básico (panel frontal, alimentación, tarjeta gráfica).
3. Diagnóstico: "La PC no enciende".

Cada guía tiene pasos numerados, errores comunes y cuándo pedir ayuda profesional. Las guías que implican electricidad muestran una advertencia de seguridad.

### F3. Glosario
- Lista de términos (socket, chipset, TDP, factor de forma, etc.).
- Búsqueda por texto en el cliente.

### F4. Apoyar el proyecto
- Página que explica que el contenido es gratuito y enlaza a una plataforma de donaciones externa.
- La URL se configura en `src/config.ts`.
- No se procesan pagos dentro del sitio.

### F5. Legal y créditos
- Aviso de responsabilidad sobre reparación de hardware.
- Créditos y licencias de modelos 3D, textos e imágenes.

## 4. Fuera de alcance (MVP)

- Cuentas de usuario, comentarios o foros.
- Pagos o suscripciones dentro del sitio.
- Enlaces de afiliado (se evalúan después de medir tráfico).
- Simulador de compatibilidad entre piezas (versión 2).
- Videos, tienda o cotizador.
- Idiomas distintos del español.
- Backend. El MVP es un sitio estático.

## 5. Requisitos no funcionales

- **Responsive:** funciona bien en celular y escritorio.
- **Rendimiento:** la página carga en menos de 3 s en una conexión 4G media. Los modelos se cargan solo cuando se abre el visor.
- **Peso de modelos:** cada `.glb` pesa 5 MB o menos. La escena completa, 15 MB o menos.
- **Accesibilidad:** contraste AA, textos alternativos, navegación por teclado.
- **Fallback:** si WebGL no está disponible, se muestran la lista de componentes y una imagen de respaldo.
- **Idioma:** todo el texto visible en español.

## 6. Stack propuesto

- Vite + React + TypeScript
- three.js con `@react-three/fiber` y `@react-three/drei`
- Guías en Markdown con frontmatter (`gray-matter`)
- Validación de datos con `zod`
- Tests: Vitest + Testing Library; smoke E2E con Playwright
- Deploy estático: Netlify, Vercel o GitHub Pages
- Analítica sin cookies (proveedor por definir; ver sección 13)

## 7. Modelo de datos

### `src/data/components.json`
```json
{
  "id": "gpu",
  "name": "Tarjeta gráfica (GPU)",
  "category": "procesamiento",
  "summary": "Procesa imágenes y cálculos gráficos.",
  "function": "Descripción de qué hace y por qué importa.",
  "keySpecs": [
    { "label": "Memoria", "value": "pendiente de verificar" }
  ],
  "modelNode": "GPU",
  "relatedGuides": ["cableado-basico"]
}
```

### Frontmatter de guías (`content/guides/*.md`)
```yaml
title: "Cableado básico"
slug: "cableado-basico"
level: "básico"            # básico | intermedio
estimatedTime: "30 min"
safetyWarning: true        # true si hay electricidad o fuentes de poder
relatedComponents: ["fuente", "gpu", "placa-madre"]
```

## 8. Convenciones para modelos 3D (Blender)

- Exportar en **glTF 2.0 binario (.glb)**, con unidades en metros.
- Aplicar transformaciones (Ctrl+A) antes de exportar.
- Cada pieza clicable es un nodo con nombre igual al `modelNode` de `components.json`. Ejemplo: `GPU`, `CPU`, `RAM_1`.
- Dimensiones tomadas de fichas técnicas reales.
- Materiales PBR simples. Texturas de 2048 px como máximo.
- Ubicación: `public/models/pc-completa.glb`.
- Piezas genéricas. No usar logos ni marcas de fabricantes sin revisar permisos.

## 9. Criterios de aceptación

- Desde la página de inicio se llega a cualquier guía en dos clics o menos.
- Al hacer clic en la GPU, el panel muestra su nombre y su función.
- Todas las guías con `safetyWarning: true` muestran la advertencia de seguridad.
- Sin errores en consola en las últimas versiones de Chrome y Firefox.
- Lighthouse de rendimiento en móvil de 80 o más en la página de inicio.
- Si WebGL no está disponible, la lista de componentes sigue funcionando.

## 10. Métricas de validación (primeras 4 semanas)

- Visitas únicas por semana.
- Porcentaje de visitas que abren el visor 3D.
- Porcentaje de visitas que terminan una guía.
- Clics en la página de apoyo.
- Visitas que regresan en los 7 días siguientes.
- Entrevistas: 5 personas que armaron o repararon una PC, con su feedback anotado.

**Criterio de decisión:** si después de 4 semanas el visor no retiene visitas ni hay regreso, se replantea antes de invertir más.

## 11. Hitos

- **Semana 1:** setup del proyecto, layout base, datos de componentes y un modelo de prueba cargando.
- **Semana 2:** visor completo con selección, panel de detalle y lista accesible.
- **Semana 3:** guías, glosario y página de apoyo.
- **Semana 4:** legal, SEO básico, analítica, pruebas, optimización y deploy.

## 12. Riesgos

| Riesgo | Mitigación |
|---|---|
| Modelos 3D muy pesados | Optimizar en Blender, carga diferida, límites de peso |
| Contenido técnico incorrecto | Revisión por un técnico antes de publicar cada guía |
| Problemas de marca por logos | Usar piezas genéricas |
| Donaciones insuficientes | Medir antes de invertir; combinar con otras vías |
| Riesgo físico al reparar | Advertencias visibles y recomendación de técnico profesional |

## 13. Decisiones pendientes del autor

- Nombre definitivo y dominio.
- Plataforma de donaciones y URL.
- Proveedor de analítica sin cookies.
- Licencia del código y del contenido.
- Si la versión 2 incluirá guaraní.
