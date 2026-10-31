/**
 * Income-tax engine for a Colombian public-university professor (cédula general, rentas de trabajo).
 * Compares the current law (ET with Ley 2277 de 2022) against the 2026 "Rescate Económico" bill.
 * All money values are COP; tax tables are expressed in UVT.
 */

export type Law = 'current' | 'bill'
export type HealthRegime = 'special' | 'contributory'

export interface Params {
  /** Monthly remuneration (asignación básica + gastos de representación) in the first projected year. */
  startMonthly: number
  firstYear: number
  years: number
  /** Yearly salary raise from the second projected year on. */
  salaryGrowth: number
  /** Raise between the year before the reform and the first projected year. */
  transitionRaise: number
  /** When true, both raises equal inflation (IPC) and the manual raise values are ignored. */
  raisesFollowInflation: boolean
  /** Yearly growth of UVT and SMLMV. */
  inflation: number
  uvtBase: number
  smlmvBase: number
  baseYear: number
  /** Share of the monthly remuneration that is asignación básica (the rest is gastos de representación). */
  salaryShare: number
  /** Primas and bonificaciones as a share of 12 monthly remunerations. */
  benefitsShare: number
  /** Cesantías + intereses as a share of 12 monthly remunerations. */
  severanceShare: number
  healthRegime: HealthRegime
  dependents: number
  housingInterestMonthly: number
  prepaidHealthMonthly: number
  /** Voluntary pension (FPV) or AFC savings, treated as exempt income inside the global cap. */
  voluntarySavingsMonthly: number
  severanceExemption: boolean
}

/** Expected inflation (IPC); the base scenario raises salaries by this amount. */
const DEFAULT_INFLATION = 0.05

export const DEFAULT_PARAMS: Params = {
  startMonthly: 10e6,
  firstYear: 2027,
  years: 10,
  salaryGrowth: DEFAULT_INFLATION,
  transitionRaise: DEFAULT_INFLATION,
  raisesFollowInflation: true,
  inflation: DEFAULT_INFLATION,
  uvtBase: 52_374,
  smlmvBase: 1_750_905,
  baseYear: 2026,
  salaryShare: 0.5091,
  benefitsShare: 0.4637,
  severanceShare: 0.1057,
  healthRegime: 'special',
  dependents: 0,
  housingInterestMonthly: 0,
  prepaidHealthMonthly: 0,
  voluntarySavingsMonthly: 0,
  severanceExemption: false,
}

type Bracket = readonly [from: number, to: number, rate: number, fixed: number]

/** Art. 241 ET, current version. */
const TABLE_CURRENT: readonly Bracket[] = [
  [0, 1090, 0, 0],
  [1090, 1700, 0.19, 0],
  [1700, 4100, 0.28, 116],
  [4100, 8670, 0.33, 788],
  [8670, 18970, 0.35, 2296],
  [18970, 31000, 0.37, 5901],
  [31000, Infinity, 0.39, 10352],
]

/** Art. 241 ET as amended by art. 48 of the bill. */
const TABLE_BILL: readonly Bracket[] = [
  [0, 720, 0, 0],
  [720, 1090, 0.09, 0],
  [1090, 1700, 0.19, 33],
  [1700, 4100, 0.28, 149],
  [4100, 8670, 0.33, 821],
  [8670, Infinity, 0.39, 2329],
]

export const LAW_RULES = {
  current: { table: TABLE_CURRENT, globalCapUvt: 1340, exempt25CapUvt: 790, representationExempt: true, dependentUvt: 72 },
  bill: { table: TABLE_BILL, globalCapUvt: 1180, exempt25CapUvt: 630, representationExempt: false, dependentUvt: 0 },
} as const

export function taxFromTable(baseUvt: number, table: readonly Bracket[]): number {
  for (const [from, to, rate, fixed] of table) {
    if (baseUvt <= to) return baseUvt <= from ? 0 : (baseUvt - from) * rate + fixed
  }
  return 0
}

