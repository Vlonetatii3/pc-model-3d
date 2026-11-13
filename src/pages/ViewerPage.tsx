import { lazy, Suspense, useState } from 'react';
import ComponentDetail from '../components/ComponentDetail';
import { components, getComponentById, getComponentByModelNode } from '../data/components';
import './ViewerPage.css';

// Carga diferida: three.js y el modelo solo se descargan al abrir el visor.
const Viewer = lazy(() => import('../viewer/Viewer'));

const MODEL_NODES: ReadonlySet<string> = new Set(components.map((c) => c.modelNode));

export default function ViewerPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? (getComponentById(selectedId) ?? null) : null;

  const handleSelectNode = (node: string | null) => {
    setSelectedId(node ? (getComponentByModelNode(node)?.id ?? null) : null);
  };

  return (
    <>
      <h1>Visor 3D</h1>
      <p>Explora una PC completa en 3D.</p>
      <div className="viewer-layout">
        <div className="viewer-layout-stage">
          <Suspense fallback={<p role="status">Cargando visor…</p>}>
            <Viewer
              modelNodes={MODEL_NODES}
              selectedNode={selected?.modelNode ?? null}
              onSelectNode={handleSelectNode}
            />
          </Suspense>
        </div>
        <aside className="viewer-layout-side" aria-label="Información de la pieza">
          {selected ? (
            <ComponentDetail component={selected} onClose={() => setSelectedId(null)} />
          ) : (
            <p className="viewer-layout-hint">
              Selecciona una pieza en el modelo para ver qué hace y sus especificaciones.
            </p>
          )}
        </aside>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {selected ? `Pieza seleccionada: ${selected.name}` : ''}
      </p>
    </>
  );
}
