import React from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Line,
  Sphere,
  Text,
  Billboard,
} from "@react-three/drei";

// Convert Bloch vector (x, y, z) to spherical coordinates (theta, phi)
function blochToSpherical(x: number, y: number, z: number) {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.acos(z / (r || 1)); // polar angle
  const phi = Math.atan2(y, x); // azimuthal angle
  return { r, theta, phi };
}

// 3D Bloch Sphere visualization
const BlochSphere3D: React.FC<{
  x: number;
  y: number;
  z: number;
}> = ({ x, y, z }) => {
  const { theta, phi } = blochToSpherical(x, y, z);

  // Calculate the vector endpoint on unit sphere
  // Standard Bloch sphere has Z as vertical axis
  const vecX = Math.sin(theta) * Math.cos(phi);
  const vecY = Math.cos(theta); // Z coordinate becomes Y (vertical in Three.js)
  const vecZ = Math.sin(theta) * Math.sin(phi);

  return (
    <>
      {/* Wireframe sphere */}
      <Sphere args={[1, 16, 16]}>
        <meshBasicMaterial
          color="#60a5fa"
          wireframe
          transparent
          opacity={0.2}
        />
      </Sphere>

      {/* X axis (red) - horizontal */}
      <Line
        points={[
          [-1.3, 0, 0],
          [1.3, 0, 0],
        ]}
        color="#ef4444"
        lineWidth={2}
      />
      <Billboard position={[1.5, 0, 0]}>
        <Text fontSize={0.15} color="#ef4444" fontWeight="bold">
          X
        </Text>
      </Billboard>

      {/* Y axis (blue) - vertical, this is the Z axis in quantum terms */}
      <Line
        points={[
          [0, -1.3, 0],
          [0, 1.3, 0],
        ]}
        color="#3b82f6"
        lineWidth={2}
      />
      <Billboard position={[0, 1.5, 0]}>
        <Text fontSize={0.15} color="#3b82f6" fontWeight="bold">
          |0⟩
        </Text>
      </Billboard>
      <Billboard position={[0, -1.5, 0]}>
        <Text fontSize={0.15} color="#3b82f6" fontWeight="bold">
          |1⟩
        </Text>
      </Billboard>

      {/* Z axis (green) - this is the Y axis in quantum terms, depth in 3D */}
      <Line
        points={[
          [0, 0, -1.3],
          [0, 0, 1.3],
        ]}
        color="#10b981"
        lineWidth={2}
      />
      <Billboard position={[0, 0, 1.5]}>
        <Text fontSize={0.15} color="#10b981" fontWeight="bold">
          Y
        </Text>
      </Billboard>

      {/* State vector arrow */}
      <Line
        points={[
          [0, 0, 0],
          [vecX, vecY, vecZ],
        ]}
        color="#f0f0f0"
        lineWidth={4}
      />

      {/* State vector endpoint */}
      {/* <mesh position={[vecX, vecY, vecZ]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#f0f0f0" />
      </mesh> */}

      {/* Arrow cone at the tip */}
      <mesh
        position={[vecX * 1.08, vecY * 1.08, vecZ * 1.08]}
        rotation={[
          Math.atan2(Math.sqrt(vecX * vecX + vecZ * vecZ), vecY),
          0,
          Math.atan2(vecZ, vecX),
        ]}
      >
        <coneGeometry args={[0.06, 0.15, 8]} />
        <meshBasicMaterial color="#f0f0f0" />
      </mesh>
    </>
  );
};

const BlochSphere: React.FC<{
  x: number;
  y: number;
  z: number;
  label?: string;
}> = ({ x, y, z, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: 240, height: 240 }}>
        <Canvas camera={{ position: [1.5, 1.5, 1.5], fov: 70 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <BlochSphere3D x={x} y={y} z={z} />
          <OrbitControls enablePan={false} enableZoom={true} />
        </Canvas>
      </div>
      {label && (
        <span className="text-sm text-gray-300 mt-2 font-mono">{label}</span>
      )}
    </div>
  );
};

export default React.memo(BlochSphere);
