import { create } from 'zustand'
import { level1 } from './config/level1'
import { towerTypes, type TowerTypeId } from './config/towers'

export type PlacedTower = { slotIndex: number; typeId: TowerTypeId }

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

type GameStore = {
  money: number
  lives: number
  waveIndex: number
  status: GameStatus
  enemyIds: number[]
  towers: PlacedTower[]

  startGame(): void // idle → playing
  buildTower(slotIndex: number, typeId: TowerTypeId): void // только idle/playing, хватает денег, слот свободен
  reset(): void // значения из LevelConfig, статус idle
}

function initialState() {
  return {
    money: level1.startMoney,
    lives: level1.startLives,
    waveIndex: 0,
    status: 'idle' as GameStatus,
    enemyIds: [],
    towers: [],
  }
}

export const useGameStore = create<GameStore>()((set) => ({
  ...initialState(),
  startGame: () => set((s) => (s.status === 'idle' ? { status: 'playing' } : {})),
  buildTower: (slotIndex, typeId) =>
    set((s) => {
      const { cost } = towerTypes[typeId]
      const canBuild =
        (s.status === 'idle' || s.status === 'playing') &&
        s.money >= cost &&
        !s.towers.some((tower) => tower.slotIndex === slotIndex)
      if (!canBuild) return {}
      return { money: s.money - cost, towers: [...s.towers, { slotIndex, typeId }] }
    }),
  reset: () => set(initialState()),
}))
