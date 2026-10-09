import { useGameStore } from '../game/store'

// Деньги и «Старт»; жизни и волна — на 7.6.
function HUD() {
  const status = useGameStore((state) => state.status)
  const startGame = useGameStore((state) => state.startGame)
  const money = useGameStore((state) => state.money)

  return (
    <div className="hud">
      <div>Деньги: {money}</div>
      {status === 'idle' && (
        <button type="button" onClick={startGame}>
          Старт
        </button>
      )}
    </div>
  )
}

export default HUD
