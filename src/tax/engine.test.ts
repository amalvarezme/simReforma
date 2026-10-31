import { describe, expect, it } from 'vitest'
import { DEFAULT_PARAMS, baselineYear, project, simulateYear, transitionCurve, zoneOf, type Params } from './engine'

const M = 1e6
// Reference model: 15% raises, independent of the base scenario defaults.
const noBenefits: Params = {
  ...DEFAULT_PARAMS,
  raisesFollowInflation: false,
  salaryGrowth: 0.15,
  transitionRaise: 0.15,
  dependents: 0,
  housingInterestMonthly: 0,
  prepaidHealthMonthly: 0,
  voluntarySavingsMonthly: 0,
  severanceExemption: false,
}

describe('DEFAULT_PARAMS', () => {
  it('raises salaries by inflation (IPC) in the base scenario', () => {
    expect(DEFAULT_PARAMS.transitionRaise).toBe(DEFAULT_PARAMS.inflation)
    expect(DEFAULT_PARAMS.salaryGrowth).toBe(DEFAULT_PARAMS.inflation)
    expect(DEFAULT_PARAMS.raisesFollowInflation).toBe(true)
  })
})

describe('raisesFollowInflation', () => {
  const linked: Params = { ...noBenefits, raisesFollowInflation: true, inflation: 0.08 }
  const manual: Params = { ...noBenefits, raisesFollowInflation: false, inflation: 0.08, salaryGrowth: 0.08, transitionRaise: 0.08 }

  it('uses inflation for both raises, ignoring the manual raise values', () => {
    expect(project(linked)).toEqual(project(manual))
    expect(transitionCurve(linked)).toEqual(transitionCurve(manual))
    expect(baselineYear(linked)).toEqual(baselineYear(manual))
  })

  it('keeps the manual raises when switched off', () => {
    expect(project({ ...linked, raisesFollowInflation: false })).toEqual(project({ ...manual, salaryGrowth: 0.15, transitionRaise: 0.15 }))
  })
})

describe('simulateYear', () => {
  it('reproduces the reference model under the bill and the current law (no personal benefits)', () => {
    expect(simulateYear(10 * M, 2027, 'bill', noBenefits).tax).toBeCloseTo(21_184_515, -3)
    expect(simulateYear(10 * M, 2027, 'current', noBenefits).tax).toBeCloseTo(9_193_203, -3)
    expect(simulateYear(30 * M, 2027, 'bill', noBenefits).tax).toBeCloseTo(132_536_435, -3)
    expect(simulateYear(30 * M, 2027, 'current', noBenefits).tax).toBeCloseTo(99_867_108, -3)
  })

  it('builds annual income from salary, benefits and severance shares', () => {
    const year = simulateYear(30 * M, 2027, 'bill', noBenefits)
    expect(year.gross).toBeCloseTo(564_984_000, -2)
    expect(year.contributions).toBeCloseTo(42_120_000, -2)
  })

  it('caps personal benefits with the global 40% / UVT limit', () => {
    const withBenefits: Params = {
      ...noBenefits,
      dependents: 1,
      housingInterestMonthly: 3.5 * M,
      prepaidHealthMonthly: 0.15 * M,
      severanceExemption: true,
    }
    expect(simulateYear(10 * M, 2027, 'bill', withBenefits).tax).toBeCloseTo(12_715_639, -3)
    expect(simulateYear(10 * M, 2027, 'current', withBenefits).tax).toBeCloseTo(2_293_164, -3)
    expect(simulateYear(30 * M, 2027, 'bill', withBenefits).tax).toBeCloseTo(121_874_846, -3)
    expect(simulateYear(30 * M, 2027, 'current', withBenefits).tax).toBeCloseTo(88_579_306, -3)
  })

  it('applies the contributory health table when the regime is not special', () => {
    const special = simulateYear(30 * M, 2027, 'bill', noBenefits)
    const contributory = simulateYear(30 * M, 2027, 'bill', { ...noBenefits, healthRegime: 'contributory' })
    // 30M ≈ 16.3 SMLMV in 2027: special regime pays 6.5%, contributory table pays 7.5%.
    expect(contributory.contributions - special.contributions).toBeCloseTo(30 * M * 12 * 0.01, -2)
  })
})

describe('project', () => {
  it('projects ten years with a 15% raise and the 2036 bill tax', () => {
    const rows = project({ ...noBenefits, startMonthly: 10 * M })
    expect(rows).toHaveLength(10)
    expect(rows[9].year).toBe(2036)
    expect(rows[9].bill.tax).toBeCloseTo(139_487_265, -3)
  })

  it('measures tax per peso of raise against the previous year', () => {
    const rows = project({ ...noBenefits, startMonthly: 10 * M })
    expect(rows[0].taxPerPeso).toBeCloseTo(0.61, 2)
    expect(rows[1].taxPerPeso).toBeLessThan(0.3)
  })
})

describe('transitionCurve', () => {
  it('finds the 2027 raise where the extra tax equals the raise', () => {
    expect(transitionCurve({ ...noBenefits, startMonthly: 10 * M }).breakevenPct).toBe(7.5)
    expect(transitionCurve({ ...noBenefits, startMonthly: 20 * M }).breakevenPct).toBe(8.5)
    expect(transitionCurve({ ...noBenefits, startMonthly: 30 * M }).breakevenPct).toBe(8)
  })

  it('reports 0 when any raise already stays below 1:1 (no tax to absorb it)', () => {
    const result = transitionCurve({ ...noBenefits, startMonthly: 3 * M })
    expect(result.points[0].taxPerPeso).toBe(0)
    expect(result.breakevenPct).toBe(0)
    expect(result.greenFromPct).toBe(0)
  })
})

describe('zoneOf', () => {
  it('marks the transition year red when the 2027 raise is too small', () => {
    const rows = project({ ...noBenefits, startMonthly: 30 * M, transitionRaise: 0.03 })
    expect(rows[0].taxPerPeso).toBeGreaterThan(1.1)
    expect(zoneOf(rows[0].taxPerPeso)).toBe('loss')
    expect(zoneOf(rows[1].taxPerPeso)).toBe('gain')
  })

  it('classifies the equilibrium band between $0.90 and $1.10', () => {
    expect(zoneOf(0.89)).toBe('gain')
    expect(zoneOf(1)).toBe('balance')
    expect(zoneOf(1.11)).toBe('loss')
  })
})
