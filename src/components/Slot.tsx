import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Clone, useGLTF } from '@react-three/drei'
import type { Vec3 } from '../game/config/level1'
import { towerTypes } from '../game/config/towers'
import { useGameStore } from '../game/store'
import Tower from './Tower'

const PAD_URL = '/models/tower-round-base.glb'
const SELECTION_URL = '/models/selection-a.glb'
const PAD_SIZE = 1.4
const SELECTION_SIZE = 1.8
const RING_WIDTH = 0.08
const BUILD_TYPE = 'basic'

function Slot({ index, position }: { index: number; position: Vec3 }) {
  const tower = useGameStore((state) => state.towers.find((t) => t.slotIndex === index))
  const buildTower = useGameStore((state) => state.buildTower)
  const [hovered, setHovered] = useState(false)
  const pad = useGLTF(PAD_URL)
  const selection = useGLTF(SELECTION_URL)

  // Пустой слот — радиус будущей башни, построенный — радиус своей.
  const type = towerTypes[tower?.typeId ?? BUILD_TYPE]

  function handleOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    setHovered(true)
  }

  function handleOut(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    setHovered(false)
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (tower) return
    buildTower(index, BUILD_TYPE)
    // Площадка под курсором размонтируется без pointerout — иначе кольцо залипнет,
    // если курсор уйдёт, не задев башню. Над башней следующий pointerover вернёт его.
    setHovered(false)
  }

  return (
    <group onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
      {/* У корпуса башни своё основание, площадка видна только у пустого слота. */}
      {tower ? (
        <Tower position={position} type={type} />
      ) : (
        <Clone object={pad.scene} position={position} scale={PAD_SIZE} />
      )}
      {hovered && !tower && <Clone object={selection.scene} position={position} scale={SELECTION_SIZE} />}
      {hovered && (
        <mesh position={[position[0], position[1] + 0.03, position[2]]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[type.range - RING_WIDTH, type.range, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}

export default Slot
