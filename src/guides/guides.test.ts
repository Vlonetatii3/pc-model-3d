import { components } from '../data/components';
import { getGuide, guides, parseGuides, type GuideModule } from './guides';

const componentIds = ['placa-madre', 'fuente', 'gpu'];

const validData = {
  title: 'Cableado básico',
  slug: 'cableado-basico',
  level: 'básico',
  estimatedTime: '30 min',
  safetyWarning: true,
  relatedComponents: ['fuente', 'gpu'],
};

function mod(data: Record<string, unknown>, content = '## Pasos\n'): GuideModule {
  return { data, content };
}

describe('parseGuides', () => {
  it('acepta una guía válida e incluye el cuerpo', () => {
    const [guide] = parseGuides(
      { '/content/guides/cableado-basico.md': mod(validData) },
      componentIds,
    );
    expect(guide).toEqual({ ...validData, body: '## Pasos\n' });
  });

  it.each([
    ['falta el título', { ...validData, title: undefined }],
    ['título vacío', { ...validData, title: '  ' }],
    ['nivel fuera de la lista', { ...validData, level: 'avanzado' }],
    ['nivel sin tilde', { ...validData, level: 'basico' }],
    ['safetyWarning como texto', { ...validData, safetyWarning: 'true' }],
    ['falta safetyWarning', { ...validData, safetyWarning: undefined }],
    ['relatedComponents no es lista', { ...validData, relatedComponents: 'fuente' }],
    ['campo desconocido', { ...validData, autor: 'alguien' }],
  ])('rechaza frontmatter inválido: %s', (_, data) => {
    expect(() =>
      parseGuides({ '/content/guides/cableado-basico.md': mod(data) }, componentIds),
    ).toThrow(/cableado-basico\.md/);
  });

  it('rechaza un slug que no coincide con el nombre del archivo', () => {
    expect(() => parseGuides({ '/content/guides/otra.md': mod(validData) }, componentIds)).toThrow(
      /no coincide con el nombre del archivo/,
    );
  });

  it('rechaza slugs duplicados', () => {
    expect(() =>
      parseGuides(
        {
          '/content/guides/cableado-basico.md': mod(validData),
          '/otra/carpeta/cableado-basico.md': mod(validData),
        },
        componentIds,
      ),
    ).toThrow(/slug duplicado/);
  });

  it('rechaza componentes relacionados que no existen', () => {
    expect(() =>
      parseGuides(
        {
          '/content/guides/cableado-basico.md': mod({
            ...validData,
            relatedComponents: ['monitor'],
          }),
        },
        componentIds,
      ),
    ).toThrow(/"monitor", que no existe/);
  });

  it('reporta todos los errores juntos', () => {
    const run = () =>
      parseGuides(
        {
          '/content/guides/a.md': mod({ ...validData, slug: 'a', level: 'x' }),
          '/content/guides/b.md': mod({ ...validData, slug: 'b', relatedComponents: ['x'] }),
        },
        componentIds,
      );
    expect(run).toThrow(/a\.md: level/);
    expect(run).toThrow(/b\.md: relatedComponents/);
  });
});

describe('content/guides', () => {
  it('carga las 3 guías del MVP', () => {
    expect(guides.map((g) => g.slug).sort()).toEqual(
      ['armado-paso-a-paso', 'cableado-basico', 'pc-no-enciende'].sort(),
    );
  });

  it('cada guía relacionada desde components.json existe', () => {
    for (const component of components) {
      for (const slug of component.relatedGuides) {
        expect(getGuide(slug), `${component.id} → ${slug}`).toBeDefined();
      }
    }
  });

  it('las relaciones guía ↔ componente son recíprocas', () => {
    for (const guide of guides) {
      for (const id of guide.relatedComponents) {
        const component = components.find((c) => c.id === id);
        expect(component?.relatedGuides, `${guide.slug} → ${id}`).toContain(guide.slug);
      }
    }
  });

  it('las guías que tocan la fuente de poder llevan advertencia de seguridad', () => {
    for (const guide of guides.filter((g) => g.relatedComponents.includes('fuente'))) {
      expect(guide.safetyWarning, guide.slug).toBe(true);
    }
  });
});
