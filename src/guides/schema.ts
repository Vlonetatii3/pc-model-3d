import { z } from 'zod';

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Debe estar en minúsculas y separado por guiones');

const nonEmpty = z.string().trim().min(1, 'No puede estar vacío');

export const guideLevels = ['básico', 'intermedio'] as const;

export const guideFrontmatterSchema = z.strictObject({
  title: nonEmpty,
  slug,
  level: z.enum(guideLevels),
  estimatedTime: nonEmpty,
  safetyWarning: z.boolean(),
  relatedComponents: z.array(slug),
});

export type GuideFrontmatter = z.infer<typeof guideFrontmatterSchema>;

export interface Guide extends GuideFrontmatter {
  /** Cuerpo en Markdown, sin el frontmatter. */
  body: string;
  /** Cuerpo convertido a HTML en build (contenido propio del repo, no de usuarios). */
  html: string;
}
