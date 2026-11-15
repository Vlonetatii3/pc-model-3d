import { components } from '../data/components';
import { guideFrontmatterSchema, type Guide } from './schema';
import { checkSections } from './sections';

export interface GuideModule {
  data: Record<string, unknown>;
  content: string;
  html: string;
}

/**
 * Valida los módulos de guía (ruta → { data, content }).
 * Comprueba el frontmatter, que el slug coincida con el nombre del archivo,
 * que no haya slugs repetidos, que relatedComponents apunte a ids existentes
 * y que el cuerpo tenga las secciones obligatorias en orden.
 */
export function parseGuides(
  modules: Record<string, GuideModule>,
  componentIds: readonly string[],
): Guide[] {
  const errors: string[] = [];
  const guides: Guide[] = [];
  const knownIds = new Set(componentIds);
  const seenSlugs = new Set<string>();

  for (const [path, module] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
    const file = path.split('/').pop() ?? path;
    const result = guideFrontmatterSchema.safeParse(module.data);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${file}: ${issue.path.join('.') || '(raíz)'}: ${issue.message}`);
      }
      continue;
    }

    const data = result.data;
    if (`${data.slug}.md` !== file) {
      errors.push(`${file}: slug "${data.slug}" no coincide con el nombre del archivo`);
    }
    if (seenSlugs.has(data.slug)) {
      errors.push(`${file}: slug duplicado "${data.slug}"`);
    }
    seenSlugs.add(data.slug);
    for (const id of data.relatedComponents) {
      if (!knownIds.has(id)) {
        errors.push(`${file}: relatedComponents incluye "${id}", que no existe en components.json`);
      }
    }

    for (const problem of checkSections(module.content)) {
      errors.push(`${file}: ${problem}`);
    }

    guides.push({ ...data, body: module.content, html: module.html });
  }

  if (errors.length > 0) {
    throw new Error(`Guías no válidas:\n${errors.join('\n')}`);
  }
  return guides;
}

const modules = import.meta.glob<GuideModule>('/content/guides/*.md', {
  eager: true,
  import: 'default',
});

export const guides: Guide[] = parseGuides(
  modules,
  components.map((component) => component.id),
);

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
