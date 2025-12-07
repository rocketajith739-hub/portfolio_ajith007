import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import birdScene from "../assets/3d/bird.glb";

const Bird = ({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], ...props }) => {
  const birdRef = useRef();
  const { nodes, materials, animations } = useGLTF(birdScene);
  const { actions } = useAnimations(animations, birdRef);

  // Play flying animation
  useEffect(() => {
    if (actions) {
      // Try common animation names - adjust based on your GLB file
      const flyAction = actions['Take 001'] || actions['Flying'] || actions['fly'] || Object.values(actions)[0];
      if (flyAction) {
        flyAction.reset().fadeIn(0.5).play();
      }
    }
  }, [actions]);

  return (
    <group ref={birdRef} position={position} rotation={rotation} scale={scale} {...props}>
      <group name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="48a629d8f15541558d2298aec3d77cfdfbx" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Object_2">
              <group name="RootNode">
                <group name="Object_4">
                  <primitive object={nodes._rootJoint} />
                  <skinnedMesh
                    name="Object_7"
                    geometry={nodes.Object_7.geometry}
                    material={materials.blinn2}
                    skeleton={nodes.Object_7.skeleton}
                  />
                  <group name="Object_6" />
                  <group name="BirdRetoppolySurface1" />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

export default Bird;