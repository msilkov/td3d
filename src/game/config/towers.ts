export type TowerType = {
  id: string
  cost: number
  range: number      // радиус в мировых единицах
  damage: number
  cooldown: number   // секунд между выстрелами
}

export const towerTypes = {
  basic: { id: 'basic', cost: 50, range: 4, damage: 4, cooldown: 0.5 },
} satisfies Record<string, TowerType>

export type TowerTypeId = keyof typeof towerTypes
