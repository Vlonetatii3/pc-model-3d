import { readGlbNodeNames } from './glb';

/** Arma un .glb mínimo en memoria con el JSON indicado. */
function makeGlb(json: object, { magic = 0x46546c67, version = 2 } = {}) {
  let text = JSON.stringify(json);
  while (text.length % 4 !== 0) text += ' ';
  const jsonBytes = new TextEncoder().encode(text);
  const buffer = new ArrayBuffer(20 + jsonBytes.length);
  const view = new DataView(buffer);
  view.setUint32(0, magic, true);
  view.setUint32(4, version, true);
  view.setUint32(8, buffer.byteLength, true);
  view.setUint32(12, jsonBytes.length, true);
  view.setUint32(16, 0x4e4f534a, true);
  new Uint8Array(buffer, 20).set(jsonBytes);
  return buffer;
}

describe('readGlbNodeNames', () => {
  it('lee los nombres de los nodos', () => {
    const glb = makeGlb({ nodes: [{ name: 'GPU' }, { name: 'CPU' }, {}] });
    expect(readGlbNodeNames(glb)).toEqual(['GPU', 'CPU', '']);
  });

  it('devuelve una lista vacía si no hay nodos', () => {
    expect(readGlbNodeNames(makeGlb({ asset: { version: '2.0' } }))).toEqual([]);
  });

  it('rechaza archivos que no son .glb', () => {
    expect(() => readGlbNodeNames(makeGlb({}, { magic: 0x12345678 }))).toThrow(/no es un archivo/i);
    expect(() => readGlbNodeNames(new ArrayBuffer(4))).toThrow(/no es un archivo/i);
  });

  it('rechaza versiones distintas de glTF 2', () => {
    expect(() => readGlbNodeNames(makeGlb({}, { version: 1 }))).toThrow(/versión/i);
  });
});
