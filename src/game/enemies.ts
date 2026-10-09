import type { Vector3 } from 'three'
import type { WaveConfig } from './config/level1'
import { pathCurve } from './curve'
import { useGameStore } from './store'

export type EnemyState = {
  id: number
  t: number          // прогресс 0..1
  position: Vector3  // пишется в useFrame врага, читается башнями
  hp: number
  speed: number
  reward: number
}

// Покадровое состояние врагов (ADR 0002). Map и store.enemyIds меняются только здесь, вместе.
const enemies = new Map<number, EnemyState>()
let nextId = 1

export function getEnemy(id: number): EnemyState | undefined {
  return enemies.get(id)
}

export function getEnemies(): Iterable<EnemyState> {
  return enemies.values()
}

export function spawnEnemy(wave: WaveConfig): number {
  const id = nextId++
  enemies.set(id, {
    id,
    t: 0,
    position: pathCurve.getPointAt(0),
    hp: wave.enemyHp,
    speed: wave.enemySpeed,
    reward: wave.reward,
  })
  useGameStore.setState((s) => ({ enemyIds: [...s.enemyIds, id] }))
  return id
}

export function damageEnemy(id: number, amount: number): void {
  const enemy = enemies.get(id)
  if (!enemy) return
  enemy.hp -= amount
  if (enemy.hp <= 0) killEnemy(id)
}

export function killEnemy(id: number): void {
  const enemy = enemies.get(id)
  if (!enemy) return
  enemies.delete(id)
  useGameStore.setState((s) => ({
    enemyIds: s.enemyIds.filter((enemyId) => enemyId !== id),
    money: s.money + enemy.reward,
  }))
}

export function leakEnemy(id: number): void {
  if (!enemies.delete(id)) return
  useGameStore.setState((s) => {
    const lives = s.lives - 1
    return {
      enemyIds: s.enemyIds.filter((enemyId) => enemyId !== id),
      lives,
      status: lives <= 0 ? 'lost' : s.status,
    }
  })
}

export function clearEnemies(): void {
  enemies.clear()
  useGameStore.setState({ enemyIds: [] })
}
