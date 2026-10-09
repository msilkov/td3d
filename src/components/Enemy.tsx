import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { pathCurve, pathLength } from '../game/curve'
import { getEnemy, leakEnemy } from '../game/enemies'

const ENEMY_SIZE = 0.8

function Enemy({ id }: { id: number }) {
  const mesh = useRef<Mesh>(null)

  useFrame((_, delta) => {
    const enemy = getEnemy(id)
    if (!enemy || !mesh.current) return

    enemy.t = Math.min(enemy.t + (enemy.speed * delta) / pathLength, 1)
    pathCurve.getPointAt(enemy.t, enemy.position)
    mesh.current.position.set(enemy.position.x, enemy.position.y + ENEMY_SIZE / 2, enemy.position.z)

    if (enemy.t >= 1) leakEnemy(id)
  })

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[ENEMY_SIZE, ENEMY_SIZE, ENEMY_SIZE]} />
      <meshStandardMaterial color="#c0392b" />
    </mesh>
  )
}

export default Enemy
