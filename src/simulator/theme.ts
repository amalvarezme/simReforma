import type { Zone } from '../tax/engine'

/** Validated categorical slots (blue, orange) on the light surface; neutral gray for the reference law. */
export const COLORS = {
  salary: '#2a78d6',
  taxBill: '#eb6834',
  taxCurrent: '#8a8984',
  grid: '#ecebe7',
  axis: '#c9c8c3',
  text: '#52514e',
} as const

export const ZONE_FILL: Record<Zone, string> = {
  gain: 'rgba(0, 131, 0, 0.13)',
  balance: 'rgba(237, 161, 0, 0.28)',
  loss: 'rgba(227, 73, 72, 0.20)',
}

export const ZONE_LABEL: Record<Zone, string> = {
  gain: 'Queda ganancia: menos de $0,90 de impuesto por cada $1',
  balance: 'Equilibrio: entre $0,90 y $1,10 de impuesto por cada $1',
  loss: 'El impuesto supera el aumento: más de $1,10 por cada $1',
}
