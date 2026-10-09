import { useGameStore } from '../game/store'

// Пока только «Старт»; деньги, жизни и волна — на 7.6.
function HUD() {
  const status = useGameStore((state) => state.status)
  const startGame = useGameStore((state) => state.startGame)

  return (
    <div className="hud">
      {status === 'idle' && (
        <button type="button" onClick={startGame}>
          Старт
        </button>
      )}
    </div>
  )
}

export default HUD
