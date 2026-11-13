import { lazy, Suspense, useEffect, useState } from 'react';
import ComponentDetail from '../components/ComponentDetail';
import ComponentList from '../components/ComponentList';
import { componentButtonId } from '../components/componentButtonId';
import { components, getComponentById, getComponentByModelNode } from '../data/components';
import ViewerErrorBoundary from '../viewer/ViewerErrorBoundary';
import ViewerFallback from '../viewer/ViewerFallback';
import { isWebGLAvailable } from '../viewer/webgl';
import './ViewerPage.css';

// Carga diferida: three.js y el modelo solo se descargan al abrir el visor.
const Viewer = lazy(() => import('../viewer/Viewer'));

const MODEL_NODES: ReadonlySet<string> = new Set(components.map((c) => c.modelNode));

export default function ViewerPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasWebGL] = useState(isWebGLAvailable);
  const selected = selectedId ? (getComponentById(selectedId) ?? null) : null;

  const handleSelectNode = (node: string | null) => {
    setSelectedId(node ? (getComponentByModelNode(node)?.id ?? null) : null);
  };

  // Al cerrar el panel, el foco vuelve al botón de la lista para no perderse.
  const closeDetail = () => {
    const id = selectedId;
    setSelectedId(null);
    if (id) document.getElementById(componentButtonId(id))?.focus();
  };

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId]);

  return (
    <>
      <h1>Visor 3D</h1>
      <p>Explora una PC completa en 3D.</p>
      <div className="viewer-layout">
        <div className="viewer-layout-stage">
          {hasWebGL ? (
            <ViewerErrorBoundary fallback={<ViewerFallback reason="error" />}>
              <Suspense fallback={<p role="status">Cargando visor…</p>}>
                <Viewer
                  modelNodes={MODEL_NODES}
                  selectedNode={selected?.modelNode ?? null}
                  onSelectNode={handleSelectNode}
                />
              </Suspense>
            </ViewerErrorBoundary>
          ) : (
            <ViewerFallback reason="sin-webgl" />
          )}
        </div>
        <div className="viewer-layout-side">
          <ComponentList components={components} selectedId={selectedId} onSelect={setSelectedId} />
          <div aria-label="Información de la pieza" role="region">
            {selected ? (
              <ComponentDetail component={selected} onClose={closeDetail} />
            ) : (
              <p className="viewer-layout-hint">
                Selecciona una pieza en el modelo o en la lista para ver qué hace y sus
                especificaciones.
              </p>
            )}
          </div>
        </div>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">
        {selected ? `Pieza seleccionada: ${selected.name}` : ''}
      </p>
    </>
  );
}
