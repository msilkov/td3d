import { Suspense, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Clone, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { pathCurve, pathLength } from '../game/curve'
import { getEnemy, leakEnemy } from '../game/enemies'
import { useGameStore } from '../game/store'

const MODEL_URL = '/models/enemy-ufo-a.glb'
const ENEMY_SCALE = 0.8

useGLTF.preload(MODEL_URL)

function EnemyModel() {
  const { scene } = useGLTF(MODEL_URL)
  return <Clone object={scene} scale={ENEMY_SCALE} />
}

function Enemy({ id }: { id: number }) {
  const group = useRef<Group>(null)

  useFrame((_, delta) => {
    // После победы или поражения сцена замирает (SPEC §4).
    if (useGameStore.getState().status !== 'playing') return
    const enemy = getEnemy(id)
    if (!enemy || !group.current) return

    enemy.t = Math.min(enemy.t + (enemy.speed * delta) / pathLength, 1)
    pathCurve.getPointAt(enemy.t, enemy.position)
    group.current.position.copy(enemy.position)

    if (enemy.t >= 1) leakEnemy(id)
  })

  return (
    // Suspense внутри: движение идёт, даже если модель ещё грузится.
    <group ref={group}>
      <Suspense fallback={null}>
        <EnemyModel />
      </Suspense>
    </group>
  )
}

export default Enemy
