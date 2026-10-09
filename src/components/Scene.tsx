import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import type { Vec3 } from '../game/config/level1'
import { towerTypes } from '../game/config/towers'
import Enemies from './Enemies'
import Ground from './Ground'
import Tower from './Tower'

const MAP_WIDTH = 32
const MAP_DEPTH = 18
const FIT_MARGIN = 0.95
const CAMERA_TILT = (55 * Math.PI) / 180
const CAMERA_DISTANCE = 60
// Временно до слотов (7.5): радиусы перекрываются у изгиба (-6, 0, 3), чтобы две башни били одну цель.
const HARDCODED_TOWERS: Vec3[] = [
  [-4, 0, 1],
  [-5, 0, 6],
]

// Камера смотрит вдоль -Z с наклоном CAMERA_TILT от горизонта.
// Поле W×D в кадре занимает W по ширине и D·sin(tilt) по высоте.
function MapCamera({ width, depth }: { width: number; depth: number }) {
  const viewport = useThree((state) => state.size)
  const zoom =
    Math.min(viewport.width / width, viewport.height / (depth * Math.sin(CAMERA_TILT))) * FIT_MARGIN

  return (
    <OrthographicCamera
      makeDefault
      position={[0, CAMERA_DISTANCE * Math.sin(CAMERA_TILT), CAMERA_DISTANCE * Math.cos(CAMERA_TILT)]}
      zoom={zoom}
      near={0.1}
      far={300}
      onUpdate={(camera) => camera.lookAt(0, 0, 0)}
    />
  )
}

function Scene() {
  return (
    <Canvas>
      <MapCamera width={MAP_WIDTH} depth={MAP_DEPTH} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} />
      <Ground width={MAP_WIDTH} depth={MAP_DEPTH} />
      <Enemies />
      {HARDCODED_TOWERS.map((position, i) => (
        <Tower key={i} position={position} type={towerTypes.basic} />
      ))}
    </Canvas>
  )
}

export default Scene
