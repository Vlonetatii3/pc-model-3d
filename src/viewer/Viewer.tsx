import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Model from './Model';
import { MODEL_URL } from './modelAvailability';
import StudioLighting from './StudioLighting';
import './Viewer.css';

// Ángulos en radianes. Azimut 0 = frente del gabinete; -π/2 = lado abierto.
const ORBIT_LIMITS = {
  minAzimuthAngle: -Math.PI * 0.78,
  maxAzimuthAngle: Math.PI * 0.35,
  minPolarAngle: Math.PI * 0.12,
  maxPolarAngle: Math.PI * 0.56,
};

export interface ViewerProps {
  modelNodes: ReadonlySet<string>;
  selectedNode: string | null;
  onSelectNode: (node: string | null) => void;
}

export default function Viewer(props: ViewerProps) {
  return (
    <div className="viewer">
      <div className="viewer-canvas">
        <Canvas
          camera={{ position: [-0.8, 0.45, 0.6], fov: 40, near: 0.01, far: 100 }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <StudioLighting />
          <Suspense fallback={null}>
            <Model url={MODEL_URL} {...props} />
          </Suspense>
          <OrbitControls makeDefault enableDamping enablePan={false} {...ORBIT_LIMITS} />
        </Canvas>
      </div>
      <p className="viewer-help">
        Arrastra para rotar. Usa la rueda del mouse o pellizca para acercar y alejar. Haz clic en
        una pieza para ver qué es.
      </p>
    </div>
  );
}