/** Fondo de Solidaridad Pensional (Ley 797 de 2003), by IBC in SMLMV. */
function solidarityRate(ibcSmlmv: number): number {
  if (ibcSmlmv < 4) return 0
  const steps: [number, number][] = [[16, 0.01], [17, 0.012], [18, 0.014], [19, 0.016], [20, 0.018]]
  return steps.find(([limit]) => ibcSmlmv <= limit)?.[1] ?? 0.02
}

/** Employee health contribution. The bill (art. 21) raises it from 1 January 2027. */
export function healthRate(law: Law, regime: HealthRegime, ibcSmlmv: number): number {
  if (law === 'current') return 0.04
  if (regime === 'special') {
    if (ibcSmlmv > 3) return 0.065
    if (ibcSmlmv > 2) return 0.055
    return 0.04
  }
  const table: [number, number][] = [[2, 0.04], [4, 0.055], [5, 0.06], [10, 0.065], [15, 0.07], [20, 0.075]]
  return table.find(([limit]) => ibcSmlmv <= limit)?.[1] ?? 0.08
}

/** Exempt share of cesantías by average monthly income in UVT (art. 206 num. 4). */
function severanceExemptShare(avgMonthlyUvt: number): number {
  const steps: [number, number][] = [[350, 1], [410, 0.9], [470, 0.8], [530, 0.6], [590, 0.4], [650, 0.2]]
  return steps.find(([limit]) => avgMonthlyUvt <= limit)?.[1] ?? 0
}

export interface YearResult {
  year: number
  monthly: number
  uvt: number
  gross: number
  contributions: number
  /** Deductions and exempt income requested inside the global cap, before the cap. */
  requestedInsideCap: number
  globalCap: number
  outsideCap: number
  taxable: number
  tax: number
  effectiveRate: number
  disposable: number
}

export function simulateYear(monthly: number, year: number, law: Law, p: Params): YearResult {
  const k = year - p.baseYear
  const uvt = p.uvtBase * (1 + p.inflation) ** k
  const smlmv = p.smlmvBase * (1 + p.inflation) ** k
  const rules = LAW_RULES[law]

  const base12 = monthly * 12
  const gross = base12 * (1 + p.benefitsShare + p.severanceShare)
  const severance = base12 * p.severanceShare

  const ibc = Math.min(monthly, 25 * smlmv)
  const ibcSmlmv = ibc / smlmv
  const contributions = ibc * 12 * (healthRate(law, p.healthRegime, ibcSmlmv) + 0.04 + solidarityRate(ibcSmlmv))
  const net = gross - contributions

  const dependent = p.dependents > 0 ? Math.min(0.1 * gross, 384 * uvt) : 0 // art. 387
  const interest = Math.min(p.housingInterestMonthly * 12, 1200 * uvt) // art. 119
  const prepaid = Math.min(p.prepaidHealthMonthly * 12, 192 * uvt) // art. 387
  const voluntary = Math.min(p.voluntarySavingsMonthly * 12, 0.3 * gross, 3800 * uvt) // arts. 126-1 y 126-4
  const avgMonthlyUvt = (base12 * (1 + p.benefitsShare)) / 12 / uvt
  const severanceExempt = p.severanceExemption ? severance * severanceExemptShare(avgMonthlyUvt) : 0

  const deductions = dependent + interest + prepaid
  const otherExempt = voluntary + severanceExempt
  const exempt25 = Math.min(0.25 * Math.max(0, net - deductions - otherExempt), rules.exempt25CapUvt * uvt)
  const requestedInsideCap = deductions + otherExempt + exempt25
  const globalCap = Math.min(0.4 * net, rules.globalCapUvt * uvt) // art. 336 num. 3
  const insideCap = Math.min(requestedInsideCap, globalCap)

  const representation = rules.representationExempt ? 0.5 * base12 * p.salaryShare : 0 // art. 206 num. 9
  const outsideCap = representation + rules.dependentUvt * uvt * Math.min(p.dependents, 4)

  const taxable = Math.max(0, net - insideCap - outsideCap)
  const tax = taxFromTable(taxable / uvt, rules.table) * uvt

  return {
    year,
    monthly,
    uvt,
    gross,
    contributions,
    requestedInsideCap,
    globalCap,
    outsideCap,
    taxable,
    tax,
    effectiveRate: tax / gross,
    disposable: gross - contributions - tax,
  }
}

