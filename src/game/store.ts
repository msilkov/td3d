import { create } from 'zustand'
import { level1 } from './config/level1'

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

type GameStore = {
  money: number
  lives: number
  waveIndex: number
  status: GameStatus
  enemyIds: number[]

  startGame(): void // idle → playing
  reset(): void // значения из LevelConfig, статус idle
}

function initialState() {
  return {
    money: level1.startMoney,
    lives: level1.startLives,
    waveIndex: 0,
    status: 'idle' as GameStatus,
    enemyIds: [],
  }
}

export const useGameStore = create<GameStore>()((set) => ({
  ...initialState(),
  startGame: () => set((s) => (s.status === 'idle' ? { status: 'playing' } : {})),
  reset: () => set(initialState()),
}))
