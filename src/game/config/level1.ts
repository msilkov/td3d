export type Vec3 = [number, number, number]

export type WaveConfig = {
  count: number      // врагов в волне
  interval: number   // секунд между спавнами
  enemyHp: number
  enemySpeed: number // мировых единиц в секунду
  reward: number     // денег за убийство
}

export type LevelConfig = {
  path: Vec3[]         // контрольные точки кривой
  slots: Vec3[]        // позиции слотов под башни
  waves: WaveConfig[]
  wavePause: number    // секунд от зачистки волны до первого спавна следующей
  startMoney: number
  startLives: number
}

// Поле 32×18 с центром в начале координат: x ∈ [-16, 16], z ∈ [-9, 9].
export const level1: LevelConfig = {
  path: [
    [-16, 0, -5],
    [-9, 0, -5],
    [-6, 0, 3],
    [0, 0, 5],
    [3, 0, -3],
    [9, 0, -5],
    [11, 0, 3],
    [16, 0, 4],
  ],
  slots: [
    [-12, 0, -2],
    [-4, 0, 1],
    [-5, 0, 6],
    [4, 0, 3],
    [6, 0, -1],
    [13, 0, 0],
  ],
  // Временный состав до баланса (7.7): врагов меньше startLives, чтобы без башен партия доходила до победы.
  waves: [
    { count: 3, interval: 1, enemyHp: 10, enemySpeed: 3, reward: 5 },
    { count: 5, interval: 1, enemyHp: 10, enemySpeed: 3, reward: 5 },
    { count: 7, interval: 1, enemyHp: 10, enemySpeed: 3, reward: 5 },
  ],
  wavePause: 5,
  startMoney: 100,
  startLives: 20,
}
