import { a, useSpring } from "@react-spring/three";
import { useEffect, useRef, useMemo, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import boatScene from "../assets/3d/boat.glb";

const Boat = ({ children, isDocked, ...props }) => {
  const boatRef = useRef();
  const steamRef = useRef();
  const groupRef = useRef();
  const wakeRef = useRef();

  const { nodes, materials } = useGLTF(boatScene);

  // Animation state
  const [direction, setDirection] = useState(1);
  const animationProgress = useRef(0);
  const basePosition = useRef({ x: 0, y: 0, z: 0 });
  const isAnimating = useRef(false);

  // Reset animation state when docking
  useEffect(() => {
    if (isDocked) {
      isAnimating.current = false;
      // Reset animation progress to prevent jumping
      animationProgress.current = 0;
    } else {
      isAnimating.current = true;
    }
  }, [isDocked]);

  // Spring animation for docked state - SIMPLIFIED
  const { position: springPosition, rotation: springRotation } = useSpring({
    position: props.position,
    rotation: props.rotation,
    config: { mass: 1, tension: 120, friction: 40 }
  });

  // Initialize base position from props
  useEffect(() => {
    if (props.position) {
      basePosition.current = {
        x: props.position[0],
        y: props.position[1],
        z: props.position[2],
      };
    }
  }, [props.position]);

  // Create steam particles
  const steamParticles = useMemo(() => {
    const count = isDocked ? 20 : 50;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const lifetimes = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = -1.5 + (Math.random() - 0.5) * 0.3;

      velocities.push({
        x: (Math.random() - 0.5) * 0.01,
        y: Math.random() * 0.02 + 0.02,
        z: (Math.random() - 0.5) * 0.01,
      });

      lifetimes.push(Math.random() * 100);
    }

    return { positions, velocities, lifetimes };
  }, [isDocked]);

  // Create water wake particles
  const wakeParticles = useMemo(() => {
    const count = isDocked ? 30 : 100;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const lifetimes = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: Math.random() * 0.01,
        z: (Math.random() - 0.5) * 0.05,
      });

      lifetimes.push(Math.random() * 60);
      sizes.push(Math.random() * 0.3 + 0.1);
    }

    return { positions, velocities, lifetimes, sizes };
  }, [isDocked]);

  // Main animation loop
  useFrame(({ clock, size }) => {
    if (!groupRef.current || !boatRef.current) return;

    const elapsedTime = clock.getElapsedTime();

    // Gentle bobbing animation (always active but reduced when docked)
    const bobIntensity = isDocked ? 0.1 : 0.2;
    const rockIntensity = isDocked ? 0.02 : 0.05;
    
    boatRef.current.position.y = Math.sin(elapsedTime * 2) * bobIntensity;
    boatRef.current.rotation.z = Math.sin(elapsedTime * 1.2) * rockIntensity;
    boatRef.current.rotation.x = Math.cos(elapsedTime * 0.8) * rockIntensity;

    // Only run sailing animation when NOT docked
    if (!isDocked && isAnimating.current) {
      const speed = 0.015;
      const travelDistance = 60;
      const waveAmplitude = 3;
      const waveFrequency = 0.05;

      animationProgress.current += speed * direction;
      const xOffset = animationProgress.current;
      const zWaveOffset = Math.sin(animationProgress.current * waveFrequency) * waveAmplitude;

      const responsiveFactor = size.width < 800 ? 0.6 : 1;
      const scaledTravel = travelDistance * responsiveFactor;

      // Update group position for sailing
      groupRef.current.position.x = basePosition.current.x + xOffset * responsiveFactor;
      groupRef.current.position.z = basePosition.current.z + zWaveOffset;

      const waveSlope = Math.cos(animationProgress.current * waveFrequency) * waveFrequency;
      const slopeRotation = Math.atan2(waveSlope, 1) * direction;
      const forwardRotation = direction > 0 ? 0 : Math.PI;

      const targetYRotation = forwardRotation + slopeRotation;
      boatRef.current.rotation.y = THREE.MathUtils.lerp(
        boatRef.current.rotation.y,
        targetYRotation,
        0.05
      );

      if (Math.abs(animationProgress.current) > scaledTravel) {
        setDirection(prev => -prev);
        animationProgress.current = Math.sign(direction) * (scaledTravel - 1);
      }
    }

    // Steam animation (reduced when docked)
    if (steamRef.current) {
      const positions = steamRef.current.geometry.attributes.position.array;
      const steamIntensity = isDocked ? 0.5 : 1;
      
      for (let i = 0; i < steamParticles.velocities.length; i++) {
        positions[i * 3] += steamParticles.velocities[i].x * steamIntensity;
        positions[i * 3 + 1] += steamParticles.velocities[i].y * steamIntensity;
        positions[i * 3 + 2] += steamParticles.velocities[i].z * steamIntensity;
        steamParticles.lifetimes[i]++;
        
        if (steamParticles.lifetimes[i] > 100 || positions[i * 3 + 1] > 3) {
          positions[i * 3] = (Math.random() - 0.5) * 0.3;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = -1.5 + (Math.random() - 0.5) * 0.3;
          steamParticles.lifetimes[i] = 0;
        }
      }
      steamRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Wake animation - only when not docked
    if (wakeRef.current && !isDocked) {
      const positions = wakeRef.current.geometry.attributes.position.array;
      const sizes = wakeRef.current.geometry.attributes.size.array;
      
      for (let i = 0; i < wakeParticles.velocities.length; i++) {
        positions[i * 3] += wakeParticles.velocities[i].x - (direction * 0.08);
        positions[i * 3 + 1] += wakeParticles.velocities[i].y;
        positions[i * 3 + 2] += wakeParticles.velocities[i].z;
        wakeParticles.lifetimes[i]++;
        const life = wakeParticles.lifetimes[i];
        sizes[i] = wakeParticles.sizes[i] * (1 - life / 60);
        
        if (life > 60 || positions[i * 3 + 1] < -2) {
          positions[i * 3] = (Math.random() - 0.5) * 2;
          positions[i * 3 + 1] = -0.5 + Math.random() * 0.5;
          positions[i * 3 + 2] = 2 + (Math.random() - 0.5) * 1;
          wakeParticles.lifetimes[i] = 0;
        }
      }
      wakeRef.current.geometry.attributes.position.needsUpdate = true;
      wakeRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <a.group 
      ref={groupRef} 
      position={springPosition} 
      scale={props.scale} 
      rotation={springRotation}
    >
      {/* Boat with floating animation */}
      <a.group ref={boatRef}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Object_4.geometry}
            material={nodes.Object_4.material}
            position={[0, 0, -1.519]}
          />
        </group>

        {/* Render children (character) inside the boat group */}
        {children}
      </a.group>

      {/* Steam/Smoke Particles */}
      <points ref={steamRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={steamParticles.positions.length / 3}
            array={steamParticles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#c8d5e0"
          transparent
          opacity={isDocked ? 0.3 : 0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Water Wake Particles - only show when not docked */}
      {!isDocked && (
        <points ref={wakeRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={wakeParticles.positions.length / 3}
              array={wakeParticles.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={wakeParticles.sizes.length}
              array={new Float32Array(wakeParticles.sizes)}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.4}
            color="#ffffff"
            transparent
            opacity={0.4}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            map={createCircleTexture()}
          />
        </points>
      )}
    </a.group>
  );
};

// Helper function to create circular particle texture
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default Boat;