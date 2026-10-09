import { level1 } from '../game/config/level1'
import { useGameStore } from '../game/store'

function HUD() {
  const status = useGameStore((state) => state.status)
  const startGame = useGameStore((state) => state.startGame)
  const money = useGameStore((state) => state.money)
  const lives = useGameStore((state) => state.lives)
  const waveIndex = useGameStore((state) => state.waveIndex)

  return (
    <div className="hud">
      <div>Деньги: {money}</div>
      <div>Жизни: {lives}</div>
      <div>
        Волна: {waveIndex + 1}/{level1.waves.length}
      </div>
      {status === 'idle' && (
        <button type="button" onClick={startGame}>
          Старт
        </button>
      )}
    </div>
  )
}

export default HUD
