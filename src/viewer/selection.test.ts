import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Object3D } from 'three';
import {
  applyHighlight,
  findModelNode,
  HIGHLIGHT_COLOR,
  HOVERED_INTENSITY,
  prepareSelectableMaterials,
  SELECTED_INTENSITY,
} from './selection';

const NODES = new Set(['GPU', 'RAM_1']);

function mesh(name: string, material: MeshStandardMaterial) {
  const m = new Mesh(new BoxGeometry(), material);
  m.name = name;
  return m;
}

/** Escena de prueba: GPU con un hijo, RAM_1 (grupo) con dos módulos y un gabinete. */
function buildScene() {
  const shared = new MeshStandardMaterial({ color: 'gray' });
  const root = new Group();

  const gpu = mesh('GPU', shared);
  const fan = mesh('GPU_ventilador', shared);
  gpu.add(fan);

  const ram = new Group();
  ram.name = 'RAM_1';
  const stick1 = mesh('RAM_1_modulo_1', shared);
  const stick2 = mesh('RAM_1_modulo_2', shared);
  ram.add(stick1, stick2);

  const caseMesh = mesh('GABINETE', shared);
  root.add(gpu, ram, caseMesh);
  return { root, shared, gpu, fan, stick1, stick2, caseMesh };
}

describe('findModelNode', () => {
  it('devuelve el nodo cuando se toca la pieza directamente', () => {
    const { gpu } = buildScene();
    expect(findModelNode(gpu, NODES)).toBe('GPU');
  });

  it('sube hasta el nodo padre cuando se toca un detalle', () => {
    const { fan, stick2 } = buildScene();
    expect(findModelNode(fan, NODES)).toBe('GPU');
    expect(findModelNode(stick2, NODES)).toBe('RAM_1');
  });

  it('devuelve null para piezas no clicables', () => {
    const { caseMesh } = buildScene();
    expect(findModelNode(caseMesh, NODES)).toBeNull();
    expect(findModelNode(new Object3D(), NODES)).toBeNull();
    expect(findModelNode(null, NODES)).toBeNull();
  });
});

describe('prepareSelectableMaterials', () => {
  it('separa los materiales compartidos entre piezas', () => {
    const { root, shared, gpu, fan, stick1, stick2, caseMesh } = buildScene();
    prepareSelectableMaterials(root, NODES);

    expect(gpu.material).not.toBe(shared);
    expect(stick1.material).not.toBe(gpu.material);
    // Dentro de una misma pieza se sigue compartiendo
    expect(fan.material).toBe(gpu.material);
    expect(stick2.material).toBe(stick1.material);
    // Lo no clicable queda intacto
    expect(caseMesh.material).toBe(shared);
  });

  it('devuelve los materiales de cada pieza', () => {
    const { root } = buildScene();
    const byNode = prepareSelectableMaterials(root, NODES);
    expect([...byNode.keys()].sort()).toEqual(['GPU', 'RAM_1']);
    expect(byNode.get('GPU')).toHaveLength(1);
  });
});

describe('applyHighlight', () => {
  it('resalta la selección y, más suave, la pieza bajo el puntero', () => {
    const { root, gpu, stick1, caseMesh } = buildScene();
    const byNode = prepareSelectableMaterials(root, NODES);

    applyHighlight(byNode, 'GPU', 'RAM_1');
    const gpuMat = gpu.material as MeshStandardMaterial;
    const ramMat = stick1.material as MeshStandardMaterial;
    expect(gpuMat.emissiveIntensity).toBe(SELECTED_INTENSITY);
    expect(gpuMat.emissive.equals(HIGHLIGHT_COLOR)).toBe(true);
    expect(ramMat.emissiveIntensity).toBe(HOVERED_INTENSITY);
    expect((caseMesh.material as MeshStandardMaterial).emissiveIntensity).toBe(1);
  });

  it('quita el resaltado al deseleccionar', () => {
    const { root, gpu } = buildScene();
    const byNode = prepareSelectableMaterials(root, NODES);
    applyHighlight(byNode, 'GPU', null);
    applyHighlight(byNode, null, null);
    const gpuMat = gpu.material as MeshStandardMaterial;
    expect(gpuMat.emissiveIntensity).toBe(0);
    expect(gpuMat.emissive.getHex()).toBe(0x000000);
  });
});
