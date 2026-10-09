import { useMemo, useRef, type ComponentRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Vector3 } from 'three'
import type { Vec3 } from '../game/config/level1'
import type { TowerType } from '../game/config/towers'
import { damageEnemy, getEnemies } from '../game/enemies'
import { useGameStore } from '../game/store'
import { pickTarget } from '../game/targeting'

const TOWER_HEIGHT = 1.5
const SHOT_DURATION = 0.1 // секунд, сколько видна линия выстрела
const TARGET_HEIGHT = 0.4 // центр куба врага над дорогой

function Tower({ position, type }: { position: Vec3; type: TowerType }) {
  const origin = useMemo(() => new Vector3(...position), [position])
  // 0 — только что построенная башня готова стрелять сразу.
  const cooldown = useRef(0)
  const shotTimer = useRef(0)
  const shotLine = useRef<ComponentRef<typeof Line>>(null)

  useFrame((_, delta) => {
    const line = shotLine.current
    if (!line) return

    shotTimer.current = Math.max(shotTimer.current - delta, 0)
    line.visible = shotTimer.current > 0

    // Вне playing башня не стреляет: после финала деньги не начисляются (SPEC §4).
    // Линия выше гаснет и после финала, чтобы не застыть на экране.
    if (useGameStore.getState().status !== 'playing') return

    // Перезарядка отсчитывается всегда, даже без цели.
    cooldown.current = Math.max(cooldown.current - delta, 0)
    if (cooldown.current > 0) return

    const target = pickTarget(origin, type.range, getEnemies(), 'nearest')
    if (!target) return
    const { x, y, z } = target.position
    line.geometry.setPositions([origin.x, origin.y + TOWER_HEIGHT, origin.z, x, y + TARGET_HEIGHT, z])
    line.visible = true
    shotTimer.current = SHOT_DURATION
    damageEnemy(target.id, type.damage)
    cooldown.current = type.cooldown
  })

  return (
    <>
      <mesh position={[position[0], position[1] + TOWER_HEIGHT / 2, position[2]]}>
        <cylinderGeometry args={[0.5, 0.6, TOWER_HEIGHT, 16]} />
        <meshStandardMaterial color="#2c6fbb" />
      </mesh>
      <Line ref={shotLine} points={[origin, origin]} color="#ffd54a" lineWidth={3} />
    </>
  )
}

export default Tower
