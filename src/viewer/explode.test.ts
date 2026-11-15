// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Raycaster,
  Vector3,
} from 'three';
import { components } from '../data/components';
import { CABLES_NODE, createExploder, explodeOffsets, stepProgress } from './explode';
import { readGlbNodeNames } from './glb';
import { MODEL_URL } from './modelAvailability';

const MODEL_PATH = fileURLToPath(new URL(`../../public${MODEL_URL}`, import.meta.url));

describe('explodeOffsets.json', () => {
  it('tiene un desplazamiento para cada pieza de components.json', () => {
    expect(Object.keys(explodeOffsets).sort()).toEqual(components.map((c) => c.modelNode).sort());
  });

  it('cada pieza y el grupo de cables existen en el .glb', () => {
    const names = readGlbNodeNames(readFileSync(MODEL_PATH));
    for (const node of [...Object.keys(explodeOffsets), CABLES_NODE]) {
      expect(names).toContain(node);
    }
  });

  it('los desplazamientos son vectores de 3 números finitos', () => {
    for (const offset of Object.values(explodeOffsets)) {
      expect(offset).toHaveLength(3);
      expect(offset.every(Number.isFinite)).toBe(true);
    }
  });
});

describe('stepProgress', () => {
  it('se acerca al objetivo sin pasarse', () => {
    const next = stepProgress(0, 1, 1 / 60);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });

  it('llega exactamente al objetivo cuando está muy cerca', () => {
    expect(stepProgress(0.9995, 1, 1 / 60)).toBe(1);
    expect(stepProgress(0.0005, 0, 1 / 60)).toBe(0);
  });

  it('con un paso largo salta al objetivo', () => {
    expect(stepProgress(1, 0, 10)).toBe(0);
  });
});

describe('createExploder', () => {
  function scene() {
    const root = new Group();
    const gpu = new Object3D();
    gpu.name = 'GPU';
    gpu.position.set(0.1, 0.2, 0.3);
    const cables = new Group();
    cables.name = CABLES_NODE;
    const cable = new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial());
    cables.add(cable);
    root.add(gpu, cables);
    return { root, gpu, cables, cable };
  }

  it('mueve cada pieza desde su posición original según el avance', () => {
    const { root, gpu } = scene();
    const exploder = createExploder(root);
    const [dx, dy, dz] = explodeOffsets.GPU;

    exploder.apply(1);
    expect(gpu.position.toArray()).toEqual([0.1 + dx, 0.2 + dy, 0.3 + dz]);
    exploder.apply(0.5);
    expect(gpu.position.x).toBeCloseTo(0.1 + dx / 2);
    exploder.apply(0);
    expect(gpu.position.toArray()).toEqual([0.1, 0.2, 0.3]);
  });

  it('oculta los cables al separar y los muestra al armar', () => {
    const { root, cables } = scene();
    const exploder = createExploder(root);
    exploder.apply(0.5);
    expect(cables.visible).toBe(false);
    exploder.apply(0);
    expect(cables.visible).toBe(true);
  });

  it('los cables no reciben clics', () => {
    const { root, cable } = scene();
    createExploder(root);
    root.updateMatrixWorld();
    const raycaster = new Raycaster(new Vector3(0, 0, 5), new Vector3(0, 0, -1));
    expect(raycaster.intersectObject(cable)).toHaveLength(0);
  });
});
