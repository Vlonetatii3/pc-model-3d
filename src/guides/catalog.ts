/**
 * Catálogo provisional de guías (slug → título).
 * Se reemplaza por el frontmatter de content/guides/ en T12.
 */
export interface GuideSummary {
  slug: string;
  title: string;
}

export const guideCatalog: GuideSummary[] = [
  { slug: 'armado-paso-a-paso', title: 'Armado de PC paso a paso' },
  { slug: 'cableado-basico', title: 'Cableado básico' },
  { slug: 'pc-no-enciende', title: 'La PC no enciende' },
];

export function getGuideSummary(slug: string): GuideSummary | undefined {
  return guideCatalog.find((guide) => guide.slug === slug);
}
