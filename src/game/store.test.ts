import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './store'

beforeEach(() => {
  useGameStore.getState().reset()
})

describe('стор', () => {
  it('startGame переводит idle в playing', () => {
    useGameStore.getState().startGame()
    expect(useGameStore.getState().status).toBe('playing')
  })

  it.each(['playing', 'won', 'lost'] as const)('startGame из %s ничего не меняет', (status) => {
    useGameStore.setState({ status })
    useGameStore.getState().startGame()
    expect(useGameStore.getState().status).toBe(status)
  })
})
