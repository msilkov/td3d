import { useMemo } from 'react'
import { Clone, useGLTF } from '@react-three/drei'
import { level1, type Vec3 } from '../game/config/level1'
import { pathCurve } from '../game/curve'

const SPAWN_URL = '/models/spawn-round.glb'
const BASE_URL = '/models/tower-round-build-d.glb'
// Деревья повторены, чтобы при случайном выборе их было больше, чем камней и кристаллов.
const DETAIL_URLS = [
  '/models/detail-tree.glb',
  '/models/detail-tree.glb',
  '/models/detail-tree-large.glb',
  '/models/detail-tree-large.glb',
  '/models/detail-rocks.glb',
  '/models/detail-rocks-large.glb',
  '/models/detail-crystal.glb',
]

const SPAWN_SCALE = 2.2
const BASE_SCALE = 1.8
const EDGE_INSET = 1 // база и портал стоят на дороге чуть внутри поля, чтобы не обрезаться кадром

const DETAIL_COUNT = 45
const DETAIL_ATTEMPTS = 2000
const DETAIL_MIN_SCALE = 1.6
const DETAIL_MAX_SCALE = 2.4
const ROAD_CLEARANCE = 1.6
const SLOT_CLEARANCE = 1.8
const DETAIL_SPACING = 1.2
const EDGE_MARGIN = 0.5
const SEED = 7

type Detail = { model: number; position: Vec3; rotation: number; scale: number }

// Детерминированный ГПСЧ (mulberry32): карта одинаковая при каждом запуске.
function random(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Точка пути t, сдвинутая вдоль касательной на offset.
function pathPoint(t: number, offset: number): Vec3 {
  const { x, z } = pathCurve.getPointAt(t)
  const tangent = pathCurve.getTangentAt(t)
  return [x + tangent.x * offset, 0, z + tangent.z * offset]
}

const SPAWN_POSITION = pathPoint(0, EDGE_INSET)
const BASE_POSITION = pathPoint(1, -EDGE_INSET)

// Декор раскидывается случайно, но не на дорогу, не на слоты и не друг в друга.
function scatterDetails(width: number, depth: number): Detail[] {
  const rand = random(SEED)
  const road = pathCurve.getSpacedPoints(200)
  const details: Detail[] = []
  const far = (x: number, z: number, points: { x: number; z: number }[], min: number) =>
    points.every((p) => Math.hypot(p.x - x, p.z - z) >= min)
  const slots = level1.slots.map(([x, , z]) => ({ x, z }))

  for (let i = 0; i < DETAIL_ATTEMPTS && details.length < DETAIL_COUNT; i++) {
    const x = (rand() - 0.5) * (width - 2 * EDGE_MARGIN)
    const z = (rand() - 0.5) * (depth - 2 * EDGE_MARGIN)
    const placed = details.map(({ position: [px, , pz] }) => ({ x: px, z: pz }))
    if (!far(x, z, road, ROAD_CLEARANCE) || !far(x, z, slots, SLOT_CLEARANCE) || !far(x, z, placed, DETAIL_SPACING)) {
      continue
    }
    details.push({
      model: Math.floor(rand() * DETAIL_URLS.length),
      position: [x, 0, z],
      rotation: rand() * Math.PI * 2,
      scale: DETAIL_MIN_SCALE + rand() * (DETAIL_MAX_SCALE - DETAIL_MIN_SCALE),
    })
  }
  return details
}

function Scenery({ width, depth }: { width: number; depth: number }) {
  const spawn = useGLTF(SPAWN_URL)
  const base = useGLTF(BASE_URL)
  const detailModels = useGLTF(DETAIL_URLS)
  const details = useMemo(() => scatterDetails(width, depth), [width, depth])

  return (
    <>
      <Clone object={spawn.scene} position={SPAWN_POSITION} scale={SPAWN_SCALE} />
      <Clone object={base.scene} position={BASE_POSITION} scale={BASE_SCALE} />
      {details.map((detail, i) => (
        <Clone
          key={i}
          object={detailModels[detail.model].scene}
          position={detail.position}
          rotation-y={detail.rotation}
          scale={detail.scale}
        />
      ))}
    </>
  )
}

export default Scenery
