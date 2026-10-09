import { CatmullRomCurve3, Vector3 } from 'three'
import { level1 } from './config/level1'

// Позицию брать через getPointAt(t): он параметризует по длине дуги, без рывков на изгибах.
export const pathCurve = new CatmullRomCurve3(level1.path.map(([x, y, z]) => new Vector3(x, y, z)))

export const pathLength = pathCurve.getLength()
