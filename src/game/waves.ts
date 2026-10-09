import type { LevelConfig } from './config/level1'

// spawning → clearing (ждём, пока живых не станет 0) → pause → spawning следующей волны … → done
export type WavePhase = 'spawning' | 'clearing' | 'pause' | 'done'

export type WaveState = {
  phase: WavePhase
  waveIndex: number
  spawned: number // врагов текущей волны уже заспавнено
  timer: number   // spawning — секунд до следующего спавна, pause — до старта следующей волны
}

export type WaveTick = {
  state: WaveState
  spawn: number // сколько врагов текущей волны заспавнить в этом тике
}

// timer 0 — первый враг появляется на первом же тике после «Старт».
export const initialWaveState: WaveState = { phase: 'spawning', waveIndex: 0, spawned: 0, timer: 0 }

export function tickWaves(state: WaveState, delta: number, level: LevelConfig, alive: number): WaveTick {
  switch (state.phase) {
    case 'spawning':
      return spawnDue(state.waveIndex, state.spawned, state.timer - delta, level)
    case 'clearing':
      if (alive > 0) return { state, spawn: 0 }
      if (state.waveIndex === level.waves.length - 1) return { state: { ...state, phase: 'done' }, spawn: 0 }
      return { state: { ...state, phase: 'pause', timer: level.wavePause }, spawn: 0 }
    case 'pause': {
      const timer = state.timer - delta
      if (timer > 0) return { state: { ...state, timer }, spawn: 0 }
      return spawnDue(state.waveIndex + 1, 0, timer, level)
    }
    case 'done':
      return { state, spawn: 0 }
  }
}

// Спавнит всех, чей срок подошёл: при большом delta — несколько врагов за тик.
function spawnDue(waveIndex: number, spawned: number, timer: number, level: LevelConfig): WaveTick {
  const { count, interval } = level.waves[waveIndex]
  let spawn = 0
  while (spawned < count && timer <= 0) {
    spawned++
    spawn++
    timer += interval
  }
  const phase = spawned === count ? 'clearing' : 'spawning'
  return { state: { phase, waveIndex, spawned, timer }, spawn }
}
