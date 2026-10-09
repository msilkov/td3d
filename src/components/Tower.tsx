import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Vec3 } from '../game/config/level1'
import type { TowerType } from '../game/config/towers'
import { damageEnemy, getEnemies } from '../game/enemies'
import { pickTarget } from '../game/targeting'

const TOWER_HEIGHT = 1.5

function Tower({ position, type }: { position: Vec3; type: TowerType }) {
  const origin = useMemo(() => new Vector3(...position), [position])
  // 0 — только что построенная башня готова стрелять сразу.
  const cooldown = useRef(0)

  useFrame((_, delta) => {
    // Перезарядка отсчитывается всегда, даже без цели.
    cooldown.current = Math.max(cooldown.current - delta, 0)
    if (cooldown.current > 0) return

    const target = pickTarget(origin, type.range, getEnemies(), 'nearest')
    if (!target) return
    damageEnemy(target.id, type.damage)
    cooldown.current = type.cooldown
  })

  return (
    <mesh position={[position[0], position[1] + TOWER_HEIGHT / 2, position[2]]}>
      <cylinderGeometry args={[0.5, 0.6, TOWER_HEIGHT, 16]} />
      <meshStandardMaterial color="#2c6fbb" />
    </mesh>
  )
}

export default Tower
