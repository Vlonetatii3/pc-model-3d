import { Mesh, Vector3, type Object3D } from 'three';
import { z } from 'zod';
import offsets from './explodeOffsets.json';

/** Grupo de cables del modelo: no es clicable y se oculta en la vista explotada. */
export const CABLES_NODE = 'CABLES';

/**
 * Desplazamiento de cada pieza en la vista explotada (metros, ejes de three.js).
 * El mismo archivo lo usa blender/build_model.py para las vistas de control.
 */
export const explodeOffsets: Readonly<Record<string, readonly [number, number, number]>> = z
  .record(z.string(), z.tuple([z.number(), z.number(), z.number()]))
  .parse(offsets);

/** Velocidad de la animación: fracción del recorrido restante por segundo (amortiguado). */
const DAMPING = 6;

/** Avanza `current` hacia `target` (0 = armada, 1 = explotada) con amortiguación exponencial. */
export function stepProgress(current: number, target: number, deltaSeconds: number): number {
  const next = target + (current - target) * Math.exp(-DAMPING * deltaSeconds);
  return Math.abs(next - target) < 0.001 ? target : next;
}

export interface Exploder {
  /** Coloca las piezas según el avance (0 = armada, 1 = explotada). */
  apply(progress: number): void;
}

/**
 * Prepara la escena: guarda la posición original de cada pieza con desplazamiento
 * y desactiva el raycast de los cables para que no tapen los clics.
 */
export function createExploder(root: Object3D): Exploder {
  const pieces: { object: Object3D; base: Vector3; offset: Vector3 }[] = [];
  let cables: Object3D | undefined;

  root.traverse((object) => {
    const offset = explodeOffsets[object.name];
    if (offset) {
      pieces.push({ object, base: object.position.clone(), offset: new Vector3(...offset) });
    }
    if (object.name === CABLES_NODE) cables = object;
  });

  cables?.traverse((object) => {
    if (object instanceof Mesh) object.raycast = () => {};
  });

  return {
    apply(progress) {
      for (const { object, base, offset } of pieces) {
        object.position.copy(base).addScaledVector(offset, progress);
      }
      if (cables) cables.visible = progress < 0.02;
    },
  };
}
