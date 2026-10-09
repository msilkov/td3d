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
const TURN_RATE = 10 // скорость доводки пушки к цели, 1/с
const HOP_HEIGHT = 0.5
const HOP_TIME = 0.35 // секунд на один прыжок
const HOP_COUNT = 2

useGLTF.preload([BODY_URL, WEAPON_URL, BALL_URL])

function Model({ url, scale }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url)
  return <Clone object={scene} scale={scale} />
}

// Поворачивает пушку к точке по кратчайшей дуге; модель смотрит дулом в +Z.
function turnTowards(weapon: Group, from: Vector3, to: Vector3, delta: number) {
  const angle = Math.atan2(to.x - from.x, to.z - from.z)
  const diff = angle - weapon.rotation.y
  const shortest = Math.atan2(Math.sin(diff), Math.cos(diff))
  weapon.rotation.y += shortest * (1 - Math.exp(-TURN_RATE * delta))
}

function Tower({ position, type }: { position: Vec3; type: TowerType }) {
  const origin = useMemo(() => new Vector3(...position), [position])
  // 0 — только что построенная башня готова стрелять сразу.
  const cooldown = useRef(0)
  const hopTime = useRef(0)
  const model = useRef<Group>(null)
  const weapon = useRef<Group>(null)
  const flight = useRef(0)
  const ball = useRef<Group>(null)
  const ballFrom = useMemo(() => new Vector3(position[0], position[1] + SHOT_HEIGHT, position[2]), [position])
  const ballTo = useRef(new Vector3())

  useFrame((_, delta) => {
    if (!ball.current || !model.current) return

    flight.current = Math.max(flight.current - delta, 0)
    ball.current.visible = flight.current > 0
    if (flight.current > 0) {
      const progress = 1 - flight.current / FLIGHT_TIME
      ball.current.position.lerpVectors(ballFrom, ballTo.current, progress)
      ball.current.position.y += 4 * ARC_HEIGHT * progress * (1 - progress)
    }

    // Победа: башня пару раз подпрыгивает и встаёт на место (SPEC §6).
    const status = useGameStore.getState().status
    hopTime.current = status === 'won' ? hopTime.current + delta : 0
    const hop = Math.min(hopTime.current / HOP_TIME, HOP_COUNT)
    model.current.position.y = position[1] + HOP_HEIGHT * Math.abs(Math.sin(Math.PI * hop))

    // Вне playing башня не стреляет: после финала деньги не начисляются (SPEC §4).
    // Ядро выше долетает и после финала, чтобы не застыть в воздухе.
    if (status !== 'playing') return

    // Пушка следит за целью каждый кадр, а не только в момент выстрела.
    const target = pickTarget(origin, type.range, getEnemies(), 'nearest')
    if (target && weapon.current) turnTowards(weapon.current, origin, target.position, delta)

    // Перезарядка отсчитывается всегда, даже без цели.
    cooldown.current = Math.max(cooldown.current - delta, 0)
    if (cooldown.current > 0 || !target) return
    ballTo.current.copy(target.position).setY(target.position.y + TARGET_HEIGHT)
    flight.current = FLIGHT_TIME
    damageEnemy(target.id, type.damage)
    cooldown.current = type.cooldown
  })

  return (
    <>
      <group ref={model} position={position} scale={TOWER_SCALE}>
        <Suspense fallback={null}>
          <Model url={BODY_URL} />
          <group ref={weapon} position-y={BODY_HEIGHT}>
            <Model url={WEAPON_URL} />
          </group>
        </Suspense>
      </group>
      <group ref={ball} visible={false}>
        <Suspense fallback={null}>
          <Model url={BALL_URL} scale={BALL_SCALE} />
        </Suspense>
      </group>
    </>
  )
}

export default Tower
