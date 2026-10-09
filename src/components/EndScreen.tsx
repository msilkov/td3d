import { clearEnemies } from '../game/enemies'
import { useGameStore } from '../game/store'

function EndScreen() {
  const status = useGameStore((state) => state.status)
  const reset = useGameStore((state) => state.reset)

  if (status !== 'won' && status !== 'lost') return null

  // Таймеры волн останавливаются сами: они тикают только в playing.
  function restart() {
    clearEnemies()
    reset()
  }

  return (
    <div className="end-screen">
      <h1>{status === 'won' ? 'Победа' : 'Поражение'}</h1>
      <button type="button" onClick={restart}>
        Заново
      </button>
    </div>
  )
}

export default EndScreen
