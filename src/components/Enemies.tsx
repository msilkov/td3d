import { useEffect } from 'react'
import { level1 } from '../game/config/level1'
import { clearEnemies, spawnEnemy } from '../game/enemies'
import { useGameStore } from '../game/store'
import Enemy from './Enemy'

function Enemies() {
  const enemyIds = useGameStore((state) => state.enemyIds)

  // Временно, до волн (7.3): один враг при монтировании.
  useEffect(() => {
    spawnEnemy(level1.waves[0])
    return clearEnemies
  }, [])

  return enemyIds.map((id) => <Enemy key={id} id={id} />)
}

export default Enemies
