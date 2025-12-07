import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Bird from "./bird"; // Import the 3D bird model

/**
 * Flocking birds using the 3D bird model
 */
const Birds = ({
  count = 18,
  area = [80, 30, 120],
  heightRange = [8, 18],
  speedRange = [6, 12],
  separation = 4,
  cohesion = 0.002,
  alignment = 0.02,
  scale = 0.04, // Scale for each bird model
}) => {
  const groupRef = useRef();
  const { viewport, size } = useThree();
  
  const box = useMemo(() => {
    return {
      width: area[0],
      height: area[1],
      depth: area[2],
    };
  }, [area]);

  // Per-bird state
  const birds = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * box.width,
          THREE.MathUtils.lerp(heightRange[0], heightRange[1], Math.random()),
          (Math.random() - 0.5) * box.depth
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5),
          (Math.random() - 0.2),
          (Math.random() - 0.5)
        )
          .normalize()
          .multiplyScalar(
            THREE.MathUtils.lerp(speedRange[0], speedRange[1], Math.random())
          ),
        phase: Math.random() * Math.PI * 2,
        speed: THREE.MathUtils.lerp(speedRange[0], speedRange[1], Math.random()),
        wanderOffset: new THREE.Vector3(
          Math.random() * 10 - 5,
          Math.random() * 4 - 2,
          Math.random() * 10 - 5
        ),
      });
    }
    return arr;
  }, [count, box.width, box.depth, heightRange, speedRange]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // For each bird, update position by simple steering rules
    for (let i = 0; i < birds.length; i++) {
      const b = birds[i];

      // Simple wander target that drifts slowly
      const wander = new THREE.Vector3(
        Math.sin(time * 0.12 + b.phase) * (box.width * 0.35) + b.wanderOffset.x,
        THREE.MathUtils.lerp(
          heightRange[0],
          heightRange[1],
          0.5 + 0.5 * Math.sin(time * 0.07 + b.phase)
        ),
        Math.cos(time * 0.09 + b.phase) * (box.depth * 0.35) + b.wanderOffset.z
      );

      // Basic boids-like influences
      const steer = new THREE.Vector3();
      const pos = b.pos;
      const vel = b.vel;

      // Cohesion: steer toward wander point
      const toWander = wander.clone().sub(pos).multiplyScalar(cohesion * 60);
      steer.add(toWander);

      // Alignment + separation with neighbors
      const align = new THREE.Vector3();
      const separate = new THREE.Vector3();
      let neighbors = 0;
      
      for (let j = 0; j < birds.length; j++) {
        if (i === j) continue;
        const other = birds[j];
        const d = pos.distanceTo(other.pos);
        
        if (d < 12) {
          align.add(other.vel);
        }
        if (d < separation) {
          const diff = pos.clone().sub(other.pos).divideScalar(d + 0.0001);
          separate.add(diff);
        }
        if (d < 22) neighbors++;
      }
      
      if (neighbors > 0) {
        align.divideScalar(neighbors).multiplyScalar(alignment * 30);
        steer.add(align);
      }
      steer.add(separate.multiplyScalar(1.5));

      // Random jitter
      steer.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        )
      );

      // Apply steering
      vel.add(steer.multiplyScalar(delta * 60));
      const speedCap = b.speed;
      if (vel.length() > speedCap) vel.setLength(speedCap);
      if (vel.length() < 0.5) vel.setLength(0.5);

      // Update position
      pos.add(vel.clone().multiplyScalar(delta));

      // Wrap around flight box
      if (pos.x > box.width / 2) pos.x = -box.width / 2;
      if (pos.x < -box.width / 2) pos.x = box.width / 2;
      if (pos.y > box.height) pos.y = heightRange[0];
      if (pos.y < 0) pos.y = heightRange[0];
      if (pos.z > box.depth / 2) pos.z = -box.depth / 2;
      if (pos.z < -box.depth / 2) pos.z = box.depth / 2;

      // Apply transforms to bird group
      const birdGroup = groupRef.current?.children[i];
      if (!birdGroup) continue;

      // Position
      birdGroup.position.copy(pos);

      // Orientation - make bird look along velocity
      const forward = vel.clone().normalize();
      if (forward.lengthSq() > 0) {
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          forward
        );
        birdGroup.quaternion.slerp(targetQuat, Math.min(1, delta * 3.5));
        
        // Banking based on lateral velocity
        const bank = THREE.MathUtils.clamp(vel.x * -0.02, -0.6, 0.6);
        birdGroup.rotation.z = THREE.MathUtils.lerp(
          birdGroup.rotation.z,
          bank,
          Math.min(1, delta * 3)
        );
      }
    }
  });

  return (
    <group ref={groupRef}>
      {birds.map((bird, i) => (
        <group key={`bird-${i}`}>
          <Bird
            scale={scale}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
};

export default Birds;