import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const Ocean = () => {
  const waterRef = useRef();
  const verticesRef = useRef([]);
  const { scene, gl } = useThree();
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);

  // Capture reflection map
  useFrame(() => {
    if (waterRef.current) {
      waterRef.current.visible = false;
      cubeCamera.update(gl, scene);
      waterRef.current.visible = true;
      waterRef.current.material.envMap = cubeRenderTarget.texture;
    }
  });

  // Initialize vertex data once
  useEffect(() => {
    if (waterRef.current) {
      const positions = waterRef.current.geometry.attributes.position;
      verticesRef.current = [];
      for (let i = 0; i < positions.count; i++) {
        verticesRef.current.push({
          x: positions.getX(i),
          y: positions.getY(i),
          z: positions.getZ(i),
        });
      }
    }
  }, []);

  // Animate waves
  useFrame((state) => {
    if (!waterRef.current) return;
    const time = state.clock.elapsedTime;
    const positions = waterRef.current.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const v = verticesRef.current[i];
      if (!v) continue;
      const wave1 = Math.sin(v.x * 0.3 + time * 1.2) * 0.2;
      const wave2 = Math.cos(v.y * 0.5 + time * 0.8) * 0.15;
      const wave3 = Math.sin((v.x + v.y) * 0.25 + time) * 0.1;
      positions.setZ(i, v.z + wave1 + wave2 + wave3);
    }
    positions.needsUpdate = true;
    waterRef.current.geometry.computeVertexNormals();
  });

  return (
    <>
      {/* Hidden cube camera for reflections */}
      <primitive object={cubeCamera} />
      {/* Water Plane */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, -2]} receiveShadow>
        <planeGeometry args={[200, 200, 128, 128]} />
        <meshPhysicalMaterial
          color="#0077be"
          metalness={0.9}
          roughness={0.05}
          reflectivity={1}
          transmission={0.2}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export default Ocean;
