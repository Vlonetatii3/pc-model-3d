import { Environment, Lightformer } from '@react-three/drei';

/**
 * Iluminación de estudio generada en el navegador (sin descargar mapas HDR externos).
 * Los Lightformer forman el mapa de entorno que da reflejos a los metales;
 * las luces direccionales dan volumen.
 */
export default function StudioLighting() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        {/* Caja de luz superior */}
        <Lightformer
          form="rect"
          intensity={1.4}
          position={[0, 4, 0]}
          rotation-x={Math.PI / 2}
          scale={[6, 6, 1]}
        />
        {/* Panel del lado abierto: ilumina el interior */}
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-4, 1, 0]}
          rotation-y={Math.PI / 2}
          scale={[6, 3, 1]}
        />
        {/* Panel frontal */}
        <Lightformer form="rect" intensity={0.6} position={[0, 1, 4]} scale={[6, 3, 1]} />
        {/* Contraluz suave */}
        <Lightformer
          form="rect"
          intensity={0.5}
          position={[3, 1, -3]}
          rotation-y={-Math.PI / 4}
          scale={[4, 2, 1]}
        />
      </Environment>
      <ambientLight intensity={0.25} />
      <directionalLight position={[-2, 3, 1.5]} intensity={1.6} />
      <directionalLight position={[1, 2, 2]} intensity={0.5} />
    </>
  );
}
