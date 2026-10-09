export type TowerType = {
  id: string
  cost: number
  range: number      // радиус в мировых единицах
  damage: number
  cooldown: number   // секунд между выстрелами
}

// Временные значения до баланса (7.7).
export const towerTypes = {
  basic: { id: 'basic', cost: 50, range: 4, damage: 4, cooldown: 0.5 },
} satisfies Record<string, TowerType>

export type TowerTypeId = keyof typeof towerTypes
