export const MODEL_URL = '/models/pc-completa.glb';

/**
 * Comprueba si el modelo existe antes de pedírselo al GLTFLoader.
 * El servidor de desarrollo (y muchos hostings estáticos con fallback SPA)
 * responden 200 con index.html para archivos inexistentes, así que además
 * del status se descarta una respuesta HTML.
 */
export async function isModelAvailable(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await fetchFn(url, { method: 'HEAD' });
    if (!response.ok) return false;
    const contentType = response.headers.get('content-type') ?? '';
    return !contentType.includes('text/html');
  } catch {
    return false;
  }
}

export function warnMissingModel(url: string): void {
  console.warn(
    `[visor] No se encontró el modelo en "${url}". Se muestra un placeholder. ` +
      'Coloca el archivo .glb exportado desde Blender en public/models/.',
  );
}
