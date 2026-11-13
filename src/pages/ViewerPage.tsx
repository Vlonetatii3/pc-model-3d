import { lazy, Suspense, useState } from 'react';
import { components, getComponentByModelNode } from '../data/components';

// Carga diferida: three.js y el modelo solo se descargan al abrir el visor.
const Viewer = lazy(() => import('../viewer/Viewer'));

const MODEL_NODES: ReadonlySet<string> = new Set(components.map((c) => c.modelNode));

export default function ViewerPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = components.find((c) => c.id === selectedId) ?? null;

  const handleSelectNode = (node: string | null) => {
    setSelectedId(node ? (getComponentByModelNode(node)?.id ?? null) : null);
  };

  return (
    <>
      <h1>Visor 3D</h1>
      <p>Explora una PC completa en 3D.</p>
      <Suspense fallback={<p role="status">Cargando visor…</p>}>
        <Viewer
          modelNodes={MODEL_NODES}
          selectedNode={selected?.modelNode ?? null}
          onSelectNode={handleSelectNode}
        />
      </Suspense>
      <p role="status" aria-live="polite">
        {selected ? `Pieza seleccionada: ${selected.name}` : 'Ninguna pieza seleccionada.'}
      </p>
    </>
  );
}
