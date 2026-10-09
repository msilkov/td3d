import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { level1 } from './config/level1'
import { spawnEnemy } from './enemies'
import { useGameStore } from './store'
import { initialWaveState, tickWaves } from './waves'

export function useWaves() {
  const waves = useRef(initialWaveState)

  useFrame((_, delta) => {
    const { status, enemyIds, waveIndex } = useGameStore.getState()
    // Таймеры волн тикают только в playing; idle — партия ещё не начата или перезапущена.
    if (status === 'idle') waves.current = initialWaveState
    if (status !== 'playing') return

    const { state, spawn } = tickWaves(waves.current, delta, level1, enemyIds.length)
    waves.current = state
    for (let i = 0; i < spawn; i++) spawnEnemy(level1.waves[state.waveIndex])
    if (state.waveIndex !== waveIndex) useGameStore.setState({ waveIndex: state.waveIndex })
    if (state.phase === 'done') useGameStore.setState({ status: 'won' })
  })
}
