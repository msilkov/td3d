import { Suspense, useMemo, useRef, type ComponentRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Clone, Line, useGLTF } from '@react-three/drei'
import { Vector3 } from 'three'
import type { Vec3 } from '../game/config/level1'
import type { TowerType } from '../game/config/towers'
import { damageEnemy, getEnemies } from '../game/enemies'
import { useGameStore } from '../game/store'
import { pickTarget } from '../game/targeting'

const BODY_URL = '/models/tower-round-build-a.glb'
const WEAPON_URL = '/models/weapon-cannon.glb'
const TOWER_SCALE = 1.4
const BODY_HEIGHT = 1 // в единицах пака; пушка стоит на краю корпуса
const SHOT_HEIGHT = 1.9 // дуло пушки над землёй
const SHOT_DURATION = 0.1 // секунд, сколько видна линия выстрела
const TARGET_HEIGHT = 0.3 // центр модели врага над дорогой

useGLTF.preload([BODY_URL, WEAPON_URL])

function TowerModel({ position }: { position: Vec3 }) {
  const [body, weapon] = useGLTF([BODY_URL, WEAPON_URL])
  return (
    <group position={position} scale={TOWER_SCALE}>
      <Clone object={body.scene} />
      <Clone object={weapon.scene} position-y={BODY_HEIGHT} />
    </group>
  )
}

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
    line.geometry.setPositions([origin.x, origin.y + SHOT_HEIGHT, origin.z, x, y + TARGET_HEIGHT, z])
    line.visible = true
    shotTimer.current = SHOT_DURATION
    damageEnemy(target.id, type.damage)
    cooldown.current = type.cooldown
  })

  return (
    <>
      <Suspense fallback={null}>
        <TowerModel position={position} />
      </Suspense>
      <Line ref={shotLine} points={[origin, origin]} color="#ffd54a" lineWidth={3} />
    </>
  )
}

export default Tower
