import { usePlane } from '@react-three/cannon';

export const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    material: { friction: 0.4, restitution: 0.3 }
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshLambertMaterial color="#cccccc" />
    </mesh>
  );
};