export interface ProjectionRow {
  year: number
  monthly: number
  bill: YearResult
  current: YearResult
  /** Extra tax generated by each peso of raise versus the previous year (bill path). */
  taxPerPeso: number
  /** Same, including employee contributions. */
  chargesPerPeso: number
}

/** Params with the raises the simulation actually uses: inflation when raisesFollowInflation is on. */
export function resolveRaises(p: Params): Params {
  return p.raisesFollowInflation ? { ...p, transitionRaise: p.inflation, salaryGrowth: p.inflation } : p
}

/** Salary in the year before the projection, under the current law. */
export function baselineYear(input: Params): YearResult {
  const p = resolveRaises(input)
  return simulateYear(p.startMonthly / (1 + p.transitionRaise), p.firstYear - 1, 'current', p)
}

export function project(input: Params): ProjectionRow[] {
  const p = resolveRaises(input)
  const rows: ProjectionRow[] = []
  let previous = baselineYear(p)
  for (let i = 0; i < p.years; i++) {
    const year = p.firstYear + i
    const monthly = p.startMonthly * (1 + p.salaryGrowth) ** i
    const bill = simulateYear(monthly, year, 'bill', p)
    const current = simulateYear(monthly, year, 'current', p)
    const raise = bill.gross - previous.gross
    rows.push({
      year,
      monthly,
      bill,
      current,
      taxPerPeso: raise > 0 ? (bill.tax - previous.tax) / raise : Infinity,
      chargesPerPeso: raise > 0 ? (bill.tax + bill.contributions - previous.tax - previous.contributions) / raise : Infinity,
    })
    previous = bill
  }
  return rows
}

export interface TransitionPoint {
  pct: number
  taxPerPeso: number
  chargesPerPeso: number
}

export interface TransitionResult {
  baselineMonthly: number
  points: TransitionPoint[]
  /** Smallest raise (in %) at which the extra tax is below each peso of raise; 0 when any raise qualifies. */
  breakevenPct: number | null
  /** Below this raise the extra tax exceeds the raise by more than 10%. */
  redUntilPct: number | null
  /** From this raise on, each peso keeps at least 10 cents after tax. */
  greenFromPct: number | null
}

export const ZONE_LIMITS = { gain: 0.9, loss: 1.1 } as const

/** Tax per peso of raise when moving from the current law to the bill, by size of the transition raise. */
export function transitionCurve(input: Params, maxPct = 30, stepPct = 0.5): TransitionResult {
  const p = resolveRaises(input)
  const before = baselineYear(p)
  const points: TransitionPoint[] = []
  for (let tenth = stepPct * 10; tenth <= maxPct * 10; tenth += stepPct * 10) {
    const pct = tenth / 10
    const after = simulateYear(before.monthly * (1 + pct / 100), p.firstYear, 'bill', p)
    const raise = after.gross - before.gross
    points.push({
      pct,
      taxPerPeso: (after.tax - before.tax) / raise,
      chargesPerPeso: (after.tax + after.contributions - before.tax - before.contributions) / raise,
    })
  }
  // 0 means any raise already stays below the limit (e.g. no tax at all on this salary).
  const firstBelow = (limit: number) => {
    const index = points.findIndex((pt) => pt.taxPerPeso < limit)
    if (index === -1) return null
    return index === 0 ? 0 : points[index].pct
  }
  return {
    baselineMonthly: before.monthly,
    points,
    breakevenPct: firstBelow(1),
    redUntilPct: firstBelow(ZONE_LIMITS.loss),
    greenFromPct: firstBelow(ZONE_LIMITS.gain),
  }
}

export type Zone = 'gain' | 'balance' | 'loss'

export function zoneOf(taxPerPeso: number): Zone {
  if (taxPerPeso > ZONE_LIMITS.loss) return 'loss'
  if (taxPerPeso >= ZONE_LIMITS.gain) return 'balance'
  return 'gain'
}
