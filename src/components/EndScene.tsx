import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, Vector3, type AmbientLight, type DirectionalLight, type PointLight } from 'three'
import { pathCurve } from '../game/curve'
import { useGameStore } from '../game/store'

const AMBIENT_INTENSITY = 0.6
const SUN_INTENSITY = 1.5
const ORBIT_SPEED = 0.2 // рад/с
const FADE_TIME = 1.5 // секунд до полного серо-красного тона
const LOST_COLOR = new Color('#d8a0a0')
const LOST_DIMMING = 0.3 // доля яркости солнца, которую сцена теряет при поражении
const FLASH_COLOR = '#ff6a3d'
const FLASH_INTENSITY = 80
const FLASH_HEIGHT = 2
const FLASH_DECAY_TIME = 0.5 // секунд, за которые вспышка гаснет в e раз
const WHITE = new Color('white')
const UP = new Vector3(0, 1, 0)
// База стоит у конца пути; для источника света такой точности хватает.
const FLASH_POSITION = pathCurve.getPointAt(1).setY(FLASH_HEIGHT)

// Свет сцены и финальные сцены (SPEC §6): облёт камеры при победе,
// уход в серо-красный тон и вспышка на базе при поражении.
// Прыжки башен при победе — в Tower.tsx, рядом с остальными трансформами башни.
function EndScene() {
  const camera = useThree((state) => state.camera)
  const ambient = useRef<AmbientLight>(null)
  const sun = useRef<DirectionalLight>(null)
  const flash = useRef<PointLight>(null)
  const wonTime = useRef(0)
  const lostTime = useRef(0)
  const cameraHome = useRef(new Vector3())

  useFrame((_, delta) => {
    if (!ambient.current || !sun.current || !flash.current) return
    const status = useGameStore.getState().status

    // Победа: камера вращается вокруг центра карты; после рестарта возвращается на место.
    if (status === 'won') {
      if (wonTime.current === 0) cameraHome.current.copy(camera.position)
      wonTime.current += delta
      camera.position.copy(cameraHome.current).applyAxisAngle(UP, wonTime.current * ORBIT_SPEED)
      camera.lookAt(0, 0, 0)
    } else if (wonTime.current > 0) {
      wonTime.current = 0
      camera.position.copy(cameraHome.current)
      camera.lookAt(0, 0, 0)
    }

    // Поражение: свет плавно краснеет и тускнеет, на базе вспыхивает и гаснет огонь.
    // Вспышка не выключается, а держит нулевую яркость: смена числа источников
    // пересобрала бы шейдеры в момент поражения.
    lostTime.current = status === 'lost' ? lostTime.current + delta : 0
    const fade = Math.min(lostTime.current / FADE_TIME, 1)
    ambient.current.color.lerpColors(WHITE, LOST_COLOR, fade)
    sun.current.color.copy(ambient.current.color)
    sun.current.intensity = SUN_INTENSITY * (1 - LOST_DIMMING * fade)
    flash.current.intensity =
      status === 'lost' ? FLASH_INTENSITY * Math.exp(-lostTime.current / FLASH_DECAY_TIME) : 0
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={AMBIENT_INTENSITY} />
      <directionalLight ref={sun} position={[10, 20, 5]} intensity={SUN_INTENSITY} />
      <pointLight
        ref={flash}
        position={FLASH_POSITION}
        color={FLASH_COLOR}
        intensity={0}
      />
    </>
  )
}

export default EndScene
