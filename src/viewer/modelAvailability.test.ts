import { isModelAvailable, warnMissingModel } from './modelAvailability';

function fakeFetch(status: number, contentType: string | null) {
  return vi.fn(async () => {
    const headers = new Headers();
    if (contentType) headers.set('content-type', contentType);
    return new Response(null, { status, headers });
  }) as unknown as typeof fetch;
}

describe('isModelAvailable', () => {
  it('devuelve true si el servidor responde con un binario', async () => {
    expect(await isModelAvailable('/m.glb', fakeFetch(200, 'model/gltf-binary'))).toBe(true);
  });

  it('devuelve true si no hay content-type', async () => {
    expect(await isModelAvailable('/m.glb', fakeFetch(200, null))).toBe(true);
  });

  it('devuelve false con 404', async () => {
    expect(await isModelAvailable('/m.glb', fakeFetch(404, 'text/plain'))).toBe(false);
  });

  it('devuelve false si el servidor devuelve index.html (fallback SPA)', async () => {
    expect(await isModelAvailable('/m.glb', fakeFetch(200, 'text/html; charset=utf-8'))).toBe(
      false,
    );
  });

  it('devuelve false si la red falla', async () => {
    const failing = vi.fn(async () => {
      throw new TypeError('network');
    }) as unknown as typeof fetch;
    expect(await isModelAvailable('/m.glb', failing)).toBe(false);
  });
});

describe('warnMissingModel', () => {
  it('registra una advertencia con la ruta del modelo', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    warnMissingModel('/models/x.glb');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('/models/x.glb'));
    warn.mockRestore();
  });
});
