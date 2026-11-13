/** Se muestra cuando falta el .glb. No es un modelo: es una primitiva de three.js. */
export default function PlaceholderModel() {
  return (
    <mesh name="PLACEHOLDER">
      <boxGeometry args={[0.2, 0.45, 0.45]} />
      <meshStandardMaterial color="#8a94a6" wireframe />
    </mesh>
  );
}
