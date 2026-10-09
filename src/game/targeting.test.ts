import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import type { EnemyState } from './enemies'
import { pickTarget } from './targeting'

const tower = new Vector3(0, 0, 0)

function enemyAt(id: number, x: number, z: number): EnemyState {
  return { id, t: 0, position: new Vector3(x, 0, z), hp: 10, speed: 1, reward: 5 }
}

describe('pickTarget nearest', () => {
  it('выбирает ближайшего врага в радиусе', () => {
    const enemies = [enemyAt(1, 3, 0), enemyAt(2, 0, -1), enemyAt(3, -2, 2)]
    expect(pickTarget(tower, 5, enemies, 'nearest')?.id).toBe(2)
  })

  it('враг ровно на границе радиуса — цель', () => {
    // 3-4-5: расстояние ровно 5 без погрешности float
    expect(pickTarget(tower, 5, [enemyAt(1, 3, 4)], 'nearest')?.id).toBe(1)
  })

  it('никого в радиусе — нет цели', () => {
    expect(pickTarget(tower, 5, [enemyAt(1, 6, 0), enemyAt(2, 4, 4)], 'nearest')).toBeUndefined()
  })

  it('нет врагов — нет цели', () => {
    expect(pickTarget(tower, 5, [], 'nearest')).toBeUndefined()
  })
})
