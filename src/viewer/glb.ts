/**
 * Lectura mínima de archivos .glb (glTF 2.0 binario) sin depender de three.js.
 * Formato: cabecera de 12 bytes y luego bloques; el primero es el JSON de la escena.
 * https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#binary-gltf-layout
 */

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"

interface GltfJson {
  nodes?: { name?: string; mesh?: number; children?: number[] }[];
}

export function readGlbJson(data: ArrayBuffer | Uint8Array): GltfJson {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (bytes.byteLength < 20 || view.getUint32(0, true) !== GLB_MAGIC) {
    throw new Error('No es un archivo .glb válido');
  }
  const version = view.getUint32(4, true);
  if (version !== 2) throw new Error(`Versión de glTF no soportada: ${version}`);

  const chunkLength = view.getUint32(12, true);
  const chunkType = view.getUint32(16, true);
  if (chunkType !== CHUNK_JSON) throw new Error('El primer bloque del .glb no es JSON');

  const json = new TextDecoder().decode(bytes.subarray(20, 20 + chunkLength));
  return JSON.parse(json) as GltfJson;
}

/** Nombres de todos los nodos de la escena, en orden. */
export function readGlbNodeNames(data: ArrayBuffer | Uint8Array): string[] {
  return (readGlbJson(data).nodes ?? []).map((node) => node.name ?? '');
}
