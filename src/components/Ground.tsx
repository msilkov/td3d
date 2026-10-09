import { Line } from '@react-three/drei'
import { pathCurve } from '../game/curve'

const ROAD_POINTS = pathCurve.getSpacedPoints(100)

type GroundProps = {
  width: number
  depth: number
}

const BACKDROP_SIZE = 200

function Ground({ width, depth }: GroundProps) {
  return (
    <>
      <Line points={ROAD_POINTS} position-y={0.02} color="#b8a07a" lineWidth={6} />
      <group rotation-x={-Math.PI / 2}>
        <mesh>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color="#6a9a4f" />
        </mesh>
        <mesh position-z={-0.01}>
          <planeGeometry args={[BACKDROP_SIZE, BACKDROP_SIZE]} />
          <meshStandardMaterial color="#3f5e33" />
        </mesh>
      </group>
    </>
  )
}

export default Ground
