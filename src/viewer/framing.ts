import { Box3, Sphere, Vector3 } from 'three';

export interface Framing {
  target: Vector3;
  position: Vector3;
  distance: number;
  near: number;
  far: number;
}

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
  margin = 1.15,
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

  return {
    target,
    position,
    distance,
    near: Math.max(distance - radius * 2, distance / 100),
    far: distance + radius * 4,
  };
}
