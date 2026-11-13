import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Model from './Model';
import { MODEL_URL } from './modelAvailability';
import './Viewer.css';

export default function Viewer() {
  return (
    <div className="viewer-canvas">
      <Canvas camera={{ position: [0.8, 0.5, 0.8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <Suspense fallback={null}>
          <Model url={MODEL_URL} />
        </Suspense>
      </Canvas>
    </div>
  );
}
