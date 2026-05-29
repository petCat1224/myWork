import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Points, PointMaterial, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import './SnowForestScene.scss'

const SNOW_COUNT = 1800

function SnowParticles() {
  const ref = useRef(null)
  const speeds = useMemo(() => {
    const arr = new Float32Array(SNOW_COUNT)
    for (let i = 0; i < SNOW_COUNT; i += 1) arr[i] = 0.4 + Math.random() * 1.2
    return arr
  }, [])

  const positions = useMemo(() => {
    const arr = new Float32Array(SNOW_COUNT * 3)
    for (let i = 0; i < SNOW_COUNT; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 28
      arr[i * 3 + 1] = Math.random() * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 22
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    const points = ref.current
    if (!points) return
    const pos = points.geometry.attributes.position.array
    for (let i = 0; i < SNOW_COUNT; i += 1) {
      const yi = i * 3 + 1
      pos[yi] -= speeds[i] * delta
      if (pos[yi] < 0) {
        pos[yi] = 12 + Math.random() * 4
        pos[i * 3] = (Math.random() - 0.5) * 28
        pos[i * 3 + 2] = (Math.random() - 0.5) * 22
      }
    }
    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.1}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function PineTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.2, 8]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>
      {[0, 1, 2].map((layer) => (
        <mesh key={layer} position={[0, 1.4 + layer * 0.85, 0]} castShadow>
          <coneGeometry args={[1.1 - layer * 0.22, 1.3, 8]} />
          <meshStandardMaterial
            color={layer === 2 ? '#3d6b52' : '#2d5a42'}
            roughness={0.75}
          />
        </mesh>
      ))}
      <mesh position={[0, 3.35, 0]} castShadow>
        <coneGeometry args={[0.35, 0.35, 8]} />
        <meshStandardMaterial color="#f0f6fa" roughness={0.4} />
      </mesh>
    </group>
  )
}

function Forest() {
  const trees = useMemo(
    () => [
      { pos: [-7, 0, -4], scale: 1.3 },
      { pos: [-5.5, 0, -6], scale: 1.1 },
      { pos: [-8.5, 0, -2], scale: 1.5 },
      { pos: [7.5, 0, -3.5], scale: 1.4 },
      { pos: [6, 0, -5.5], scale: 1.2 },
      { pos: [9, 0, -1.5], scale: 1.6 },
      { pos: [-3, 0, -7], scale: 0.95 },
      { pos: [4, 0, -7], scale: 1.0 },
      { pos: [-9.5, 0, 0], scale: 1.25 },
      { pos: [9.5, 0, 0.5], scale: 1.35 },
    ],
    [],
  )

  return (
    <group>
      {trees.map((tree, i) => (
        <PineTree key={i} position={tree.pos} scale={tree.scale} />
      ))}
    </group>
  )
}

function Girl() {
  const group = useRef(null)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.y = Math.sin(t * 0.4) * 0.06
    group.current.position.y = Math.sin(t * 1.2) * 0.03
  })

  return (
    <group ref={group} position={[-1.2, 0, 1.2]}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <capsuleGeometry args={[0.32, 0.55, 4, 12]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.78, 0.02]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f5c9a8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c62828" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.92, 0]}>
        <torusGeometry args={[0.2, 0.04, 8, 16]} />
        <meshStandardMaterial color="#ffca28" roughness={0.5} />
      </mesh>
      <mesh position={[-0.38, 0.72, 0]} rotation={[0, 0, 0.9]} castShadow>
        <capsuleGeometry args={[0.06, 0.38, 4, 8]} />
        <meshStandardMaterial color="#f5c9a8" roughness={0.55} />
      </mesh>
      <mesh position={[0.38, 0.72, 0]} rotation={[0, 0, -0.9]} castShadow>
        <capsuleGeometry args={[0.06, 0.38, 4, 8]} />
        <meshStandardMaterial color="#f5c9a8" roughness={0.55} />
      </mesh>
      <mesh position={[-0.48, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.6} />
      </mesh>
      <mesh position={[0.48, 1.02, 0]} castShadow>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.6} />
      </mesh>
      <mesh position={[-0.14, 0.12, 0.04]} castShadow>
        <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
        <meshStandardMaterial color="#4e342e" roughness={0.8} />
      </mesh>
      <mesh position={[0.14, 0.12, 0.04]} castShadow>
        <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
        <meshStandardMaterial color="#4e342e" roughness={0.8} />
      </mesh>
      <Sparkles count={8} scale={[1.2, 0.8, 0.8]} position={[0, 1.05, 0]} size={2} speed={0.3} />
    </group>
  )
}

