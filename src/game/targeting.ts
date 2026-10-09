import type { Vector3 } from 'three'
import type { EnemyState } from './enemies'

export type TargetMode = 'nearest'

// «В радиусе» — расстояние ≤ range, граница включена.
export function pickTarget(
  towerPosition: Vector3,
  range: number,
  enemies: Iterable<EnemyState>,
  mode: TargetMode,
): EnemyState | undefined {
  if (mode !== 'nearest') return undefined

  const rangeSq = range * range
  let target: EnemyState | undefined
  let targetDistSq = Infinity
  for (const enemy of enemies) {
    const distSq = enemy.position.distanceToSquared(towerPosition)
    if (distSq <= rangeSq && distSq < targetDistSq) {
      target = enemy
      targetDistSq = distSq
    }
  }
  return target
}
