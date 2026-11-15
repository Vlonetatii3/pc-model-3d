import matter from 'gray-matter';
import { marked } from 'marked';
import type { Plugin } from 'vite';

/**
 * Convierte los .md de content/guides/ en módulos JS con { data, content, html }.
 * gray-matter y marked corren en Node durante el build, así el navegador no necesita
 * polyfills; la validación con zod ocurre en src/guides/guides.ts.
 */
export function guideMarkdown(): Plugin {
  return {
    name: 'armatupc:guide-markdown',
    transform(code, id) {
      const path = id.split('?')[0].replaceAll('\\', '/');
      if (!/\/content\/guides\/[^/]+\.md$/.test(path)) return null;
      const { data, content } = matter(code);
      const html = marked.parse(content, { async: false });
      return {
        code: `export default ${JSON.stringify({ data, content, html })};`,
        map: null,
      };
    },
  };
}
