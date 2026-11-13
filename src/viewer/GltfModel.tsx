import { useGLTF } from '@react-three/drei';

interface GltfModelProps {
  url: string;
}

export default function GltfModel({ url }: GltfModelProps) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}
