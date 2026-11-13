import { z } from 'zod';

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Debe estar en minúsculas y separado por guiones');

const nonEmpty = z.string().trim().min(1, 'No puede estar vacío');

export const keySpecSchema = z.object({
  label: nonEmpty,
  value: nonEmpty,
});

export const componentSchema = z.object({
  id: slug,
  name: nonEmpty,
  category: nonEmpty,
  summary: nonEmpty,
  function: nonEmpty,
  keySpecs: z.array(keySpecSchema),
  modelNode: z
    .string()
    .regex(/^[A-Za-z0-9_]+$/, 'Solo letras, números y guiones bajos (nombre de nodo en Blender)'),
  relatedGuides: z.array(slug),
});

export const componentsSchema = z.array(componentSchema).superRefine((items, ctx) => {
  for (const key of ['id', 'modelNode'] as const) {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item[key])) {
        ctx.addIssue({
          code: 'custom',
          message: `Valor duplicado en "${key}": ${item[key]}`,
          path: [index, key],
        });
      }
      seen.add(item[key]);
    });
  }
});

export type KeySpec = z.infer<typeof keySpecSchema>;
export type PcComponent = z.infer<typeof componentSchema>;
