import { useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { Box3, PerspectiveCamera, Vector3, type Camera, type Object3D } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { computeFraming } from './framing';

/** Mueve la cámara (y los controles, si existen) para que `object` quede completo en pantalla. */
function frameObject(
  object: Object3D,
  camera: Camera,
  controls: OrbitControlsImpl | null,
  aspect: number,
): void {
  if (!(camera instanceof PerspectiveCamera) || !Number.isFinite(aspect) || aspect <= 0) return;

  const box = new Box3().setFromObject(object);
  if (box.isEmpty()) return;

  const currentTarget = controls?.target ?? new Vector3();
  const direction = camera.position.clone().sub(currentTarget);
  const framing = computeFraming(box, camera.fov, aspect, direction);

  camera.position.copy(framing.position);
  camera.near = framing.near;
  camera.far = framing.far;
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.copy(framing.target);
    controls.minDistance = framing.minDistance;
    controls.maxDistance = framing.maxDistance;
    controls.update();
  } else {
    camera.lookAt(framing.target);
  }
}

/**
 * Encuadra la cámara sobre su contenido al montarse y cuando cambia el tamaño del lienzo.
 * Se monta recién cuando el modelo (o el placeholder) está listo,
 * así el cálculo usa la geometría real. Conserva el ángulo de vista actual.
 */
export default function AutoFrame({ children }: { children: ReactNode }) {
  const group = useRef<Object3D>(null);
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useLayoutEffect(() => {
    if (group.current) frameObject(group.current, camera, controls, width / height);
  }, [camera, controls, width, height]);

  return <group ref={group}>{children}</group>;
}
