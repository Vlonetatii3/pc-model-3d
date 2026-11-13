import { Box3, Vector3 } from 'three';
import { computeFraming } from './framing';

const cube = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1));
const radius = Math.sqrt(3);

describe('computeFraming', () => {
  it('apunta al centro de la caja', () => {
    const box = new Box3(new Vector3(2, 0, 0), new Vector3(4, 2, 2));
    const { target } = computeFraming(box, 45, 1, new Vector3(0, 0, 1));
    expect(target.toArray()).toEqual([3, 1, 1]);
  });

  it('coloca la cámara en la dirección pedida', () => {
    const { position, target } = computeFraming(cube, 45, 1, new Vector3(1, 1, 1));
    const dir = position.clone().sub(target).normalize();
    expect(dir.x).toBeCloseTo(1 / Math.sqrt(3));
    expect(dir.y).toBeCloseTo(1 / Math.sqrt(3));
    expect(dir.z).toBeCloseTo(1 / Math.sqrt(3));
  });

  it('deja la esfera envolvente dentro del campo de visión vertical', () => {
    const { distance } = computeFraming(cube, 45, 2, new Vector3(0, 0, 1), 1);
    const halfAngle = Math.asin(radius / distance);
    expect(halfAngle).toBeCloseTo((45 * Math.PI) / 180 / 2);
  });

  it('se aleja más en pantallas angostas (retrato)', () => {
    const wide = computeFraming(cube, 45, 16 / 9, new Vector3(0, 0, 1));
    const narrow = computeFraming(cube, 45, 9 / 16, new Vector3(0, 0, 1));
    expect(narrow.distance).toBeGreaterThan(wide.distance);
  });

  it('la distancia es proporcional al tamaño del modelo', () => {
    const small = computeFraming(cube, 45, 1, new Vector3(0, 0, 1));
    const big = computeFraming(
      new Box3(new Vector3(-2, -2, -2), new Vector3(2, 2, 2)),
      45,
      1,
      new Vector3(0, 0, 1),
    );
    expect(big.distance).toBeCloseTo(small.distance * 2);
  });

  it('near y far contienen al modelo completo', () => {
    const { distance, near, far } = computeFraming(cube, 45, 1, new Vector3(0, 0, 1));
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(distance - radius);
    expect(far).toBeGreaterThan(distance + radius);
  });

  it('usa una dirección por defecto si recibe un vector nulo', () => {
    const { position } = computeFraming(cube, 45, 1, new Vector3(0, 0, 0));
    expect(Number.isFinite(position.z)).toBe(true);
    expect(position.z).toBeGreaterThan(0);
  });
});
