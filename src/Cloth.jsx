import React, { createRef, forwardRef, Fragment, memo, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere, useDistanceConstraint } from '@react-three/cannon';
import * as THREE from 'three';

const Stitch = memo(({ p1, p2, distance = 0.1 }) => {
  useDistanceConstraint(p1.current?.particle, p2.current?.particle, {
    distance
  });
  return null;
});

const Particle = memo(forwardRef(({ mass, position }, ref) => {
  const [particle, api] = useSphere(() => ({
    mass,
    position,
    args: [0.02],
    linearDamping: 0.4,
    material: { friction: 0.4, restitution: 0.1 }
  }));

  if (ref && particle.current) {
    ref.current = { particle, api };
  }

  return (
    <mesh ref={particle} visible={false}>
      <sphereGeometry args={[0.02]} />
      <meshBasicMaterial color="blue" />
    </mesh>
  );
}));

export const Cloth = memo(() => {
  const meshRef = useRef();
  const [readyForStitches, setReadyForStitches] = useState(false);
  const width = 3;
  const height = 3;
  const resolutionX = 10;
  const resolutionY = 10;
  
  const particles = useRef(
    Array.from({ length: resolutionY }, () => 
      Array.from({ length: resolutionX }, createRef)
    )
  );

  useEffect(() => {
    setReadyForStitches(true);
  }, []);

  useFrame(() => {
    if (particles.current[0][0]?.current?.particle?.current && meshRef.current) {
      const geom = meshRef.current.geometry;
      const positions = geom.attributes.position.array;
      
      for (let yi = 0; yi < resolutionY; yi++) {
        for (let xi = 0; xi < resolutionX; xi++) {
          const particleRef = particles.current[yi][xi].current?.particle?.current;
          if (particleRef) {
            const vertexIndex = (yi * resolutionX + xi) * 3;
            positions[vertexIndex] = particleRef.position.x;
            positions[vertexIndex + 1] = particleRef.position.y;
            positions[vertexIndex + 2] = particleRef.position.z;
          }
        }
      }
      
      geom.attributes.position.needsUpdate = true;
      geom.computeVertexNormals();
    }
  });

  const distanceX = width / resolutionX;
  const distanceY = height / resolutionY;
  const distanceDiagonal = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  return (
    <group position={[0, 3, 0]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height, resolutionX - 1, resolutionY - 1]} />
        <meshStandardMaterial color={'#ff6b6b'} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Particles */}
      {particles.current.map((row, yi) =>
        row.map((particleRef, xi) => (
          <Particle
            ref={particleRef}
            mass={yi === 0 && (xi < 2 || xi > resolutionX - 3) ? 0 : 0.1}
            key={`${yi}-${xi}`}
            position={[
              (xi * width) / resolutionX - width / 2,
              -(yi * height) / resolutionY + height / 2,
              0
            ]}
          />
        ))
      )}
      
      {/* Stitches/Constraints */}
      {readyForStitches &&
        particles.current.map((row, yi) =>
          row.map((particleRef, xi) => (
            <Fragment key={`stitch-${yi}-${xi}`}>
              {/* Horizontal neighbor */}
              {xi < resolutionX - 1 && (
                <Stitch
                  key={`${yi}-${xi}-x`}
                  p1={particleRef}
                  p2={particles.current[yi][xi + 1]}
                  distance={distanceX}
                />
              )}
              {/* Vertical neighbor */}
              {yi < resolutionY - 1 && (
                <Stitch
                  key={`${yi}-${xi}-y`}
                  p1={particleRef}
                  p2={particles.current[yi + 1][xi]}
                  distance={distanceY}
                />
              )}
              {/* Diagonal shear constraints */}
              {yi < resolutionY - 1 && xi < resolutionX - 1 && (
                <Stitch
                  key={`${yi}-${xi}-s1`}
                  p1={particleRef}
                  p2={particles.current[yi + 1][xi + 1]}
                  distance={distanceDiagonal}
                />
              )}
              {yi > 0 && xi < resolutionX - 1 && (
                <Stitch
                  key={`${yi}-${xi}-s2`}
                  p1={particleRef}
                  p2={particles.current[yi - 1][xi + 1]}
                  distance={distanceDiagonal}
                />
              )}
            </Fragment>
          ))
        )}
    </group>
  );
});