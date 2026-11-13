type CanvasFactory = () => Pick<HTMLCanvasElement, 'getContext'>;

/** Comprueba si el navegador puede crear un contexto WebGL. */
export function isWebGLAvailable(
  createCanvas: CanvasFactory = () => document.createElement('canvas'),
): boolean {
  try {
    const canvas = createCanvas();
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
