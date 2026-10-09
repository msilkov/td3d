import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { Vec3 } from '../game/config/level1'
import { towerTypes } from '../game/config/towers'
import { useGameStore } from '../game/store'
import Tower from './Tower'

const PAD_SIZE = 1.4
const PAD_HEIGHT = 0.1
const RING_WIDTH = 0.08
const BUILD_TYPE = 'basic'

function Slot({ index, position }: { index: number; position: Vec3 }) {
  const tower = useGameStore((state) => state.towers.find((t) => t.slotIndex === index))
  const buildTower = useGameStore((state) => state.buildTower)
  const [hovered, setHovered] = useState(false)

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
    if (!tower) buildTower(index, BUILD_TYPE)
  }

  return (
    <group onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
      <mesh position={[position[0], position[1] + PAD_HEIGHT / 2, position[2]]}>
        <boxGeometry args={[PAD_SIZE, PAD_HEIGHT, PAD_SIZE]} />
        <meshStandardMaterial color={hovered && !tower ? '#a8a8a8' : '#8a8a8a'} />
      </mesh>
      {tower && <Tower position={position} type={type} />}
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
