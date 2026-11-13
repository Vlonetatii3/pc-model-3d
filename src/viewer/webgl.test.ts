import { isWebGLAvailable } from './webgl';

const canvasWith = (getContext: (type: string) => unknown) => () =>
  ({ getContext }) as unknown as HTMLCanvasElement;

describe('isWebGLAvailable', () => {
  it('es true si hay WebGL 2', () => {
    expect(isWebGLAvailable(canvasWith((t) => (t === 'webgl2' ? {} : null)))).toBe(true);
  });

  it('es true si solo hay WebGL 1', () => {
    expect(isWebGLAvailable(canvasWith((t) => (t === 'webgl' ? {} : null)))).toBe(true);
  });

  it('es false si no hay contexto', () => {
    expect(isWebGLAvailable(canvasWith(() => null))).toBe(false);
  });

  it('es false si crear el contexto lanza un error', () => {
    expect(
      isWebGLAvailable(
        canvasWith(() => {
          throw new Error('bloqueado');
        }),
      ),
    ).toBe(false);
  });
});
