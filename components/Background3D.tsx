'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Environment } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSpheres() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2
      group.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group ref={group}>
      {[...Array(50)].map((_, i) => (
        <Sphere
          key={i}
          position={[
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            Math.random() * 10 - 5
          ]}
          scale={Math.random() * 0.2 + 0.1}
        >
          <meshStandardMaterial
            color={`hsl(${Math.random() * 360}, 50%, 75%)`}
            roughness={0.5}
            metalness={0.8}
          />
        </Sphere>
      ))}
    </group>
  )
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-[-1]">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <AnimatedSpheres />
        <Environment preset="sunset" background />
      </Canvas>
    </div>
  )
}