function Dog() {
  const group = useRef(null)
  const tail = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (tail.current) tail.current.rotation.y = Math.sin(t * 12) * 0.55
    if (group.current) group.current.position.y = Math.abs(Math.sin(t * 8)) * 0.04
  })

  return (
    <group ref={group} position={[1.8, 0, 2.4]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.42, 6, 12]} />
        <meshStandardMaterial color="#a67c52" roughness={0.7} />
      </mesh>
      <mesh position={[0.32, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#c49a6c" roughness={0.65} />
      </mesh>
      <mesh position={[0.44, 0.48, 0]} rotation={[0, 0, 0.3]} castShadow>
        <coneGeometry args={[0.06, 0.14, 6]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>
      <mesh position={[0.44, 0.48, 0.08]} rotation={[0, 0, -0.3]} castShadow>
        <coneGeometry args={[0.06, 0.14, 6]} />
        <meshStandardMaterial color="#8d6e63" roughness={0.7} />
      </mesh>
      <group ref={tail} position={[-0.28, 0.32, 0]}>
        <mesh rotation={[0, 0, 0.8]} castShadow>
          <capsuleGeometry args={[0.04, 0.28, 4, 8]} />
          <meshStandardMaterial color="#8d6e63" roughness={0.75} />
        </mesh>
      </group>
      {[
        [-0.12, 0.06, 0.1],
        [0.08, 0.06, 0.1],
        [-0.12, 0.06, -0.1],
        [0.08, 0.06, -0.1],
      ].map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <capsuleGeometry args={[0.04, 0.1, 4, 8]} />
          <meshStandardMaterial color="#6d4c41" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#e8f2f8" roughness={0.95} />
    </mesh>
  )
}

function ForestPath() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, 0.02, 2.2]} receiveShadow>
      <planeGeometry args={[1.8, 5.5]} />
      <meshStandardMaterial color="#9aabb8" roughness={0.9} />
    </mesh>
  )
}

function CameraRig() {
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const cam = state.camera
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, mouse.current.x * 0.6, 0.04)
    cam.position.y = THREE.MathUtils.lerp(
      cam.position.y,
      3.8 + mouse.current.y * 0.25 + Math.sin(t * 0.15) * 0.08,
      0.04,
    )
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, 9.5, 0.04)
    cam.lookAt(0.3, 0.9, 1.5)
  })

  return null
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#a8c4dc']} />
      <fog attach="fog" args={['#b8cfe0', 6, 22]} />

      <ambientLight intensity={0.65} color="#d4e8ff" />
      <hemisphereLight args={['#c8e0ff', '#6b8f6e', 0.7]} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.1}
        color="#fff8e8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Ground />
      <ForestPath />
      <Forest />
      <Girl />
      <Dog />

      <ContactShadows opacity={0.4} scale={12} blur={2} far={6} color="#4a6080" />

      <SnowParticles />
      <Sparkles count={40} scale={[14, 8, 10]} position={[0, 4, 0]} size={1.2} speed={0.2} />

      <mesh position={[0, 3, -8]}>
        <sphereGeometry args={[6, 12, 12]} />
        <meshStandardMaterial color="#c8d8e8" transparent opacity={0.08} depthWrite={false} />
      </mesh>

      <CameraRig />
    </>
  )
}

function WebGLFallback() {
  return (
    <div className="scene-webgl-fallback">
      <p>当前环境不支持 WebGL，无法显示 3D 场景</p>
    </div>
  )
}

export default function SnowForestScene() {
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const ok = !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
      setWebglOk(ok)
    } catch {
      setWebglOk(false)
    }
  }, [])

  if (!webglOk) return <WebGLFallback />

  return (
    <div className="snow-forest-scene snow-forest-scene--3d" aria-label="3D冬日森林飘雪场景">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 3.8, 9.5], fov: 42, near: 0.1, far: 50 }}
        gl={{ antialias: true, powerPreference: 'default' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#a8c4dc')
        }}
      >
        <Scene />
      </Canvas>
      <p className="scene-caption">3D 冬日林间 · 移动鼠标可微微改变视角</p>
    </div>
  )
}
