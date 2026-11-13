import { lazy, Suspense } from 'react';

// Carga diferida: three.js y el modelo solo se descargan al abrir el visor.
const Viewer = lazy(() => import('../viewer/Viewer'));

export default function ViewerPage() {
  return (
    <>
      <h1>Visor 3D</h1>
      <p>Explora una PC completa en 3D.</p>
      <Suspense fallback={<p role="status">Cargando visor…</p>}>
        <Viewer />
      </Suspense>
    </>
  );
}
