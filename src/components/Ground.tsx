import { BufferGeometry, Float32BufferAttribute } from 'three'
import { pathCurve } from '../game/curve'

type GroundProps = {
  width: number
  depth: number
}

const BACKDROP_SIZE = 200
const ROAD_WIDTH = 1.6
const ROAD_SEGMENTS = 200

// Цвета травы и земли взяты из палитры Kenney, чтобы поле не спорило с моделями.
const GRASS_COLOR = '#61cb8b'
const BACKDROP_COLOR = '#4a9e6b'
const ROAD_COLOR = '#f1976c'

// Лента вдоль кривой пути: по паре вершин на каждую точку, по перпендикуляру к касательной в XZ.
function buildRoad() {
  const positions: number[] = []
  const indices: number[] = []
  pathCurve.getSpacedPoints(ROAD_SEGMENTS).forEach((point, i) => {
    const tangent = pathCurve.getTangentAt(i / ROAD_SEGMENTS)
    const length = Math.hypot(tangent.x, tangent.z)
    const nx = (-tangent.z / length) * (ROAD_WIDTH / 2)
    const nz = (tangent.x / length) * (ROAD_WIDTH / 2)
    positions.push(point.x + nx, 0, point.z + nz, point.x - nx, 0, point.z - nz)
    if (i > 0) {
      const a = 2 * (i - 1)
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

const ROAD_GEOMETRY = buildRoad()

function Ground({ width, depth }: GroundProps) {
  return (
    <>
      <mesh geometry={ROAD_GEOMETRY} position-y={0.01}>
        <meshStandardMaterial color={ROAD_COLOR} />
      </mesh>
      <group rotation-x={-Math.PI / 2}>
        <mesh>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color={GRASS_COLOR} />
        </mesh>
        <mesh position-z={-0.01}>
          <planeGeometry args={[BACKDROP_SIZE, BACKDROP_SIZE]} />
          <meshStandardMaterial color={BACKDROP_COLOR} />
        </mesh>
      </group>
    </>
  )
}

export default Ground
