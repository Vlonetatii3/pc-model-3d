// @vitest-environment node
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { components } from '../data/components';
import { readGlbNodeNames } from './glb';
import { MODEL_URL } from './modelAvailability';

const MODEL_PATH = fileURLToPath(new URL(`../../public${MODEL_URL}`, import.meta.url));
const MAX_MODEL_BYTES = 5 * 1024 * 1024; // docs/MVP.md, sección 5

describe(`modelo 3D (${MODEL_URL})`, () => {
  it('existe en public/models/', () => {
    expect(existsSync(MODEL_PATH), `Falta ${MODEL_PATH}. Genera con npm run model:build`).toBe(
      true,
    );
  });

  it('pesa 5 MB o menos', () => {
    expect(statSync(MODEL_PATH).size).toBeLessThanOrEqual(MAX_MODEL_BYTES);
  });

  describe('coincidencia entre nodos y components.json', () => {
    const nodeNames = existsSync(MODEL_PATH) ? readGlbNodeNames(readFileSync(MODEL_PATH)) : [];

    it.each(components.map((c) => [c.id, c.modelNode]))(
      '%s: el nodo "%s" existe en el .glb',
      (_, modelNode) => {
        expect(nodeNames).toContain(modelNode);
      },
    );

    it('cada nodo clicable aparece una sola vez', () => {
      for (const { modelNode } of components) {
        expect(nodeNames.filter((name) => name === modelNode)).toHaveLength(1);
      }
    });
  });
});
