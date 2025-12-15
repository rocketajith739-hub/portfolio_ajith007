import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import birdScene from "../assets/3d/bird.glb";

const Bird = ({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], ...props }) => {
  const birdRef = useRef();

  const { scene, nodes, materials, animations } = useGLTF(birdScene);

  // Filter animation tracks that point to missing nodes
  const cleanedAnimations = animations.map((clip) => {
    const filtered = clip.clone();

    filtered.tracks = clip.tracks.filter((track) => {
      const nodeName = track.name.split(".")[0];
      return scene.getObjectByName(nodeName);        // FIX: validate against scene graph
    });

    return filtered;
  });

  const { actions } = useAnimations(cleanedAnimations, birdRef);

  useEffect(() => {
    if (!actions) return;

    const flyAction =
      actions["Take 001"] ||
      actions["Flying"] ||
      actions["fly"] ||
      Object.values(actions)[0];

    if (flyAction) {
      flyAction.reset().fadeIn(0.5).play();
    }
  }, [actions]);

  return (
    <group ref={birdRef} position={position} rotation={rotation} scale={scale} {...props}>
      <primitive object={nodes._rootJoint} />
      <skinnedMesh
        geometry={nodes.Object_7.geometry}
        material={materials.blinn2}
        skeleton={nodes.Object_7.skeleton}
      />
    </group>
  );
};

export default Bird;
