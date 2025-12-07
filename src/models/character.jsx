import { a, useSpring } from "@react-spring/three";
import { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import characterScene from "../assets/3d/fisherman.glb";

const Character = ({ onCharacterClick, ...props }) => {
  const characterRef = useRef();
  const textRef = useRef();
  const bubbleRef = useRef();
  const { nodes, materials, animations, scene } = useGLTF(characterScene);
  const { actions } = useAnimations(animations, characterRef);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Spring animation for the greeting
  const { scale, opacity } = useSpring({
    scale: showGreeting ? 1 : 0,
    opacity: showGreeting ? 1 : 0,
    config: { tension: 300, friction: 20 },
  });

  // Hover animation
  const { hoverScale } = useSpring({
    hoverScale: isHovered ? 1.1 : 1,
    config: { tension: 300, friction: 10 },
  });

  // Play animation on mount
  useEffect(() => {
    if (actions) {
      const animationNames = Object.keys(actions);
      console.log("Available animations:", animationNames);
      
      if (animationNames.length > 0) {
        const action = actions[animationNames[0]];
        action?.reset().fadeIn(0.5).play();
      }
    }

    // Show greeting after a short delay
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [actions]);

  // Floating animation for the speech bubble
  useFrame((state) => {
    if (bubbleRef.current) {
      bubbleRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onCharacterClick) {
      onCharacterClick();
    }
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <a.group 
      {...props} 
      scale={hoverScale}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Character */}
      <group ref={characterRef}>
        <group name="Sketchfab_Scene">
          <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
            <group
              name="d495852d56ee462ca500e2c656753311fbx"
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.01}
            >
              <group name="Object_2">
                <group name="RootNode">
                  <group
                    name="Plane002"
                    position={[0, 779.273, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={100}
                  />
                  <group
                    name="Armature"
                    position={[0, 562.026, 12.78]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    scale={100}
                  >
                    <group name="Object_6">
                      <primitive object={nodes._rootJoint} />
                      <skinnedMesh
                        name="Object_9"
                        geometry={nodes.Object_9.geometry}
                        material={materials.gair}
                        skeleton={nodes.Object_9.skeleton}
                      />
                      <group
                        name="Object_8"
                        position={[0, 779.273, 0]}
                        rotation={[-Math.PI / 2, 0, 0]}
                        scale={100}
                      />
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Speech Bubble Group */}
      <a.group
        position={[0, 12, 0]}
        scale={scale}
        ref={bubbleRef}
      >
        {/* Bubble Background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4, 2, 1]} />
          <a.meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Bubble Border */}
        <mesh position={[0, 0, 0.01]}>
          <ringGeometry args={[1.8, 2.1, 32]} />
          <a.meshStandardMaterial
            color="#4CAF50"
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* Speech Bubble Tail */}
        <mesh position={[-0.8, -1.2, 0]} rotation={[0, 0, Math.PI / 6]}>
          <coneGeometry args={[0.3, 0.8, 3]} />
          <a.meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* "Hi!" Text */}
        <Text
          ref={textRef}
          position={[0, 0, 0.1]}
          fontSize={1.2}
          color="#4CAF50"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/righteous/v13/1cXxaUPXBpj2rGoU7C9mj3uEicG01A.woff"
          outlineWidth={0.05}
          outlineColor="#ffffff"
        >
          Click me! 👆
        </Text>

        {/* Sparkles/Decorations */}
        {[...Array(3)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI * 2) / 3) * 2,
              Math.sin((i * Math.PI * 2) / 3) * 1.2,
              0.1,
            ]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <a.meshStandardMaterial
              color="#FFD700"
              transparent
              opacity={opacity}
              emissive="#FFD700"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </a.group>
    </a.group>
  );
};

export default Character;