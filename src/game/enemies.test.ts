import { beforeEach, describe, expect, it } from 'vitest'
import { level1 } from './config/level1'
import { clearEnemies, leakEnemy, spawnEnemy } from './enemies'
import { useGameStore } from './store'

const wave = level1.waves[0]

beforeEach(() => {
  clearEnemies()
  useGameStore.getState().reset()
})

describe('реестр врагов', () => {
  it('spawnEnemy добавляет id в стор', () => {
    const id = spawnEnemy(wave)
    expect(useGameStore.getState().enemyIds).toEqual([id])
  })

  it('утечка убирает врага и уменьшает жизни на 1', () => {
    const id = spawnEnemy(wave)
    leakEnemy(id)
    const { lives, enemyIds, status } = useGameStore.getState()
    expect(lives).toBe(level1.startLives - 1)
    expect(enemyIds).toEqual([])
    expect(status).toBe('idle')
  })

  it('повторная утечка того же врага — no-op', () => {
    const id = spawnEnemy(wave)
    leakEnemy(id)
    leakEnemy(id)
    expect(useGameStore.getState().lives).toBe(level1.startLives - 1)
  })

  it('утечка последней жизни даёт lost', () => {
    useGameStore.setState({ lives: 2 })
    leakEnemy(spawnEnemy(wave))
    expect(useGameStore.getState().status).not.toBe('lost')
    leakEnemy(spawnEnemy(wave))
    expect(useGameStore.getState().status).toBe('lost')
  })

  it('последний враг утёк с последней жизнью — поражение, а не победа', () => {
    useGameStore.setState({ lives: 1, status: 'playing' })
    leakEnemy(spawnEnemy(wave))
    const { lives, enemyIds, status } = useGameStore.getState()
    expect(enemyIds).toEqual([])
    expect(lives).toBe(0)
    expect(status).toBe('lost')
  })

  it('clearEnemies очищает список id', () => {
    spawnEnemy(wave)
    spawnEnemy(wave)
    clearEnemies()
    expect(useGameStore.getState().enemyIds).toEqual([])
  })
})
