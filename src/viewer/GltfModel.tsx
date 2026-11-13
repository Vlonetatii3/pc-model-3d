import { useCursor, useGLTF } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import type { Object3D } from 'three';
import { applyHighlight, findModelNode, prepareSelectableMaterials } from './selection';

/** Píxeles que puede moverse el puntero para que un clic no cuente como arrastre. */
const CLICK_TOLERANCE_PX = 5;

type HighlightMap = ReturnType<typeof prepareSelectableMaterials>;
// useGLTF guarda la escena en caché: se prepara una sola vez por escena.
const prepared = new WeakMap<Object3D, HighlightMap>();

function getHighlightMap(scene: Object3D, modelNodes: ReadonlySet<string>) {
  let map = prepared.get(scene);
  if (!map) {
    map = prepareSelectableMaterials(scene, modelNodes);
    prepared.set(scene, map);
  }
  return map;
}

export interface GltfModelProps {
  url: string;
  modelNodes: ReadonlySet<string>;
  selectedNode: string | null;
  onSelectNode: (node: string | null) => void;
}

export default function GltfModel({ url, modelNodes, selectedNode, onSelectNode }: GltfModelProps) {
  const { scene } = useGLTF(url);
  const highlightMap = getHighlightMap(scene, modelNodes);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  useCursor(hoveredNode !== null);

  useEffect(() => {
    applyHighlight(highlightMap, selectedNode, hoveredNode);
  }, [highlightMap, selectedNode, hoveredNode]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > CLICK_TOLERANCE_PX) return;
    onSelectNode(findModelNode(event.object, modelNodes));
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredNode(findModelNode(event.object, modelNodes));
  };

  return (
    <primitive
      object={scene}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerOut={() => setHoveredNode(null)}
    />
  );
}
