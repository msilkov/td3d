import { beforeEach, describe, expect, it } from 'vitest'
import { level1 } from './config/level1'
import { towerTypes } from './config/towers'
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

  it.each(['idle', 'playing'] as const)('buildTower в %s строит и списывает стоимость', (status) => {
    useGameStore.setState({ status })
    useGameStore.getState().buildTower(0, 'basic')
    const { money, towers } = useGameStore.getState()
    expect(towers).toEqual([{ slotIndex: 0, typeId: 'basic' }])
    expect(money).toBe(level1.startMoney - towerTypes.basic.cost)
  })

  it('buildTower отказывает при нехватке денег', () => {
    useGameStore.setState({ money: towerTypes.basic.cost - 1 })
    useGameStore.getState().buildTower(0, 'basic')
    const { money, towers } = useGameStore.getState()
    expect(towers).toEqual([])
    expect(money).toBe(towerTypes.basic.cost - 1)
  })

  it('buildTower строит при деньгах ровно на стоимость', () => {
    useGameStore.setState({ money: towerTypes.basic.cost })
    useGameStore.getState().buildTower(0, 'basic')
    expect(useGameStore.getState().money).toBe(0)
  })

  it('buildTower отказывает в занятый слот', () => {
    useGameStore.getState().buildTower(0, 'basic')
    useGameStore.getState().buildTower(0, 'basic')
    const { money, towers } = useGameStore.getState()
    expect(towers).toHaveLength(1)
    expect(money).toBe(level1.startMoney - towerTypes.basic.cost)
  })

  it.each(['won', 'lost'] as const)('buildTower в %s ничего не строит', (status) => {
    useGameStore.setState({ status })
    useGameStore.getState().buildTower(0, 'basic')
    const { money, towers } = useGameStore.getState()
    expect(towers).toEqual([])
    expect(money).toBe(level1.startMoney)
  })

  it('reset убирает башни и возвращает деньги уровня', () => {
    useGameStore.getState().buildTower(0, 'basic')
    useGameStore.getState().reset()
    const { money, towers } = useGameStore.getState()
    expect(towers).toEqual([])
    expect(money).toBe(level1.startMoney)
  })
})
