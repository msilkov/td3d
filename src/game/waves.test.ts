import { describe, expect, it } from 'vitest'
import type { LevelConfig, WaveConfig } from './config/level1'
import { initialWaveState, tickWaves, type WaveState } from './waves'

const wave = (count: number, interval: number): WaveConfig => ({
  count,
  interval,
  enemyHp: 10,
  enemySpeed: 3,
  reward: 5,
})

const level: LevelConfig = {
  path: [],
  slots: [],
  waves: [wave(3, 1), wave(2, 0.5)],
  wavePause: 5,
  startMoney: 100,
  startLives: 20,
}

// Прогоняет тики подряд и возвращает итоговое состояние и сколько врагов заспавнено за каждый.
function run(state: WaveState, deltas: number[], alive = 0) {
  const spawns: number[] = []
  for (const delta of deltas) {
    const tick = tickWaves(state, delta, level, alive)
    state = tick.state
    spawns.push(tick.spawn)
  }
  return { state, spawns }
}

// Первая волна заспавнена целиком, её враги ещё живы.
const firstWaveSpawned = run(initialWaveState, [0, 1, 1], 3).state

describe('tickWaves', () => {
  it('первый враг — сразу, остальные через interval', () => {
    const { spawns } = run(initialWaveState, [0, 0.5, 0.5, 0.75, 0.25], 1)
    expect(spawns).toEqual([1, 0, 1, 0, 1])
  })

  it('большой delta спавнит несколько врагов за тик, но не больше count', () => {
    const { state, spawns } = run(initialWaveState, [10], 0)
    expect(spawns).toEqual([3])
    expect(state.waveIndex).toBe(0)
  })

  it('пока враги волны живы, следующая волна не начинается', () => {
    const { state, spawns } = run(firstWaveSpawned, [100, 100], 1)
    expect(spawns).toEqual([0, 0])
    expect(state.waveIndex).toBe(0)
  })

  it('после зачистки — пауза wavePause, затем первый враг следующей волны', () => {
    const cleared = run(firstWaveSpawned, [0.1], 0).state
    const { state, spawns } = run(cleared, [4.5, 0.5], 0)
    expect(spawns).toEqual([0, 1])
    expect(state.waveIndex).toBe(1)
  })

  it('пауза отсчитывается от зачистки, а не от последнего спавна', () => {
    // Враги живут 20 с после последнего спавна — это больше wavePause.
    const waited = run(firstWaveSpawned, [20], 1).state
    const { spawns } = run(waited, [0, 4.5], 0)
    expect(spawns).toEqual([0, 0])
  })

  it('победа — после зачистки последней волны', () => {
    const lastWave = run(firstWaveSpawned, [0, 5, 0.5], 0).state
    expect(lastWave).toMatchObject({ waveIndex: 1, phase: 'clearing' })

    expect(run(lastWave, [1], 1).state.phase).toBe('clearing')
    expect(run(lastWave, [0], 0).state.phase).toBe('done')
  })
})
