import { useGameStore } from '../game/store'
import { useWaves } from '../game/useWaves'
import Enemy from './Enemy'

function Enemies() {
  const enemyIds = useGameStore((state) => state.enemyIds)
  useWaves()

  return enemyIds.map((id) => <Enemy key={id} id={id} />)
}

export default Enemies
