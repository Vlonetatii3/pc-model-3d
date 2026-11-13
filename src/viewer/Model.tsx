import { ContactShadows } from '@react-three/drei';
import { useEffect, useState } from 'react';
import AutoFrame from './AutoFrame';
import GltfModel from './GltfModel';
import ModelErrorBoundary from './ModelErrorBoundary';
import { isModelAvailable, warnMissingModel } from './modelAvailability';
import PlaceholderModel from './PlaceholderModel';

type Status = 'checking' | 'available' | 'missing';

interface ModelProps {
  url: string;
}

export default function Model({ url }: ModelProps) {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;
    isModelAvailable(url).then((available) => {
      if (cancelled) return;
      if (!available) warnMissingModel(url);
      setStatus(available ? 'available' : 'missing');
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (status === 'checking') return null;
  if (status === 'missing') {
    return (
      <AutoFrame>
        <PlaceholderModel />
      </AutoFrame>
    );
  }

  return (
    <ModelErrorBoundary
      fallback={
        <AutoFrame>
          <PlaceholderModel />
        </AutoFrame>
      }
      onError={(error) =>
        console.warn(`[visor] No se pudo leer "${url}". Se muestra un placeholder.`, error)
      }
    >
      <AutoFrame>
        <GltfModel url={url} />
      </AutoFrame>
      {/* Fuera de AutoFrame para no afectar el encuadre. El modelo apoya en y = 0. */}
      <ContactShadows position={[0, 0.0005, 0]} scale={1} blur={2.5} opacity={0.5} far={0.25} />
    </ModelErrorBoundary>
  );
}
