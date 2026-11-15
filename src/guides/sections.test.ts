import { checkSections, splitSections } from './sections';

const body = (...lines: string[]) => lines.join('\n');

const valid = body(
  'Introducción opcional.',
  '## Qué necesitas',
  '- Destornillador',
  '## Pasos',
  '1. Primero.',
  '2. Después.',
  '## Errores comunes',
  'Texto.',
  '## Cuándo pedir ayuda profesional',
  'Texto.',
);

describe('splitSections', () => {
  it('separa por encabezados de nivel 2 e ignora los de nivel 3', () => {
    const sections = splitSections(body('## A', 'uno', '### Sub', '## B', 'dos'));
    expect(sections.map((s) => s.heading)).toEqual(['A', 'B']);
    expect(sections[0].text).toContain('### Sub');
  });

  it('ignora encabezados dentro de bloques de código', () => {
    const sections = splitSections(body('## A', '```', '## No es sección', '```'));
    expect(sections.map((s) => s.heading)).toEqual(['A']);
  });
});

describe('checkSections', () => {
  it('acepta las cuatro secciones en orden con pasos numerados', () => {
    expect(checkSections(valid)).toEqual([]);
  });

  it('rechaza un cuerpo vacío', () => {
    expect(checkSections('')).toEqual([expect.stringMatching(/encontradas: ninguna/)]);
  });

  it('rechaza secciones fuera de orden', () => {
    const swapped = valid
      .replace('## Errores comunes', '## TMP')
      .replace('## Pasos', '## Errores comunes')
      .replace('## TMP', '## Pasos');
    expect(checkSections(swapped)).toContainEqual(expect.stringMatching(/en orden/));
  });

  it('rechaza si falta "Cuándo pedir ayuda profesional"', () => {
    const missing = valid.split('## Cuándo pedir ayuda profesional')[0];
    expect(checkSections(missing)).toEqual([expect.stringMatching(/Errores comunes\)$/)]);
  });

  it('rechaza secciones extra', () => {
    expect(checkSections(`${valid}\n## Extra\nTexto.`)).toHaveLength(1);
  });

  it('rechaza pasos sin lista numerada', () => {
    const bullets = valid.replace('1. Primero.\n2. Después.', '- Primero.\n- Después.');
    expect(checkSections(bullets)).toEqual(['la sección "Pasos" debe tener una lista numerada']);
  });
});
