import { Box3, Sphere, Vector3 } from 'three';

export interface Framing {
  target: Vector3;
  position: Vector3;
  distance: number;
  /** Límites del zoom de los controles de órbita. */
  minDistance: number;
  maxDistance: number;
  near: number;
  far: number;
}

/** Cuánto se puede acercar o alejar la cámara respecto de la distancia de encuadre. */
export const MIN_ZOOM_FACTOR = 0.3;
export const MAX_ZOOM_FACTOR = 1.6;
/**
 * Holgura (en radios del modelo) para lo que sale de la caja inicial,
 * como las piezas desplazadas en la vista explotada.
 */
const EXTRA_DEPTH_RADII = 2;

/**
 * Calcula dónde poner la cámara para que todo `box` quede visible.
 * Usa la esfera envolvente, así el resultado no depende del ángulo de vista.
 *
 * @param fovDeg   campo de visión vertical de la cámara, en grados
 * @param aspect   ancho / alto del lienzo
 * @param direction dirección desde el centro hacia la cámara (no hace falta normalizarla)
 * @param margin   factor de holgura (1 = justo al borde)
 */
export function computeFraming(
  box: Box3,
  fovDeg: number,
  aspect: number,
  direction: Vector3,
  margin = 1.0,
): Framing {
  const sphere = box.getBoundingSphere(new Sphere());
  const radius = Math.max(sphere.radius, 1e-3);

  const vFov = (fovDeg * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const limitingFov = Math.min(vFov, hFov);
  const distance = (radius / Math.sin(limitingFov / 2)) * margin;

  const dir = direction.lengthSq() > 0 ? direction.clone().normalize() : new Vector3(0, 0, 1);
  const target = sphere.center.clone();
  const position = target.clone().addScaledVector(dir, distance);

  const minDistance = distance * MIN_ZOOM_FACTOR;
  const maxDistance = distance * MAX_ZOOM_FACTOR;

  // near y far cubren todo el rango del zoom: el modelo no se recorta al alejarse ni al acercarse.
  return {
    target,
    position,
    distance,
    minDistance,
    maxDistance,
    near: Math.min(distance / 100, Math.max(minDistance - radius * EXTRA_DEPTH_RADII, 1e-4)),
    far: maxDistance + radius * EXTRA_DEPTH_RADII,
  };
}
