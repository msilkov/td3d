import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Clone, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { pathCurve, pathLength } from '../game/curve'
import { getEnemy, leakEnemy } from '../game/enemies'
import { useGameStore } from '../game/store'

const MODEL_URL = '/models/enemy-ufo-a.glb'
const ENEMY_SCALE = 0.8
const BOB_HEIGHT = 0.12
const BOB_SPEED = 6 // рад/с
const TILT = 0.12 // рад
const GOLDEN_ANGLE = 2.39996 // соседние id получают далёкие фазы

useGLTF.preload(MODEL_URL)

function EnemyModel() {
  const { scene } = useGLTF(MODEL_URL)
  return <Clone object={scene} scale={ENEMY_SCALE} />
}

function Enemy({ id }: { id: number }) {
  const group = useRef<Group>(null)
  const body = useRef<Group>(null)
  const time = useRef(id * GOLDEN_ANGLE)

  useFrame((_, delta) => {
    // После победы или поражения сцена замирает (SPEC §4).
    if (useGameStore.getState().status !== 'playing') return
    const enemy = getEnemy(id)
    if (!enemy || !group.current || !body.current) return

    enemy.t = Math.min(enemy.t + (enemy.speed * delta) / pathLength, 1)
    pathCurve.getPointAt(enemy.t, enemy.position)
    group.current.position.copy(enemy.position)

    // Покачивание по Y и лёгкий наклон с фазой от id (SPEC §6).
    time.current += delta * BOB_SPEED
    body.current.position.y = BOB_HEIGHT * Math.sin(time.current)
    body.current.rotation.z = TILT * Math.sin(time.current / 2)

    if (enemy.t >= 1) leakEnemy(id)
  })

  return (
    // Suspense внутри: движение идёт, даже если модель ещё грузится.
    <group ref={group}>
      <group ref={body}>
        <Suspense fallback={null}>
          <EnemyModel />
        </Suspense>
      </group>
    </group>
  )
}

export default Enemy
