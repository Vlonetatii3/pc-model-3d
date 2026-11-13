import { Color, Mesh, type Material, type Object3D } from 'three';

export const HIGHLIGHT_COLOR = new Color('#3b8cff');
export const SELECTED_INTENSITY = 0.55;
export const HOVERED_INTENSITY = 0.2;

/**
 * Sube por la jerarquía desde el objeto tocado hasta encontrar un nodo cuyo
 * nombre sea un `modelNode` conocido. Devuelve ese nombre o null.
 */
export function findModelNode(object: Object3D | null, modelNodes: ReadonlySet<string>) {
  let current: Object3D | null = object;
  while (current) {
    if (modelNodes.has(current.name)) return current.name;
    current = current.parent;
  }
  return null;
}

type EmissiveMaterial = Material & { emissive: Color; emissiveIntensity: number };

function hasEmissive(material: Material): material is EmissiveMaterial {
  return 'emissive' in material && (material as EmissiveMaterial).emissive instanceof Color;
}

/**
 * Da a cada pieza clicable su propia copia de los materiales (en el .glb varias
 * piezas comparten material) y devuelve, por `modelNode`, los materiales a resaltar.
 * Modifica `root` en el lugar; llamar una sola vez por escena.
 */
export function prepareSelectableMaterials(root: Object3D, modelNodes: ReadonlySet<string>) {
  const byNode = new Map<string, EmissiveMaterial[]>();

  root.traverse((object) => {
    if (!modelNodes.has(object.name)) return;
    const clones = new Map<Material, EmissiveMaterial>();
    const list: EmissiveMaterial[] = [];

    object.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const replace = (material: Material) => {
        if (!hasEmissive(material)) return material;
        let clone = clones.get(material);
        if (!clone) {
          clone = material.clone() as EmissiveMaterial;
          clones.set(material, clone);
          list.push(clone);
        }
        return clone;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(replace)
        : replace(child.material);
    });

    byNode.set(object.name, list);
  });

  return byNode;
}

/** Aplica el resaltado: fuerte a la pieza seleccionada, suave a la que está bajo el puntero. */
export function applyHighlight(
  byNode: ReadonlyMap<string, EmissiveMaterial[]>,
  selected: string | null,
  hovered: string | null,
) {
  for (const [node, materials] of byNode) {
    const intensity =
      node === selected ? SELECTED_INTENSITY : node === hovered ? HOVERED_INTENSITY : 0;
    for (const material of materials) {
      material.emissive.copy(intensity > 0 ? HIGHLIGHT_COLOR : new Color(0x000000));
      material.emissiveIntensity = intensity;
    }
  }
}
