import { Suspense, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Clone, useGLTF } from '@react-three/drei'
import { Vector3, type Group } from 'three'
import type { Vec3 } from '../game/config/level1'
import type { TowerType } from '../game/config/towers'
import { damageEnemy, getEnemies } from '../game/enemies'
import { useGameStore } from '../game/store'
import { pickTarget } from '../game/targeting'

const BODY_URL = '/models/tower-round-build-a.glb'
const WEAPON_URL = '/models/weapon-cannon.glb'
const BALL_URL = '/models/weapon-ammo-cannonball.glb'
const TOWER_SCALE = 1.4
const BODY_HEIGHT = 1 // в единицах пака; пушка стоит на краю корпуса
const SHOT_HEIGHT = 1.9 // дуло пушки над землёй
const BALL_SCALE = 1.4
// Ядро — только визуал: урон наносится в момент выстрела (hitscan, SPEC §2).
const FLIGHT_TIME = 0.25 // секунд полёта ядра
const ARC_HEIGHT = 0.6 // высота дуги над прямой от дула к цели
const TARGET_HEIGHT = 0.3 // центр модели врага над дорогой

useGLTF.preload([BODY_URL, WEAPON_URL, BALL_URL])

function TowerModel({ position }: { position: Vec3 }) {
  const [body, weapon] = useGLTF([BODY_URL, WEAPON_URL])
  return (
    <group position={position} scale={TOWER_SCALE}>
      <Clone object={body.scene} />
      <Clone object={weapon.scene} position-y={BODY_HEIGHT} />
    </group>
  )
}

function Ball() {
  const { scene } = useGLTF(BALL_URL)
  return <Clone object={scene} scale={BALL_SCALE} />
}

function Tower({ position, type }: { position: Vec3; type: TowerType }) {
  const origin = useMemo(() => new Vector3(...position), [position])
  // 0 — только что построенная башня готова стрелять сразу.
  const cooldown = useRef(0)
  const flight = useRef(0)
  const ball = useRef<Group>(null)
  const ballFrom = useMemo(() => new Vector3(position[0], position[1] + SHOT_HEIGHT, position[2]), [position])
  const ballTo = useRef(new Vector3())

  useFrame((_, delta) => {
    if (!ball.current) return

    flight.current = Math.max(flight.current - delta, 0)
    ball.current.visible = flight.current > 0
    if (flight.current > 0) {
      const progress = 1 - flight.current / FLIGHT_TIME
      ball.current.position.lerpVectors(ballFrom, ballTo.current, progress)
      ball.current.position.y += 4 * ARC_HEIGHT * progress * (1 - progress)
    }

    // Вне playing башня не стреляет: после финала деньги не начисляются (SPEC §4).
    // Ядро выше долетает и после финала, чтобы не застыть в воздухе.
    if (useGameStore.getState().status !== 'playing') return

    // Перезарядка отсчитывается всегда, даже без цели.
    cooldown.current = Math.max(cooldown.current - delta, 0)
    if (cooldown.current > 0) return

    const target = pickTarget(origin, type.range, getEnemies(), 'nearest')
    if (!target) return
    ballTo.current.copy(target.position).setY(target.position.y + TARGET_HEIGHT)
    flight.current = FLIGHT_TIME
    damageEnemy(target.id, type.damage)
    cooldown.current = type.cooldown
  })

  return (
    <>
      <Suspense fallback={null}>
        <TowerModel position={position} />
      </Suspense>
      <group ref={ball} visible={false}>
        <Suspense fallback={null}>
          <Ball />
        </Suspense>
      </group>
    </>
  )
}

export default Tower
