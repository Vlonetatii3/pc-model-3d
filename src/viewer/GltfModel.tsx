import { useCursor, useGLTF } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Object3D } from 'three';
import { createExploder, stepProgress, type Exploder } from './explode';
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

const exploders = new WeakMap<Object3D, Exploder>();

function getExploder(scene: Object3D) {
  let exploder = exploders.get(scene);
  if (!exploder) {
    exploder = createExploder(scene);
    exploders.set(scene, exploder);
  }
  return exploder;
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export interface GltfModelProps {
  url: string;
  modelNodes: ReadonlySet<string>;
  selectedNode: string | null;
  onSelectNode: (node: string | null) => void;
  /** Vista explotada: separa las piezas y oculta los cables. */
  exploded?: boolean;
}

export default function GltfModel({
  url,
  modelNodes,
  selectedNode,
  onSelectNode,
  exploded = false,
}: GltfModelProps) {
  const { scene } = useGLTF(url);
  const highlightMap = getHighlightMap(scene, modelNodes);
  const exploder = getExploder(scene);
  const progress = useRef<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  useCursor(hoveredNode !== null);

  useEffect(() => {
    applyHighlight(highlightMap, selectedNode, hoveredNode);
  }, [highlightMap, selectedNode, hoveredNode]);

  useFrame((_, delta) => {
    const target = exploded ? 1 : 0;
    if (progress.current === target) return;
    const next =
      progress.current === null || prefersReducedMotion()
        ? target
        : stepProgress(progress.current, target, delta);
    progress.current = next;
    exploder.apply(next);
  });

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
