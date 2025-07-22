import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';

export const AnimatedSphere = () => {
  const [ref, api] = useSphere(() => ({
    mass: 100,
    args: [0.25],
    material: { friction: 0.1, restitution: 0.6 }
  }));

  useFrame(() => {
    const now = performance.now();
    api.position.set(
      Math.sin(now / 1000) * 2,
      3 + Math.sin(now / 800) * 0.001,
      -0.5 + Math.cos(now / 1000) * 1.2
    );
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.25, 32, 32]} />
      <meshStandardMaterial color={'#4ecdc4'} />
    </mesh>
  );
};