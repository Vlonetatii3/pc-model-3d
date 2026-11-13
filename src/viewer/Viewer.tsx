import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Model from './Model';
import { MODEL_URL } from './modelAvailability';
import './Viewer.css';

export default function Viewer() {
  return (
    <div className="viewer">
      <div className="viewer-canvas">
        <Canvas camera={{ position: [0.8, 0.5, 0.8], fov: 45, near: 0.01, far: 100 }} dpr={[1, 2]}>
          <hemisphereLight args={['#ffffff', '#8a94a6', 0.8]} />
          <directionalLight position={[2, 3, 2]} intensity={1.4} />
          <directionalLight position={[-2, 1, -1]} intensity={0.4} />
          <Suspense fallback={null}>
            <Model url={MODEL_URL} />
          </Suspense>
          <OrbitControls makeDefault enableDamping enablePan={false} />
        </Canvas>
      </div>
      <p className="viewer-help">
        Arrastra para rotar. Usa la rueda del mouse o pellizca para acercar y alejar.
      </p>
    </div>
  );
}
