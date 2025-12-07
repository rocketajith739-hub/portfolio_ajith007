// fish.jsx - Enhanced with better scaling
import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import fishScene from "../assets/3d/fish.glb";

export function Fish({ speed = 0.5, direction = 1, scale = 1, ...props }) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF(fishScene);
  const { actions } = useAnimations(animations, group);

  const initialX = useRef(props.position?.[0] || 0);

  // Play default fish animation once
  useEffect(() => {
    if (!actions) return;
    const keys = Object.keys(actions);
    if (keys.length > 0) {
      const action = actions[keys[0]];
      if (action) {
        action.play();
        action.setEffectiveTimeScale(0.8 + Math.random() * 0.4); // Varied animation speed
      }
    }
  }, [actions]);

  // Add swimming movement
  useFrame((state, delta) => {
    if (!group.current) return;

    // gentle bobbing
    const t = state.clock.elapsedTime;
    group.current.position.y += Math.cos(t * 0.8) * 0.003;

    // horizontal swim
    group.current.position.x += direction * speed * delta;

    // wrap around to create endless swim
    const range = 15;
    if (direction > 0 && group.current.position.x > initialX.current + range) {
      group.current.position.x = initialX.current - range;
    } else if (
      direction < 0 &&
      group.current.position.x < initialX.current - range
    ) {
      group.current.position.x = initialX.current + range;
    }
  });

  // Calculate the actual scale
  const actualScale = typeof scale === 'number' ? scale : 1;
  const baseScale = 0.063 * actualScale;

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Sketchfab_Scene">
        <group
          name="Sketchfab_model"
          rotation={[-Math.PI / 2, 0, 0]}
          scale={baseScale}
        >
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="RootNode0_0" scale={0.01}>
                <group name="skeletal3_7">
                  <group name="GLTF_created_0">
                    <primitive object={nodes.GLTF_created_0_rootJoint} />
                    <skinnedMesh
                      name="Object_156"
                      geometry={nodes.Object_156.geometry}
                      material={materials.material_0}
                      skeleton={nodes.Object_156.skeleton}
                    />
                    <skinnedMesh
                      name="Object_159"
                      geometry={nodes.Object_159.geometry}
                      material={materials.material_1}
                      skeleton={nodes.Object_159.skeleton}
                    />
                    <skinnedMesh
                      name="Object_162"
                      geometry={nodes.Object_162.geometry}
                      material={materials.material_2}
                      skeleton={nodes.Object_162.skeleton}
                    />
                    <skinnedMesh
                      name="Object_165"
                      geometry={nodes.Object_165.geometry}
                      material={materials.material_3}
                      skeleton={nodes.Object_165.skeleton}
                    />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(fishScene);