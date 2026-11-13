import rawComponents from './components.json';
import {
  components,
  getComponentById,
  getComponentByModelNode,
  parseComponents,
} from './components';

const valid = {
  id: 'gpu',
  name: 'Tarjeta gráfica (GPU)',
  category: 'procesamiento',
  summary: 'Procesa imágenes.',
  function: 'Genera la imagen del monitor.',
  keySpecs: [{ label: 'Memoria', value: 'pendiente de verificar' }],
  modelNode: 'GPU',
  relatedGuides: ['cableado-basico'],
};

describe('components.json', () => {
  it('pasa la validación', () => {
    expect(() => parseComponents(rawComponents)).not.toThrow();
  });

  it('incluye los 6 componentes del MVP', () => {
    expect(components.map((c) => c.id).sort()).toEqual(
      ['almacenamiento', 'cpu', 'fuente', 'gpu', 'placa-madre', 'ram'].sort(),
    );
  });

  it('no tiene especificaciones vacías', () => {
    for (const component of components) {
      expect(component.keySpecs.length).toBeGreaterThan(0);
    }
  });
});

describe('parseComponents', () => {
  it('acepta un componente válido', () => {
    expect(parseComponents([valid])).toEqual([valid]);
  });

  it.each([
    ['falta un campo obligatorio', { ...valid, name: undefined }],
    ['nombre vacío', { ...valid, name: '   ' }],
    ['id con mayúsculas', { ...valid, id: 'GPU' }],
    ['id con espacios', { ...valid, id: 'placa madre' }],
    ['modelNode con espacios', { ...valid, modelNode: 'Placa madre' }],
    ['guía relacionada con formato inválido', { ...valid, relatedGuides: ['Cableado Básico'] }],
    ['especificación sin valor', { ...valid, keySpecs: [{ label: 'Memoria', value: '' }] }],
  ])('rechaza: %s', (_, item) => {
    expect(() => parseComponents([item])).toThrow(/components.json no es válido/);
  });

  it('rechaza ids duplicados', () => {
    expect(() => parseComponents([valid, { ...valid, modelNode: 'GPU_2' }])).toThrow(
      /duplicado en "id"/,
    );
  });

  it('rechaza modelNode duplicados', () => {
    expect(() => parseComponents([valid, { ...valid, id: 'gpu-2' }])).toThrow(
      /duplicado en "modelNode"/,
    );
  });

  it('rechaza datos que no son una lista', () => {
    expect(() => parseComponents(valid)).toThrow();
  });
});

describe('búsquedas', () => {
  it('encuentra por id', () => {
    expect(getComponentById('gpu')?.name).toBe('Tarjeta gráfica (GPU)');
    expect(getComponentById('no-existe')).toBeUndefined();
  });

  it('encuentra por modelNode', () => {
    expect(getComponentByModelNode('GPU')?.id).toBe('gpu');
    expect(getComponentByModelNode('NADA')).toBeUndefined();
  });
});
