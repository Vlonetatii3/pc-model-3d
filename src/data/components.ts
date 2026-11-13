import rawComponents from './components.json';
import { componentsSchema, type PcComponent } from './schema';

export function parseComponents(data: unknown): PcComponent[] {
  const result = componentsSchema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`components.json no es válido:\n${detail}`);
  }
  return result.data;
}

export const components: PcComponent[] = parseComponents(rawComponents);

export function getComponentById(id: string): PcComponent | undefined {
  return components.find((component) => component.id === id);
}

export function getComponentByModelNode(modelNode: string): PcComponent | undefined {
  return components.find((component) => component.modelNode === modelNode);
}
